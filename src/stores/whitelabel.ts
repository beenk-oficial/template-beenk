import type { Company, WhitelabelColors } from "@/types";
import { create } from "zustand";

type WhitelabelStore = {
  name: string;
  colors: WhitelabelColors;
  company: Company | null;
  domain?: string;
  slug?: string;
  favicon_path?: string;
  logo_path: string;
  banner_login_path: string;
  banner_signup_path: string;
  banner_change_password_path: string;
  banner_request_password_reset_path: string;
  setColors: (newColors: Partial<WhitelabelColors>) => void;
  setCompany: (company: Company) => void;
  setDomain: (domain: string) => void;
  setFavicon: (favicon: string) => void;
  setSlug: (slug?: string) => void;
};

export const useWhitelabelStore = create<WhitelabelStore>((set) => ({
  name: null as unknown as string,
  colors: null as unknown as WhitelabelColors,
  company: null,
  domain: undefined,
  slug: undefined,
  favicon_path: undefined,
  logo_path: null as unknown as string,
  banner_login_path: null as unknown as string,
  banner_signup_path: null as unknown as string,
  banner_change_password_path: null as unknown as string,
  banner_request_password_reset_path: null as unknown as string,
  setColors: (newColors) =>
    set((state) => ({ colors: { ...state.colors, ...newColors } })),
  setCompany: (company: Company) => set({ company }),
  setDomain: (domain: string) => set({ domain }),
  setFavicon: (favicon: string) => set({ favicon_path: favicon }),
  setSlug: (slug) => set({ slug }),
}));
