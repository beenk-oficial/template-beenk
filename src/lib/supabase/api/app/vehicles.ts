import { supabase } from "@/lib/supabase";
import { getCompanyIdFromToken } from "@/utils/api";

export async function getVehicles() {
  const companyId = await getCompanyIdFromToken();
  const { data, error } = await supabase
    .from("erp_vehicles")
    .select("*")
    .eq("company_id", companyId);
  if (error) throw error;
  return data;
}
