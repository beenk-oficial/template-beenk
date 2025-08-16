
import { supabase } from "@/lib/supabase";
import type { SortOrder } from "@/types";
import { getCompanyIdFromToken } from "@/utils/api";

export async function getPlanById(data: { id: string }) {
    const { id } = data;
    const companyId = await getCompanyIdFromToken();

    if (!id) {
        throw new Error("Missing plan id");
    }

    if (!companyId) {
        throw new Error("Missing company_id");
    }

    try {
        const { data: plan, error } = await supabase
            .from("plans")
            .select("*")
            .eq("id", id)
            .eq("company_id", companyId)
            .single();

        if (error || !plan) {
            throw new Error("Plan not found");
        }
        return { plan };
    } catch (error) {
        throw error;
    }
}

export async function getPlansPaginated(data: {
    page?: number;
    perPage?: number;
    sortField?: string;
    sortOrder: SortOrder;
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
    if (!companyId) {
        throw new Error("Missing company_id");
    }

    try {
        let query = supabase
            .from("plans")
            .select("*", { count: "exact" })
            .eq("company_id", companyId);

        if (search) {
            query = query.ilike("name", `%${search}%`);
        }

        query = query.order(sortField, { ascending: sortOrder === "asc" });
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.range(from, to);
        const { data: plans, count, error } = await query;

        if (error) {
            throw new Error("Failed to fetch plans");
        }

        const totalPages = Math.ceil((count || 0) / perPage);
        return {
            data: plans,
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

export async function createPlan(data: Record<string, any>) {
    if (!data) {
        throw new Error("Missing plan data");
    }

    const companyId = await getCompanyIdFromToken();
    if (!companyId) {
        throw new Error("Missing company_id");
    }
    try {
        const { data: plan, error } = await supabase
            .from("plans")
            .insert([{ ...data, company_id: companyId}])
            .select()
            .single();
        if (error) {
            throw new Error("Failed to create plan");
        }
        return { plan };
    } catch (error) {
        throw error;
    }
}

export async function updatePlan(data: { id: string; user_id: string; updates: Record<string, any> }) {
    const { id, user_id, updates } = data;
    const companyId = await getCompanyIdFromToken();

    if (!id || !updates) {
        throw new Error("Missing required fields");
    }

    if (!companyId) {
        throw new Error("Missing company_id");
    }

    try {
        const { data: plan, error } = await supabase
            .from("plans")
            .update({ ...updates, updated_at: new Date(), updated_by: user_id })
            .eq("id", id)
            .eq("company_id", companyId)
            .select()
            .single();
        if (error) {
            throw new Error("Failed to update plan");
        }
        return { plan };
    } catch (error) {
        throw error;
    }
}

export async function deletePlans(data: { ids: string[] }) {
    const { ids } = data;
    const companyId = await getCompanyIdFromToken();

    if (!ids?.length) {
        throw new Error("Missing ids");
    }

    if (!companyId) {
        throw new Error("Missing company_id");
    }

    try {
        const { error } = await supabase
            .from("plans")
            .delete()
            .in("id", ids)
            .eq("company_id", companyId);

        if (error) {
            throw new Error("Failed to delete plans")
        }
        return true;
    } catch (error) {
        throw error;
    }
}
