import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Token is required" });
  }

  const supabase = createServerSupabaseClient({ req, res });

  try {
    // Decode and verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);

    // Fetch token entry from database
    const { data: resetEntry, error: dbError } = await supabase
      .from("password_resets")
      .select("user_id, expires_at")
      .eq("reset_token", token)
      .single();

    if (dbError || !resetEntry) {
      return res.status(404).json({ error: "Invalid or expired token" });
    }

    // Check if token is expired
    const isExpired = new Date(resetEntry.expires_at) < new Date();
    if (isExpired) {
      return res.status(410).json({ error: "Token has expired" });
    }

    // Audit token validation event
    await supabase.from("audit_logs").insert({
      user_id: resetEntry.user_id,
      event: "validate_token_password",
      ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      user_agent: req.headers["user-agent"],
      origin: req.headers.origin || "unknown",
    });

    return res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    console.error("Token validation error:", error);
    return res.status(500).json({ error: "Unexpected error occurred" });
  }
}
