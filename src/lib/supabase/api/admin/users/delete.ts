import { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import authenticated from "@/middleware/authenticated";
import { decodedAccessToken } from "@/utils/api";

export default authenticated(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createServerSupabaseClient({ req, res });

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { company_id } = decodedAccessToken(req);
  const { ids } = req.body;

  try {
    const { error } = await supabase.from("users").delete().in("id", ids).eq("company_id", company_id);

    if (error) {
      return res
        .status(400)
        .json({ message: "Failed to delete users", error });
    }

    return res.status(200).json({ message: "Users deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
})
