import { SortOrder, SubscriptionOwnerType } from "@/types";
import { supabase } from "@/lib/supabase";

export async function getSubscriptionPaginated(data: {
    company_id: string;
    page?: number;
    perPage?: number;
    sortField?: string;
    sortOrder?: SortOrder;
    search?: string;
}) {
    const {
        company_id,
        page = 1,
        perPage = 10,
        sortField = "created_at",
        sortOrder = SortOrder.ASC,
        search = "",
    } = data;

    if (!company_id) {
        return { error: "Missing company_id", key: "missing_company_id" };
    }

    try {
        let query = supabase
            .from("subscriptions")
            .select(
                `id,status,plan_id,trial_start,trial_end,current_period_start,current_period_end,canceled_at,created_at,
                 users!inner(email)`,
                { count: "exact" }
            )
            .eq("owner_type", SubscriptionOwnerType.USER)
            .eq("company_id", company_id);

        if (search) {
            query = query.ilike("users.email", `%${search}%`);
        }

        query = query.order(sortField, {
            ascending: sortOrder === SortOrder.ASC,
        });

        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.range(from, to);

        const { data: subscriptions, count, error } = await query;

        if (error) {
            return { error: "Failed to fetch", key: "fetch_failed" };
        }

        const totalPages = Math.ceil((count || 0) / perPage);

        return {
            data: subscriptions.map(subscription => ({
                ...subscription,
                email: (subscription.users as any)?.email,
            })),
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
        return { error: "Internal server error", key: "internal_error" };
    }
}
