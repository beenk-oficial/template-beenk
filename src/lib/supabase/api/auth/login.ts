import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import checkCompanyId from "@/middleware/checkCompanyId";
import type { Company } from "@/types";

export default checkCompanyId(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createServerSupabaseClient({ req, res });

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method not allowed", key: "method_not_allowed" });
  }

  const { email, password } = req.body;
  const company_id = req.headers["company-id"];

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
      key: "missing_credentials",
    });
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
    return res
      .status(401)
      .json({ error: "Invalid email or password", key: "invalid_credentials" });
  }

  if (!user.is_active) {
    return res.status(403).json({
      error: "User is not active",
      key: "user_not_active",
    });
  }

  if (user.is_banned) {
    return res.status(403).json({
      error: "User is banned",
      key: "user_banned",
    });
  }

  const authentication = user.authentication[0];

  const isProviderValid = authentication.provider === "email";
  if (!isProviderValid) {
    return res.status(401).json({
      error: "Invalid authentication provider",
      key: "invalid_auth_provider",
    });
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    authentication.password_hash
  );

  if (!isPasswordValid) {
    return res
      .status(401)
      .json({ error: "Invalid email or password", key: "invalid_credentials" });
  }

  const company = user.company as unknown as Company;

  if (!company || company?.status !== "active") {
    return res.status(403).json({
      error: "Company is not active",
      key: "company_not_active",
    });
  }

  const accessToken = jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      company_id: company_id,
      provider: "email",
    },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      company_id: company_id,
      provider: "email",
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
    .eq("id", authentication.id);

  console.log("tokenError", tokenError);

  if (tokenError) {
    return res.status(500).json({
      error: "Failed to store refresh token",
      key: "token_storage_failed",
    });
  }

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
