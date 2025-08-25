import { supabase } from "@/lib/supabase";
import type { SortOrder } from "@/types";
import { getCompanyIdFromToken } from "@/utils/api";

export async function getReferralsPaginated(data: {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortOrder?: SortOrder;
  search?: string;
}) {
  const {
    page = 1,
    perPage = 10,
    sortField = "created_at",
    sortOrder = "asc",
    search = "",
  } = data;

  const companyId = await getCompanyIdFromToken();
  if (!companyId) throw new Error("Missing company_id");

  try {
    let query = supabase
      .from("referrals")
      .select(
        `
          *,
          referrer_user:referrer_user_id!inner(id, full_name, email),
          referred_user:referred_user_id!inner(id, full_name, email)
        `,
        { count: "exact" }
      )
      .eq("company_id", companyId);

    if (search) {
      query = query.ilike("referrer_user.full_name", `%${search}%`)
        .ilike("referrer_user.email", `%${search}%`)
        .ilike("referred_user.full_name", `%${search}%`)
        .ilike("referred_user.email", `%${search}%`)
    }

    query = query.order(sortField, { ascending: sortOrder === "asc" });
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data: referrals, count, error } = await query;

    if (error) throw new Error("Failed to fetch referrals");

    const totalPages = Math.ceil((count || 0) / perPage);
    return {
      data: referrals,
      pagination: {
        sortField,
        sortOrder,
        currentPage: page,
        itemsPerPage: perPage,
        currentTotalItems: count,
        totalItems: count || 0,
        totalPages,
        search,
      },
    };
  } catch (error) {
    throw error;
  }
}
