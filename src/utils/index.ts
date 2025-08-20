import dayjs from "dayjs";

export const normalizeSlug = (slug: string): string => {
  return slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

export function normalizeLink(
  link: string,
  query: { slug?: string } | null = null
): string {
  const slug = query?.slug;
  return slug ? `/${slug}${link}` : link;
}

export function getCookieValue(key: string): string | null {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${key}=`));
  return cookie ? cookie.split("=")[1] : null;
}

export function setCookie(key: string, value: string, maxAge: number) {
  document.cookie = `${key}=${value}; Path=/; Max-Age=${maxAge}; `;
}

export function formatToLocaleDate(value: string) {
  if (!value) return "-";
  const date = dayjs(value);
  return date.isValid() ? date.local().format("DD/MM/YYYY") : "-";
}

export function formatToLocaleDateWithTime(value: string) {
  if (!value) return "-";
  const date = dayjs(value);
  return date.isValid() ? date.local().format("DD/MM/YYYY HH:mm") : "-";
}

export function formatToLocaleCurrency(value: number) {
  if (value == null) return "-";
  return value.toLocaleString(navigator.language, {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}