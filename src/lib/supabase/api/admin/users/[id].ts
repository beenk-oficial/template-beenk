import { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import authenticated from "@/middleware/authenticated";
import { decodedAccessToken } from "@/utils/api";

export default authenticated(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createServerSupabaseClient({ req, res });

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  
  const { company_id } = decodedAccessToken(req);
  const { id } = req.query;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .eq("company_id", company_id)
      .single();

    if (error) {
      return res.status(404).json({ message: "User not found", error });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
})
