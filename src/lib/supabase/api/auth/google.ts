import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import checkCompanyId from "@/middleware/checkCompanyId";

export default checkCompanyId(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method not allowed", key: "method_not_allowed" });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

  const { code } = req.body;
  const company_id = req.headers["company-id"];

  if (!code) {
    return res.status(400).json({
      error: "Authorization code is required",
      key: "authorization_code_required",
    });
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
    return res
      .status(400)
      .json({ error: errorData.error, key: "google_auth_failed" });
  }

  const tokens = await tokenResponse.json();
  const idToken = tokens.id_token;

  const decodedToken = jwt.decode(idToken) as { email: string; name: string };

  if (!decodedToken || !decodedToken.email) {
    return res
      .status(400)
      .json({ error: "Invalid ID token", key: "invalid_id_token" });
  }

  const email = decodedToken.email;
  const fullName = decodedToken.name;

  const supabase = createServerSupabaseClient({ req, res });

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
          is_active: false,
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
      return res
        .status(500)
        .json({ error: "Failed to create user", key: "user_creation_failed" });
    }

    loginUser = createdUser;
  }

  if (!loginUser) {
    return res.status(403).json({
      error: "Failed to authenticate user",
      key: "user_authentication_failed",
    });
  }

  if (loginUser.is_banned) {
    return res.status(403).json({
      error: "User is banned",
      key: "user_banned",
    });
  }

  const company = loginUser?.company[0];

  if (!company || company.status !== "active") {
    return res
      .status(403)
      .json({ error: "Company is not active", key: "company_not_active" });
  }

  const accessToken = jwt.sign(
    {
      user_id: loginUser.id,
      email: loginUser.email,
      company_id: company_id,
      provider: "google",
    },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    {
      user_id: loginUser.id,
      email: loginUser.email,
      company_id: company_id,
      provider: "google",
    },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: "7d" }
  );

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
    return res
      .status(500)
      .json({ error: "Failed to store tokens", key: "token_storage_failed" });
  }

  const authentication = loginUser.authentication[0];

  await supabase.from("audit_logs").insert({
    auth_id: authentication.id,
    event: "login",
    ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    user_agent: req.headers["user-agent"],
    origin: req.headers.origin || "unknown",
    metadata: user,
  });

  res.setHeader("Set-Cookie", [
    `accessToken=${accessToken}; Path=/; Max-Age=3600`,
    `refreshToken=${refreshToken}; Path=/; Max-Age=604800`,
  ]);

  return res.status(200).json({
    user,
    token: {
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  });
});
