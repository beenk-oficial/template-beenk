import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current password and new password are required" });
  }

  const supabase = createServerSupabaseClient({ req, res });

  try {
    // Get authenticated user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", req.headers["x-user-email"])
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Fetch user authentication data
    const { data: authData, error: authError } = await supabase
      .from("authentications")
      .select("password_hash")
      .eq("user_id", user.id)
      .single();

    if (authError || !authData) {
      return res.status(404).json({ error: "Authentication data not found" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      authData.password_hash
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const { error: updateError } = await supabase
      .from("authentications")
      .update({ password_hash: hashedPassword })
      .eq("user_id", user.id);

    if (updateError) {
      return res.status(500).json({ error: "Failed to update password" });
    }

    // Audit password change event
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      event: "password_change",
      ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      user_agent: req.headers["user-agent"],
      origin: req.headers.origin || "unknown",
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ error: "Unexpected error occurred" });
  }
}
