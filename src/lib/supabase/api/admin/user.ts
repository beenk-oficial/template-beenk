import { supabase } from "@/lib/supabase";

export async function getUserById(data: { company_id: string; id: string }) {
    const { company_id, id } = data;

    if (!company_id || !id) {
        return { error: "Missing company_id or user id", key: "missing_params" };
    }

    try {
        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", id)
            .eq("company_id", company_id)
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
    company_id: string;
    page?: number;
    perPage?: number;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
}) {
    const {
        company_id,
        page = 1,
        perPage = 10,
        sortField = "created_at",
        sortOrder = "asc",
        search = "",
    } = data;

    if (!company_id) {
        return { error: "Missing company_id", key: "missing_company_id" };
    }

    try {
        let query = supabase
            .from("users")
            .select("id,full_name,type,is_active,is_banned,email,created_at", {
                count: "exact",
            })
            .eq("company_id", company_id);

        if (search) {
            query = query.ilike("full_name", `%${search}%`);
        }

        query = query.order(sortField, {
            ascending: sortOrder === "asc",
        });

        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.range(from, to);

        const { data: users, count, error } = await query;

        if (error) {
            return { error: "Failed to fetch users", key: "fetch_failed" };
        }

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
        return { error: "Internal server error", key: "internal_error" };
    }
}

export async function deleteUsers(data: { company_id: string; ids: string[] }) {
    const { company_id, ids } = data;

    if (!company_id || !ids?.length) {
        return { error: "Missing company_id or ids", key: "missing_params" };
    }

    try {
        const { error } = await supabase
            .from("users")
            .delete()
            .in("id", ids)
            .eq("company_id", company_id);

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
    company_id: string;
    user_id: string;
    updates: Record<string, any>;
}) {
    const { id, company_id, user_id, updates } = data;

    if (!id || !company_id || !user_id || !updates) {
        return { error: "Missing required fields", key: "missing_fields" };
    }

    try {
        const { data: user, error } = await supabase
            .from("users")
            .update({ ...updates, updated_at: new Date(), updated_by: user_id })
            .eq("id", id)
            .eq("company_id", company_id)
            .single();

        if (error) {
            return { error: "Failed to update user", key: "update_failed" };
        }

        return { user };
    } catch (error) {
        return { error: "Internal server error", key: "internal_error" };
    }
}
