import { supabase } from "@/lib/supabase";
import { getCompanyIdFromToken } from "@/utils/api";

export async function getProducts() {
  const companyId = await getCompanyIdFromToken();
  const { data, error } = await supabase
    .from("erp_products")
    .select("*")
    .eq("company_id", companyId);
  if (error) throw error;
  return data;
}
