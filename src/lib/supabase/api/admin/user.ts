import { supabase } from "@/lib/supabase";
import { getCompanyIdFromToken } from "@/utils/api";

export async function getUserById(data: { id: string }) {
    const { id } = data;

    const companyId = await getCompanyIdFromToken()

    if (!companyId || !id) {
        return { error: "Missing company_id or user id", key: "missing_params" };
    }

    try {
        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", id)
            .eq("company_id", companyId)
            .single();

        if (error || !user) {
            return { error: "User not found", key: "user_not_found" };
        }

        return { user };
    } catch (error) {
        return { error: "Internal server error", key: "internal_error" };
    }
}

export async function getUserPaginated(data: {
    page?: number;
    perPage?: number;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
}) {
    const companyId = await getCompanyIdFromToken()

    const {
        page = 1,
        perPage = 10,
        sortField = "created_at",
        sortOrder = "asc",
        search = "",
    } = data;

    if (!companyId) {
        throw new Error("Missing company_id");
    }

    try {
        let query = supabase
            .from("users")
            .select("id,full_name,type,is_active,is_banned,email,created_at", {
                count: "exact",
            })
            .eq("company_id", companyId);

        if (search) {
            query = query.ilike("full_name", `%${search}%`);
        }

        query = query.order(sortField, {
            ascending: sortOrder === "asc",
        });

        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.range(from, to);

        const { data: users, count } = await query;

        const totalPages = Math.ceil((count || 0) / perPage);

        return {
            data: users,
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

export async function deleteUsers(data: { ids: string[] }) {
    const companyId = await getCompanyIdFromToken()

    const { ids } = data;

    if (!companyId || !ids?.length) {
        return { error: "Missing company_id or ids", key: "missing_params" };
    }

    try {
        const { error } = await supabase
            .from("users")
            .delete()
            .in("id", ids)
            .eq("company_id", companyId);

        if (error) {
            return { error: "Failed to delete users", key: "delete_failed" };
        }

        return true;
    } catch (error) {
        return { error: "Internal server error", key: "internal_error" };
    }
}

export async function updateUser(data: {
    id: string;
    user_id: string;
    updates: Record<string, any>;
}) {
    const companyId = await getCompanyIdFromToken()

    const { id, user_id, updates } = data;

    if (!id || !user_id || !updates) {
        throw new Error("Missing required fields");
    }

    try {
        const { data: user, error } = await supabase
            .from("users")
            .update({ ...updates, updated_at: new Date(), updated_by: user_id })
            .eq("id", id)
            .eq("company_id", companyId)
            .single();

        if (error) {
            throw new Error("Failed to update user");
        }

        return { user };
    } catch (error) {
        throw error;
    }
}
