import { supabase } from "@/lib/supabase";
import { getCompanyIdFromToken } from "@/utils/api";

export async function getServices() {
  const companyId = await getCompanyIdFromToken();
  const { data, error } = await supabase
    .from("erp_services")
    .select("*")
    .eq("company_id", companyId);
  if (error) throw error;
  return data;
}
