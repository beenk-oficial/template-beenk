import bcrypt from "bcryptjs";
import type { Company } from "@/types";
import { supabase } from "@/lib/supabase";
import { SignJWT, type JWTPayload } from 'jose';
import { jwtDecode } from "jwt-decode";
import { getCookieValue } from "@/utils";

const accessSecret = import.meta.env.VITE_ACCESS_TOKEN_SECRET!;
const refreshSecret = import.meta.env.VITE_REFRESH_TOKEN_SECRET!;

async function generateJwtToken(
    payload: JWTPayload,
    secret: string,
    expiresIn: string
): Promise<string> {
    const encodedSecret = new TextEncoder().encode(secret);
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(expiresIn)
        .sign(encodedSecret);
}

async function generateAudioLog(auth_id: string | null, event: string, metadata: any) {
    const ip = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip);

    await supabase.from("audit_logs").insert({
        auth_id,
        event,
        ip_address: ip || "unknown",
        user_agent: navigator.userAgent,
        origin: window.location.origin || "unknown",
        metadata,
    });
}

export async function signinWithEmail(data: {
    email: string;
    password: string;
    company_id: string;
}) {
    const { email, password, company_id } = data;

    if (!email || !password) {
        return {
            error: "Email and password are required",
            key: "missing_credentials",
        };
    }

    const { data: user, error } = await supabase
        .from("users")
        .select(
            `
      id,
      full_name,
      company_id,
      type,
      is_active,
      is_banned,
      email,
      company:companies (
        status
      ),
      authentication:authentications (
        id,
        provider,
        password_hash
      )
      `
        )
        .eq("company_id", company_id)
        .eq("email", email)
        .single();

    if (error || !user) {
        return { error: "Invalid email or password", key: "invalid_credentials" }
    }

    if (!user.is_active) {
        return {
            error: "User is not active",
            key: "user_not_active",
        };
    }

    if (user.is_banned) {
        return {
            error: "User is banned",
            key: "user_banned",
        };
    }

    const authentication = user.authentication[0];

    const isProviderValid = authentication.provider === "email";
    if (!isProviderValid) {
        return {
            error: "Invalid authentication provider",
            key: "invalid_auth_provider",
        };
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        authentication.password_hash
    );

    if (!isPasswordValid) {
        return {
            error: "Invalid email or password",
            key: "invalid_credentials",
        };
    }

    const company = user.company as unknown as Company;

    if (!company || company?.status !== "active") {
        return {
            error: "Company is not active",
            key: "company_not_active",
        };
    }

    const accessToken = await generateJwtToken({
        user_id: user.id,
        email: user.email,
        company_id: company_id,
        provider: "email",
    }, accessSecret, '1h');

    const refreshToken = await generateJwtToken({
        user_id: user.id,
        email: user.email,
        company_id: company_id,
        provider: "email",
    }, refreshSecret, '7d');


    const { error: tokenError } = await supabase
        .from("authentications")
        .update({
            access_token: accessToken,
            access_token_expires_at: new Date(Date.now() + 3600000),
            refresh_token: refreshToken,
            refresh_token_expires_at: new Date(Date.now() + 604800000),
            last_login: new Date(),
        })
        .eq("id", authentication.id);

    if (tokenError) {
        return {
            error: "Failed to store refresh token",
            key: "token_storage_failed",
        };
    }

    generateAudioLog(authentication.id, "login", user)

    return {
        user,
        token: {
            access_token: accessToken,
            refresh_token: refreshToken,
        },
    };

}

