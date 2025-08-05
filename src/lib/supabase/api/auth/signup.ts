import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
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

  const { email, password, full_name } = req.body;
  const company_id = req.headers["company-id"];

  if (!email || !password || !full_name) {
    return res.status(400).json({
      error: "Email, password, and full_name are required",
      key: "missing_credentials",
    });
  }

  const supabase = createServerSupabaseClient({ req, res });

  try {
    const { data: userExists } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userExists) {
      return res.status(409).json({
        error: "User already exists",
        key: "user_already_exists",
      });
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
          is_active: false,
        },
      ])
      .select("*")
      .single();

    console.log("newUser", newUser);
    console.log("userCreationError", userCreationError);

    if (userCreationError) {
      return res.status(500).json({
        error: "Failed to create user",
        key: "user_creation_failed",
      });
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
      return res.status(500).json({
        error: "Failed to create authentication",
        key: "user_authentication_failed",
      });
    }

    await supabase.from("audit_logs").insert({
      auth_id: authentication.id,
      event: "signup",
      ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      user_agent: req.headers["user-agent"],
      origin: req.headers.origin || "unknown",
      metadata: {
        email,
        full_name,
      },
    });

    return res.status(201).json({
      user: newUser,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      error: "Unexpected error occurred",
      key: "error_occurred",
    });
  }
});
