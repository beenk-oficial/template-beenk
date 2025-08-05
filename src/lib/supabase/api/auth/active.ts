import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { activationToken } = req.body;

  if (!activationToken) {
    return res.status(400).json({ error: "Activation token is required" });
  }

  const supabase = createServerSupabaseClient({ req, res });

  try {
    // Verify activation token
    const decodedToken = jwt.verify(
      activationToken,
      process.env.ACCESS_TOKEN_SECRET!
    ) as {
      userId: string;
      email: string;
    };

    const { userId, email } = decodedToken;

    // Update user status to active
    const { error: updateError } = await supabase
      .from("users")
      .update({ is_active: true })
      .eq("id", userId)
      .eq("email", email);

    if (updateError) {
      return res.status(500).json({ error: "Failed to activate account" });
    }

    // Audit activation event
    await supabase.from("audit_logs").insert({
      user_id: userId,
      event: "account_activation",
      ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      user_agent: req.headers["user-agent"],
      origin: req.headers.origin || "unknown",
    });

    return res.status(200).json({ message: "Account activated successfully" });
  } catch (error) {
    console.error("Activation error:", error);
    return res.status(500).json({ error: "Unexpected error occurred" });
  }
}
