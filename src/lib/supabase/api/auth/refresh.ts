import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createServerSupabaseClient({ req, res });

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method not allowed", key: "method_not_allowed" });
  }

  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: "Refresh token is required",
      key: "missing_refresh_token",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);

    const { user_id, company_id, email } = decoded as {
      user_id: string;
      company_id: string;
      email: string;
    };

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
      return res.status(401).json({
        error: "Invalid refresh token",
        key: "invalid_refresh_token",
      });
    }

    const newAccessToken = jwt.sign(
      { user_id, email, company_id, provider: "email" },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "1h" }
    );

    const newRefreshToken = jwt.sign(
      { user_id, email, company_id, provider: "email" },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    await supabase
      .from("authentications")
      .update({
        access_token: newAccessToken,
        access_token_expires_at: new Date(Date.now() + 3600000),
        refresh_token: newRefreshToken,
        refresh_token_expires_at: new Date(Date.now() + 604800000),
      })
      .eq("id", authentication.id);

    return res.status(200).json({
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({
      error: "Invalid refresh token",
      key: "invalid_refresh_token",
    });
  }
}
