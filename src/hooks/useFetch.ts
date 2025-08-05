import { useSession } from "@/hooks/useSession";
import { getCookieValue, setCookie } from "@/utils";

export const useFetch = () => {
  const { companyId } = useSession();

  const customFetch = async (
    url: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: any;
      query?: Record<string, any>;
    } = {},
    retry = true
  ) => {
    const accessToken = getCookieValue("accessToken");
    const defaultHeaders = {
      "Content-Type": "application/json",
      "Company-Id": companyId || "",
      Authorization: `Bearer ${accessToken || ""}`,
    };

    const { method = "GET", headers = {}, body, query } = options;

    const queryString = query
      ? "?" +
        new URLSearchParams(
          Object.entries(query).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        ).toString()
      : "";

    const response = await fetch(url + queryString, {
      method,
      headers: { ...defaultHeaders, ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401 && retry) {
      const refreshToken = getCookieValue("refreshToken");

      if (refreshToken) {
        const tokenResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { ...defaultHeaders, ...headers },
          body: JSON.stringify({ refreshToken }),
        });

        if (tokenResponse.ok) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await tokenResponse.json();

          setCookie("accessToken", newAccessToken, 3600);
          setCookie("refreshToken", newRefreshToken, 604800);

          return customFetch(url, options, false);
        }
      }
    }

    return response;
  };

  return customFetch;
};
