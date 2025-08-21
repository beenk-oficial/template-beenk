import { supabase } from "@/lib/supabase";
import type { SortOrder } from "@/types";
import { getCompanyIdFromToken } from "@/utils/api";

const TABLE = 'promo_code';

export async function getPromoCodes() {
    const { data } = await supabase
        .from(TABLE)
        .select('id, code, description')
        .order('code', { ascending: true });

    return data;
}

export async function getPromoCodesPaginated(data: {
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
    if (!companyId) throw new Error("Missing company_id");

    try {
        let query = supabase
            .from(TABLE)
            .select("*", { count: "exact" })
            .eq("company_id", companyId);

        if (search) {
            query = query.ilike("code", `%${search}%`);
        }

        query = query.order(sortField, { ascending: sortOrder === "asc" });
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.range(from, to);
        const { data: promoCodes, count, error } = await query;

        if (error) {
            throw new Error("Failed to fetch promo codes");
        }

        const totalPages = Math.ceil((count || 0) / perPage);
        return {
            data: promoCodes,
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

export async function getPromoCodeById(data: { id: string }) {
    const { id } = data;
    const companyId = await getCompanyIdFromToken();

    if (!id) throw new Error("Missing promo code id");

    if (!companyId) throw new Error("Missing company_id");

    try {
        const { data: promoCode } = await supabase
            .from(TABLE)
            .select("*")
            .eq("id", id)
            .eq("company_id", companyId)
            .single();

        return { promoCode };
    } catch (error) {
        throw error;
    }
}

export async function createPromoCode(data: Record<string, any>) {
    if (!data) throw new Error("Missing promo code data");

    const companyId = await getCompanyIdFromToken();
    if (!companyId) throw new Error("Missing company_id");

    try {
        const { data: promoCode, error } = await supabase
            .from(TABLE)
            .insert([{ ...data, company_id: companyId }])
            .select()
            .single();

        if (error) throw error;
        return promoCode;
    } catch (error) {
        throw error;
    }
}

export async function updatePromoCode(data: { id: string; user_id: string; updates: Record<string, any> }) {
    const { id, user_id, updates } = data;
    const companyId = await getCompanyIdFromToken();

    if (!id || !updates) throw new Error("Missing required fields");

    if (!companyId) throw new Error("Missing company_id");

    try {
        const { data: promoCode, error } = await supabase
            .from(TABLE)
            .update({ ...updates, updated_at: new Date(), updated_by: user_id })
            .eq("id", id)
            .eq("company_id", companyId)
            .select()
            .single();

        if (error) {
            throw new Error("Failed to update promo code");
        }

        return promoCode;
    } catch (error) {
        throw error;
    }
}

export async function deletePromoCodes(data: { ids: string[] }) {
    const { ids } = data;
    const companyId = await getCompanyIdFromToken();

    if (!ids?.length) throw new Error("Missing ids");

    if (!companyId) throw new Error("Missing company_id");

    try {
        const { error } = await supabase
            .from(TABLE)
            .delete()
            .in("id", ids)
            .eq("company_id", companyId);

        if (error) throw new Error("Failed to delete promo codes");

        return true;
    } catch (error) {
        throw error;
    }
}