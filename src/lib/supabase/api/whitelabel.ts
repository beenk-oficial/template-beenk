import { supabase } from "@/lib/supabase";
import type { WhiteLabel } from "@/types";
import { formatDateToDB } from "@/utils/api";

export async function createWhiteLabel(data: {
  whitelabel: WhiteLabel;
  user_id: string;
}) {
  const { whitelabel, user_id } = data;

  if (!user_id || !whitelabel) {
    throw new Error("Missing required fields");
  }

  try {
    const payload = {
      ...whitelabel,
      created_at: formatDateToDB(new Date()),
      created_by: user_id,
      updated_at: formatDateToDB(new Date()),
      updated_by: user_id,
    };

    const { data: result, error } = await supabase
      .from("white_labels")
      .insert([payload])
      .select()
      .single();

    if (error) {
      throw new Error("Failed to create whitelabel");
    }

    return { whitelabel: result };
  } catch (error) {
    throw error;
  }
}

export async function updateWhiteLabel(data: {
  id: string;
  updates: Partial<WhiteLabel>;
  user_id: string;
}) {
  const { id, updates, user_id } = data;

  if (!id || !updates || !user_id) {
    throw new Error("Missing required fields");
  }

  try {
    const payload = {
      ...updates,
      updated_at: formatDateToDB(new Date()),
      updated_by: user_id,
    };

    const { data: result, error } = await supabase
      .from("white_labels")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error("Failed to update whitelabel");
    }

    return { whitelabel: result };
  } catch (error) {
    throw error;
  }
}
