import en from "./messages/en.json";
import pt from "./messages/pt.json";
import es from "./messages/es.json";

export const locales = ["en", "pt", "es"] as const;
export const defaultLocale = "pt";

export type Locale = (typeof locales)[number];

export const messages = {
  en,
  pt,
  es,
};

export function getLocale() {
  return defaultLocale;
}

export function getMessages() {
  return (
    messages[getLocale() as keyof typeof messages] || messages[defaultLocale]
  );
}
