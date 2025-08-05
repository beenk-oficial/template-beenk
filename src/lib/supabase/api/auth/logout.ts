import { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createServerSupabaseClient({ req, res });

  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken || !refreshToken) {
      return res.status(400).json({ error: "No tokens provided" });
    }

    const { decodedToken } = accessToken
      ? JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString())
      : null;
    const companyId = decodedToken?.company_id;
    const email = decodedToken?.email;

    if (!companyId || !email) {
      return res.status(400).json({ error: "Invalid access token" });
    }

    const { data: user, error: userError } = await supabase
      .from("company_users")
      .select(
        `
        company_id,
        user:users!inner (
          id
        ),
        authentication:authentications (
          id
        )
        `
      )
      .eq("company_id", companyId)
      .eq("user.email", email)
      .single();

    if (userError || !user || !user.authentication?.length) {
      return res
        .status(404)
        .json({ error: "User or authentication not found" });
    }

    const authenticationId = user.authentication[0].id;

    const { error: tokenError } = await supabase
      .from("authentications")
      .update({
        access_token: null,
        refresh_token: null,
        access_token_expires_at: null,
        refresh_token_expires_at: null,
      })
      .eq("id", authenticationId);

    if (tokenError) {
      return res.status(500).json({ error: "Failed to clear tokens" });
    }

    const auditError = await supabase.from("audit_logs").insert({
      authentication_id: authenticationId,
      event: "logout",
      ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      user_agent: req.headers["user-agent"],
      origin: req.headers.origin || "unknown",
      metadata: {
        company_id: companyId,
        email,
      },
    });

    if (auditError.error) {
      console.error("Failed to log audit event:", auditError.error);
    }

    res.setHeader("Set-Cookie", [
      `accessToken=; Path=/; Max-Age=0`,
      `refreshToken=; Path=/; Max-Age=0`,
    ]);

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Unexpected error occurred" });
  }
}
