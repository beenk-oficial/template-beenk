import { supabase } from "@/lib/supabase";
import { getCompanyIdFromToken } from "@/utils/api";

export async function getSales() {
  const companyId = await getCompanyIdFromToken();
  const { data, error } = await supabase
    .from("erp_sales")
    .select("*")
    .eq("company_id", companyId);
  if (error) throw error;
  return data;
}
