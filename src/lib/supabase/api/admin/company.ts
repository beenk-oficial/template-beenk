import { supabase } from "@/lib/supabase";
import { getCompanyIdFromToken } from "@/utils/api";

export async function getCompany() {
  const companyId = await getCompanyIdFromToken();
  if (!companyId) throw new Error("Missing company_id");

  try {
    const { data, error } = await supabase
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

export async function upsertAddress(address: {
  id?: string;
  address_line: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  user_id?: string;
}) {
  if (!address) throw new Error("Missing address data");

  const payload = {
    address_line: address.address_line,
    number: address.number,
    complement: address.complement,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: address.country || "BR",
    updated_at: new Date(),
    updated_by: address.user_id || null,
  };

  if (address.id) {
    const { data, error } = await supabase
      .from("addresses")
      .update(payload)
      .eq("id", address.id)
      .select()
      .single();
    if (error) throw new Error("Failed to update address");
    return data;
  } else {
    const { data, error } = await supabase
      .from("addresses")
      .insert([{
        ...payload,
        created_at: new Date(),
        created_by: address.user_id || null,
      }])
      .select()
      .single();
    if (error) throw new Error("Failed to create address");
    return data;
  }
}
