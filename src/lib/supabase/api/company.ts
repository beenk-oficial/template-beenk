import { supabase } from "@/lib/supabase";

export async function getCompany({ slug = "", domain = "" }: { slug?: string; domain?: string } = {}) {
  try {
    const query = supabase
      .from("companies")
      .select(`
        *,
        addresses:address_id (
          id,
          address_line,
          number,
          complement,
          neighborhood,
          city,
          state,
          postal_code,
          country
        ),
        whitelabel:white_label_id (
          id,
          logo_path,
          favicon_path,
          banner_login_path,
          banner_signup_path,
          banner_change_password_path,
          banner_request_password_reset_path,
          colors
        )
      `)

    if (slug) {
      query.eq("slug", slug);
    } else if (domain) {
      query.eq("domain", domain);
    } else {
      throw new Error("Missing company_id")
    }

    const { data, error } = await query.single();

    if (error || !data) throw new Error("Company not found");

    return data;
  } catch (error) {
    console.error("Error fetching company:", error);
    throw error;
  }
}