export async function signinWithGoogle(data: {
    code: string;
    company_id: string;
}) {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET!;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI!;

    const { code, company_id } = data;

    if (!code) {
        return {
            error: "Authorization code is required",
            key: "authorization_code_required",
        };
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
        }),
    });

    if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        return { error: errorData.error, key: "google_auth_failed" };
    }

    const tokens = await tokenResponse.json();
    const idToken = tokens.id_token;

    const decodedToken = jwtDecode(idToken) as { email: string; name: string };

    if (!decodedToken || !decodedToken.email) {
        return { error: "Invalid ID token", key: "invalid_id_token" };
    }

    const email = decodedToken.email;
    const fullName = decodedToken.name;

    let loginUser = null;
    const { data: user, error } = await supabase
        .from("users")
        .select(
            `
      id,
      company_id,
      type,
      is_active,
      is_banned,
      email,
      company:companies (
        status
      ),
      authentication:authentications (
        id,
        provider,
        password_hash
      )
      `
        )
        .eq("company_id", company_id)
        .eq("email", email)
        .single();

    loginUser = user;

    if (error || !user) {
        const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert([
                {
                    email,
                    full_name: fullName,
                    company_id,
                    type: "user",
                    is_active: true,
                },
            ])
            .select("*")
            .single();

        await supabase.from("authentications").insert([
            {
                user_id: newUser.id,
                provider: "google",
                email,
                password_hash: "",
            },
        ]);

        const { data: createdUser, error } = await supabase
            .from("users")
            .select(
                `
        id,
        full_name,
        company_id,
        type,
        is_active,
        is_banned,
        email,
        company:companies (
          status
        ),
        authentication:authentications (
          id,
          provider,
          password_hash
        )
        `
            )
            .eq("id", newUser.id)
            .single();

        if (createError || error) {
            return { error: "Failed to create user", key: "user_creation_failed" };
        }

        loginUser = createdUser;
    }

    if (!loginUser) {
        return { error: "Failed to authenticate user", key: "user_authentication_failed" };
    }

    if (loginUser.is_banned) {
        return {
            error: "User is banned",
            key: "user_banned",
        };
    }

    const company = loginUser?.company[0];

    if (!company || company.status !== "active") {
        return { error: "Company is not active", key: "company_not_active" };
    }

    const accessToken = await generateJwtToken({
        user_id: user?.id,
        email: user?.email,
        company_id,
        provider: "google",
    }, accessSecret, '1h');

    const refreshToken = await generateJwtToken({
        user_id: user?.id,
        email: user?.email,
        company_id,
        provider: "google",
    }, refreshSecret, '7d');


    const { error: tokenError } = await supabase
        .from("authentications")
        .update({
            access_token: accessToken,
            access_token_expires_at: new Date(Date.now() + 3600000),
            refresh_token: refreshToken,
            refresh_token_expires_at: new Date(Date.now() + 604800000),
            last_login: new Date(),
        })
        .eq("email", email)
        .eq("provider", "google");

    if (tokenError) {
        return { error: "Failed to store tokens", key: "token_storage_failed" };
    }

    const authentication = loginUser.authentication[0];

    generateAudioLog(authentication.id, "login", user)

    return {
        user,
        token: {
            access_token: accessToken,
            refresh_token: refreshToken,
        },
    };
}

