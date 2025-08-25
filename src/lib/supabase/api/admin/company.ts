import { supabase } from "@/lib/supabase";
import { getCompanyIdFromToken } from "@/utils/api";

export async function getCompany() {
  const companyId = await getCompanyIdFromToken();
  if (!companyId) throw new Error("Missing company_id");

  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (error || !data) throw new Error("Company not found");
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateCompany({
  id,
  user_id,
  updates,
}: {
  id: string;
  user_id: string;
  updates: Record<string, any>;
}) {
  if (!id || !user_id || !updates) throw new Error("Missing required fields");

  try {
    const { data, error } = await supabase
      .from("companies")
      .update({
        ...updates,
        updated_at: new Date(),
        updated_by: user_id,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error("Failed to update company");
    return data;
  } catch (error) {
    throw error;
  }
}
