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

    } catch(error) {
        forceLogout();
        throw error;
    }
}

export function formatDateToDB(date: Date): string {
  const pad = (n: number, z = 2) => String(n).padStart(z, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const ms = pad(date.getMilliseconds(), 3) + "00";
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
}