export async function signup(data: {
    email: string;
    password: string;
    full_name: string;
    company_id: string;
}) {
    const { email, password, full_name, company_id } = data;

    if (!email || !password || !full_name) {
        return {
            error: "Email, password, and full_name are required",
            key: "missing_credentials",
        };
    }

    try {
        const { data: userExists } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single();

        if (userExists) {
            return {
                error: "User already exists",
                key: "user_already_exists",
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: newUser, error: userCreationError } = await supabase
            .from("users")
            .insert([
                {
                    email,
                    full_name,
                    type: "user",
                    company_id,
                    is_active: true,
                },
            ])
            .select("*")
            .single();

        if (userCreationError) {
            return {
                error: "Failed to create user",
                key: "user_creation_failed",
            };
        }

        const { data: authentication, error: authenticationError } = await supabase
            .from("authentications")
            .insert([
                {
                    user_id: newUser.id,
                    provider: "email",
                    email,
                    password_hash: hashedPassword,
                },
            ])
            .select("*")
            .single();

        if (authenticationError) {
            return {
                error: "Failed to create authentication",
                key: "user_authentication_failed",
            };
        }

        generateAudioLog(authentication.id, "signup", {
            email,
            full_name,
        })

        //@TODO: Send email verification to active user

        return {
            user: newUser,
        };
    } catch (error) {
        return {
            error: "Unexpected error occurred",
            key: "error_occurred",
        };
    }
}

export async function requestPasswordReset(data: {
    email: string;
    company_id: string;
}) {
    const { email, company_id } = data;

    if (!email) {
        return {
            error: "Email is required",
            key: "missing_email",
        };
    }

    try {
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id, email, company_id")
            .eq("email", email)
            .eq("company_id", company_id)
            .single();

        if (userError || !user) {
            return {
                error: "User not found",
                key: "user_not_found",
            };
        }

        const resetToken = await generateJwtToken(
            { user_id: user.id, email, company_id },
            accessSecret,
            '7h'
        );

        const { error: tokenError } = await supabase
            .from("authentications")
            .update({
                reset_token: resetToken,
                expires_reset_token_at: new Date(Date.now() + (3600000 * 7)),
            })
            .eq("user_id", user.id)
            .eq("provider", "email");

        if (tokenError) {
            return {
                error: "Failed to store reset token",
                key: "token_storage_failed",
            };
        }

        //@TODO: Here you would typically send the reset token to the user's email

        generateAudioLog(null, "password_reset_requested", {
            email,
            resetToken,
        });

        return {
            message: "Password reset email sent",
            key: "password_reset_email_sent",
        };
    } catch (error) {
        return {
            error: "Unexpected error occurred",
            key: "error_occurred",
        };
    }
}

export async function validatePasswordResetToken(data: { token: string }) {
    const { token } = data;

    if (!token || typeof token !== "string") {
        return { error: "Token is required", key: "missing_token" };
    }

    try {
        let decodedToken;

        decodedToken = jwtDecode(token) as { user_id: string; email: string; company_id: string };

        if (!decodedToken.user_id || !decodedToken.email || !decodedToken.company_id) {
            throw new Error("Invalid token claims");
        }

        const { data: resetEntry, error: dbError } = await supabase
            .from("authentications")
            .select("id, user_id, expires_reset_token_at")
            .eq("reset_token", token)
            .single();

        if (dbError || !resetEntry) {
            return { error: "Invalid or expired token", key: "invalid_token" };
        }

        const isExpired = new Date(resetEntry.expires_reset_token_at) < new Date();
        if (isExpired) {
            return { error: "Token has expired", key: "token_expired" };
        }

        generateAudioLog(resetEntry.id, "validatePasswordResetToken", decodedToken);

        return true;
    } catch (error) {
        return { error: "Unexpected error occurred", key: "error_occurred" };
    }
}

export async function changePassword(data: {
    token: string;
    new_password: string;
}) {
    const { token, new_password } = data;
    const decodedToken = jwtDecode(token) as { user_id: string; email: string; company_id: string };

    const { email, company_id } = decodedToken;

    if (!email || !new_password || !company_id) {
        return {
            error: "User email and new password are required",
            key: "missing_fields",
        };
    }

    try {
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id, email")
            .eq("email", email)
            .eq("company_id", company_id)
            .single();

        if (userError || !user) {
            return { error: "User not authenticated", key: "user_not_authenticated" };
        }

        const { data: authData, error: authError } = await supabase
            .from("authentications")
            .select("id, password_hash")
            .eq("user_id", user.id)
            .single();

        if (authError || !authData) {
            return { error: "Authentication data not found", key: "auth_not_found" };
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        const { error: updateError } = await supabase
            .from("authentications")
            .update({ password_hash: hashedPassword })
            .eq("user_id", user.id);

        if (updateError) {
            return { error: "Failed to update password", key: "update_failed" };
        }

        generateAudioLog(authData.id, "password_changed", data);

        return true;
    } catch (error) {
        return { error: "Unexpected error occurred", key: "error_occurred" };
    }
}

export async function logout(data: { company_id: string; email: string }) {
    try {
        const { company_id, email } = data;

        const { data: user, error: userError } = await supabase
            .from("users")
            .select(
                "id"
            )
            .eq("company_id", company_id)
            .eq("email", email)
            .single();

        if (userError || !user) {
            return { error: "User not authenticated", key: "user_not_authenticated" };
        }

        const { data: authData, error: authError } = await supabase
            .from("authentications")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (authError || !authData) {
            return { error: "Authentication data not found", key: "auth_not_found" };
        }

        const { error: tokenError } = await supabase
            .from("authentications")
            .update({
                access_token: null,
                refresh_token: null,
                access_token_expires_at: null,
                refresh_token_expires_at: null,
            })
            .eq("id", authData.id);

        if (tokenError) {
            return { error: "Failed to clear tokens", key: "clear_tokens_failed" };
        }

        generateAudioLog(authData.id, "logout", {
            company_id,
            email,
        });

        return true;
    } catch (error) {
        return { error: "Unexpected error occurred", key: "error_occurred" };
    }
}


export async function refreshToken() {
    const refreshToken = getCookieValue("refreshToken");

    if (!refreshToken) {
        return {
            error: "Refresh token is required",
            key: "missing_refresh_token",
        };
    }

    try {
        const decoded = jwtDecode(refreshToken) as {
            user_id: string;
            company_id: string;
            email: string;
        };

        const { user_id, company_id, email } = decoded;

        if (!user_id || !company_id || !email) {
            return {
                error: "Invalid refresh token",
                key: "invalid_refresh_token",
            };
        }

        const { data: user } = await supabase
            .from("users")
            .select(
                `
        id,
        full_name,
        company_id,
        type,
        is_active,
        is_banned,
        email,
        company:companies (
          status
        ),
        authentication:authentications (
          id,
          provider,
          password_hash
        )
      `
            )
            .eq("id", user_id)
            .eq("company_id", company_id)
            .eq("email", email)
            .single();

        const { data: authentication, error } = await supabase
            .from("authentications")
            .select("id")
            .eq("user_id", user_id)
            .eq("refresh_token", refreshToken)
            .single();

        if (error || !authentication || !user) {
            return {
                error: "Invalid refresh token",
                key: "invalid_refresh_token",
            };
        }

        const newAccessToken = await generateJwtToken(
            { user_id, email, company_id, provider: "email" },
            accessSecret,
            "7h"
        );

        const newRefreshToken = await generateJwtToken(
            { user_id, email, company_id, provider: "email" },
            refreshSecret,
            "7d"
        );

        await supabase
            .from("authentications")
            .update({
                access_token: newAccessToken,
                access_token_expires_at: new Date(Date.now() + 3600000 * 7),
                refresh_token: newRefreshToken,
                refresh_token_expires_at: new Date(Date.now() + 604800000),
            })
            .eq("id", authentication.id);

        return {
            user,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    } catch (error) {
        return {
            error: "Invalid refresh token",
            key: "invalid_refresh_token",
        };
    }
}


export async function activeUser(data: { activationToken: string }) {
    const { activationToken } = data;

    if (!activationToken) {
        return { error: "Activation token is required", key: "missing_activation_token" };
    }

    try {
        const decodedToken = jwtDecode(activationToken) as { userId: string; email: string };

        const { userId, email } = decodedToken;

        if (!userId || !email) {
            return { error: "Invalid activation token", key: "invalid_activation_token" };
        }

        const { error: updateError } = await supabase
            .from("users")
            .update({ is_active: true })
            .eq("id", userId)
            .eq("email", email)

        if (updateError) {
            return { error: "Failed to activate account", key: "activation_failed" };
        }

        const { data: authentication } = await supabase
            .from("authentications")
            .select("id")
            .eq("user_id", userId)
            .single();


        if (authentication) {
            generateAudioLog(authentication.id, "account_activation", {
                userId,
                email,
            });
        }



        return true;
    } catch (error) {
        return { error: "Unexpected error occurred", key: "error_occurred" };
    }
}


export async function sendActivationEmail(data: { email: string, company_id: string }) {
    const { email, company_id } = data;

    if (!email) {
        return { error: "Email is required", key: "missing_email" };
    }

    try {
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id, email, is_active")
            .eq("email", email)
            .eq("company_id", company_id)
            .single();

        if (userError || !user) {
            return { error: "User not found", key: "user_not_found" };
        }

        if (user.is_active) {
            return { error: "Account is already active", key: "already_active" };
        }

        const activationToken = await generateJwtToken(
            { userId: user.id, email: user.email },
            accessSecret,
            "1h"
        );

        // Send activation email (mocked for now)
        console.log(
            `Send email to ${email} with activation link: ${import.meta.env.VITE_APP_URL || ""}/activate?token=${activationToken}`
        );

        return true
    } catch (error) {
        return { error: "Unexpected error occurred", key: "error_occurred" };
    }
}
