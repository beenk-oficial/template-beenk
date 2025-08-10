
import { supabase } from "@/lib/supabase";
import { getCompanyIdFromToken } from "@/utils/api";

export async function getPlanById(data: { id: string }) {
    const { id } = data;
    const company_id = getCompanyIdFromToken();

    if (!id) {
        return { error: "Missing plan id", key: "missing_id" };
    }

    if (!company_id) {
        return { error: "Unauthorized", key: "unauthorized" };
    }

    try {
        const { data: plan, error } = await supabase
            .from("plans")
            .select("*")
            .eq("id", id)
            .eq("company_id", company_id)
            .single();
        if (error || !plan) {
            return { error: "Plan not found", key: "plan_not_found" };
        }
        return { plan };
    } catch (error) {
        return { error: "Internal server error", key: "internal_error" };
    }
}

export async function getPlansPaginated(data: {
    page?: number;
    perPage?: number;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
}) {
    const {
        page = 1,
        perPage = 10,
        sortField = "created_at",
        sortOrder = "asc",
        search = "",
    } = data;
    const company_id = getCompanyIdFromToken();
    if (!company_id) {
        return { error: "Unauthorized", key: "unauthorized" };
    }
    try {
        let query = supabase
            .from("plans")
            .select("*", { count: "exact" })
            .eq("company_id", company_id);
        if (search) {
            query = query.ilike("name", `%${search}%`);
        }
        query = query.order(sortField, { ascending: sortOrder === "asc" });
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.range(from, to);
        const { data: plans, count, error } = await query;
        if (error) {
            return { error: "Failed to fetch plans", key: "fetch_failed" };
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
        return { error: "Internal server error", key: "internal_error" };
    }
}

export async function createPlan(data: Record<string, any>) {
    if (!data) {
        return { error: "Missing plan data", key: "missing_data" };
    }
    const company_id = getCompanyIdFromToken();
    if (!company_id) {
        return { error: "Unauthorized", key: "unauthorized" };
    }
    try {
        const { data: plan, error } = await supabase
            .from("plans")
            .insert([{ ...data, company_id }])
            .select()
            .single();
        if (error) {
            return { error: "Failed to create plan", key: "create_failed" };
        }
        return { plan };
    } catch (error) {
        return { error: "Internal server error", key: "internal_error" };
    }
}

export async function updatePlan(data: { id: string; updates: Record<string, any> }) {
    const { id, updates } = data;
    const company_id = getCompanyIdFromToken();
    
    if (!id || !updates) {
        return { error: "Missing required fields", key: "missing_fields" };
    }

    if (!company_id) {
        return { error: "Unauthorized", key: "unauthorized" };
    }

    try {
        const { data: plan, error } = await supabase
            .from("plans")
            .update({ ...updates, updated_at: new Date() })
            .eq("id", id)
            .eq("company_id", company_id)
            .select()
            .single();
        if (error) {
            return { error: "Failed to update plan", key: "update_failed" };
        }
        return { plan };
    } catch (error) {
        return { error: "Internal server error", key: "internal_error" };
    }
}

export async function deletePlans(data: { ids: string[] }) {
    const { ids } = data;
    const company_id = getCompanyIdFromToken();

    if (!ids?.length) {
        return { error: "Missing ids", key: "missing_ids" };
    }

    if (!company_id) {
        return { error: "Unauthorized", key: "unauthorized" };
    }
    try {
        const { error } = await supabase
            .from("plans")
            .delete()
            .in("id", ids)
            .eq("company_id", company_id);
        if (error) {
            return { error: "Failed to delete plans", key: "delete_failed" };
        }
        return true;
    } catch (error) {
        return { error: "Internal server error", key: "internal_error" };
    }
}
