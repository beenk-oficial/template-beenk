import { supabase } from "@/lib/supabase";

export async function getCompany(data: { slug?: string; domain?: string }) {
  const { slug, domain } = data;

  if (!slug && !domain) {
    return { error: "Slug or domain are required" };
  }

  try {
    const query = supabase
      .from("companies")
      .select(
        "id, white_label_id, name, slug, domain, email, locale, timezone, currency, phone, status"
      );

    if (slug) {
      query.eq("slug", slug);
    } else {
      query.eq("domain", "localhost");
    }

    const { data: company, error } = await query.single();

    if (error || !company) {
      return { error: "Company not found" };
    }

    return company;
  } catch (error) {
    return { error: "Unexpected error occurred" };
  }
}