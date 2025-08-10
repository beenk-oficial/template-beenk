import { jwtDecode } from "jwt-decode";
import { getCookieValue } from ".";
import { forceLogout, refreshToken } from "@/lib/supabase/api/auth";

export async function getCompanyIdFromToken() {
    let accessToken = getCookieValue("accessToken");

    if (!accessToken) {
        forceLogout();
        return null;
    }

    try {
        let decoded = jwtDecode(accessToken);
        console.log("Decoded JWT:", decoded);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) {
            const response = await refreshToken();

            if (!response.user) {
                forceLogout();
            }

            accessToken = getCookieValue("accessToken") as string;
            decoded = jwtDecode(accessToken);

            return (decoded as any)?.company_id || null;
        } else {
            return (decoded as any)?.company_id || null;
        }

    } catch {
        forceLogout();
        return null;
    }
}