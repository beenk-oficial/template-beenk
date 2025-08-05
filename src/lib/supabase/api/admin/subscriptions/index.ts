import { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SortOrder, SubscriptionOwnerType } from "@/types";
import authenticated from "@/middleware/authenticated";
import { decodedAccessToken } from "@/utils/api";

export default authenticated(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  return await paginated(req, res);
});

async function paginated(req: NextApiRequest,
  res: NextApiResponse) {

  const supabase = createServerSupabaseClient({ req, res });

  const {
    page = "1",
    perPage = "10",
    sortField = "created_at",
    sortOrder = SortOrder.ASC,
    search = "",
  } = req.query;

  const { company_id } = decodedAccessToken(req);

  const currentPage = parseInt(page as string, 10);
  const itemsPerPage = parseInt(perPage as string, 10);

  try {
    let query = supabase
      .from("subscriptions")
      .select(
        `id,status,plan_id,trial_start,trial_end,current_period_start,current_period_end,canceled_at,created_at,
         users!inner(email)`
        , { count: "exact" }
      )
      .eq("owner_type", SubscriptionOwnerType.USER)
      .eq("company_id", company_id);

    if (search) {
      query = query.ilike("users.email", `%${search}%`);
    }

    query = query.order(sortField as string, {
      ascending: sortOrder === SortOrder.ASC,
    });

    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return res.status(500).json({ message: "Failed to fetch", error });
    }

    const totalPages = Math.ceil((count || 0) / itemsPerPage);

    res.status(200).json({
      data: data.map(subscription => ({
        ...subscription,
        email: (subscription.users as any)?.email,
      })),
      pagination: {
        sortField,
        sortOrder,
        currentPage,
        itemsPerPage,
        currentTotalItems: count,
        totalItems: count || 0,
        totalPages,
        search,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}
