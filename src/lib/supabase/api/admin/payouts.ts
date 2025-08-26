import { supabase } from "@/lib/supabase";
import type { SortOrder } from "@/types";
import { getCompanyIdFromToken } from "@/utils/api";

export async function getPayoutsPaginated(data: {
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
            .from("payout")
            .select(
                "*, payment!inner(*, users!inner(id, full_name, email))",
                { count: "exact" }
            )
            .eq("company_id", companyId);

        if (search) {
            query = query.ilike("payment.users.email", `%${search}%`).ilike("payment.users.full_name", `%${search}%`);
        }

        query = query.order(sortField, { ascending: sortOrder === "asc" });
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.range(from, to);

        const { data: payouts, count, error } = await query;

        if (error) throw new Error("Failed to fetch payouts");

        const totalPages = Math.ceil((count || 0) / perPage);
        return {
            data: payouts,
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
