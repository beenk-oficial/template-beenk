import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import checkCompanyId from "@/middleware/checkCompanyId";

export default checkCompanyId(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      key: "method_not_allowed",
    });
  }

  const { email } = req.body;
  const company_id = req.headers["company-id"];

  if (!email) {
    return res.status(400).json({
      error: "Email is required",
      key: "missing_email",
    });
  }

  const supabase = createServerSupabaseClient({ req, res });

  try {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, company_id")
      .eq("email", email)
      .eq("company_id", company_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        error: "User not found",
        key: "user_not_found",
      });
    }

    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "1h" }
    );

    const { error: tokenError } = await supabase
      .from("authentications")
      .update({
        reset_token: resetToken,
        expires_reset_token_at: new Date(Date.now() + 3600000), // 1 hour expiration
      })
      .eq("user_id", user.id)
      .eq("provider", "email");

    if (tokenError) {
      return res.status(500).json({
        error: "Failed to store reset token",
        key: "token_storage_failed",
      });
    }

    // Log the email sending (mocked for now)
    console.log(
      `Send email to ${email} with reset link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    );

    await supabase.from("audit_logs").insert({
      auth_id: null,
      event: "password_reset_requested",
      ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      user_agent: req.headers["user-agent"],
      origin: req.headers.origin || "unknown",
      metadata: { email, resetToken },
    });

    return res.status(200).json({
      message: "Password reset email sent",
      key: "password_reset_email_sent",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      error: "Unexpected error occurred",
      key: "error_occurred",
    });
  }
});
