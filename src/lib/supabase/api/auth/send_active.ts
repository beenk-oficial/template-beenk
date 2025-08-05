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

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const supabase = createServerSupabaseClient({ req, res });

  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, is_active")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.is_active) {
      return res.status(400).json({ error: "Account is already active" });
    }

    // Generate activation token
    const activationToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "1h" }
    );

    // Send activation email (mocked for now)
    console.log(
      `Send email to ${email} with activation link: ${process.env.NEXT_PUBLIC_APP_URL}/activate?token=${activationToken}`
    );

    return res.status(200).json({ message: "Activation email sent" });
  } catch (error) {
    console.error("Send activation email error:", error);
    return res.status(500).json({ error: "Unexpected error occurred" });
  }
}
