import { supabase } from "@/lib/supabase";
import { getCompanyIdFromToken } from "@/utils/api";

export async function getWorkOrders() {
  const companyId = await getCompanyIdFromToken();
  const { data, error } = await supabase
    .from("erp_work_orders")
    .select("*")
    .eq("company_id", companyId);
  if (error) throw error;
  return data;
}
