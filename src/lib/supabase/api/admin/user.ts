import { supabase } from "@/lib/supabase";
import type { SortOrder } from "@/types";
import { formatDateToDB, getCompanyIdFromToken } from "@/utils/api";

export async function getUserById(data: { id: string }) {
    const { id } = data;

    const companyId = await getCompanyIdFromToken()

    if (!companyId || !id) {
        return { error: "Missing company_id or user id", key: "missing_params" };
    }

    try {
        const { data: user, error } = await supabase
            .from("users")
            .select("id, full_name, email, type, is_active, is_banned, created_at")
            .eq("id", id)
            .eq("company_id", companyId)
            .single();

        if (error) {
            throw new Error("User not found");
        }

        return { user };
    } catch (error) {
        throw error;
    }
}

export async function getUserPaginated(data: {
    page?: number;
    perPage?: number;
    sortField?: string;
    sortOrder: SortOrder;
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
        throw new Error("Missing company_id or ids");
    }

    try {
        const { error } = await supabase
            .from("users")
            .delete()
            .in("id", ids)
            .eq("company_id", companyId);

        if (error) {
            throw new Error("Failed to delete users");
        }

        return true;
    } catch (error) {
        throw error;
    }
}

export async function updateUser(data: {
    id: string;
    user_id: string;
    updates: Record<string, any>;
}) {
    const companyId = await getCompanyIdFromToken()

    const { id, user_id, updates } = data;

    console.log(companyId, id, user_id, updates);
    if (!id || !user_id || !updates) {
        throw new Error("Missing required fields");
    }

    try {
        const { data: user, error } = await supabase
            .from("users")
            .update({ ...updates, updated_at: formatDateToDB(new Date()), updated_by: user_id })
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
