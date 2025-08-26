import { supabase } from "@/lib/supabase";
import type { SortOrder } from "@/types";
import { getCompanyIdFromToken } from "@/utils/api";

export async function getPaymentsPaginated(data: {
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
            .from("payment")
            .select("*, users!inner(id, full_name, email)", { count: "exact" })
            .eq("company_id", companyId);

        if (search) {
            query = query.ilike("users.email", `%${search}%`).ilike("users.full_name", `%${search}%`);
        }

        query = query.order(sortField, { ascending: sortOrder === "asc" });
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.range(from, to);

        const { data: payments, count, error } = await query;

        if (error) throw new Error("Failed to fetch payments");

        const totalPages = Math.ceil((count || 0) / perPage);
        return {
            data: payments,
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

export async function getPaymentById(data: { id: string }) {
    const { id } = data;
    const companyId = await getCompanyIdFromToken();

    if (!id) throw new Error("Missing payment id");
    if (!companyId) throw new Error("Missing company_id");

    try {
        const { data: payment, error } = await supabase
            .from("payment")
            .select("*, user:users(id, full_name, email)")
            .eq("id", id)
            .eq("company_id", companyId)
            .single();

        if (error || !payment) throw new Error("Payment not found");
        return { payment };
    } catch (error) {
        throw error;
    }
}
