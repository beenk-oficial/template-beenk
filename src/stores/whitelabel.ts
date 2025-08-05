import type { Company } from "@/types";
import { create } from "zustand";

export type WhitelabelColors = {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  "sidebar-foreground": string;
  "sidebar-primary": string;
  "sidebar-primary-foreground": string;
  "sidebar-accent": string;
  "sidebar-accent-foreground": string;
  "sidebar-border": string;
  "sidebar-ring": string;
};

export const useWhitelabelStore = create<{
  colors: WhitelabelColors;
  name: string;
  logo: string;
  favicon?: string;
  company: Company | null;
  marketing_banner: {
    login: string;
    signup: string;
    change_password: string;
    request_password_reset: string;
  };
  slug?: string;
  domain?: string;
  setSlug: (slug?: string) => void;
  setDomain: (domain: string) => void;
  setColors: (newColors: Partial<WhitelabelColors>) => void;
  setCompany: (company: Company) => void;
  setFavicon: (favicon: string) => void;
}>((set) => ({
  colors: null as unknown as WhitelabelColors,
  name: null as unknown as string,
  logo: null as unknown as string,
  favicon: undefined,
  company: null,
  marketing_banner: {
    login: null as unknown as string,
    signup: null as unknown as string,
    change_password: null as unknown as string,
    request_password_reset: null as unknown as string,
  },
  slug: undefined,
  domain: undefined,
  setColors: (newColors) =>
    set((state) => ({ colors: { ...state.colors, ...newColors } })),
  setCompany: (company: Company) => set({ company }),
  setSlug: (slug) => set({ slug }),
  setDomain: (domain: string) => set({ domain }),
  setFavicon: (favicon: string) => set({ favicon }),
}));
