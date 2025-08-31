import { useWhitelabelStore } from "@/stores/whitelabel";
import { setRootColors } from "@/utils/setRootColors";

import { type WhitelabelColors } from "@/types";
import { getImageUrl } from "@/lib/supabase/api/admin/image";
import { getCompany } from "@/lib/supabase/api/company";

export function useWhitelabel() {
  const {
    colors,
    name,
    logo_path,
    favicon_path,
    banner_login_path,
    banner_signup_path,
    banner_change_password_path,
    banner_request_password_reset_path,
    company,
    ...whitelabel
  } = useWhitelabelStore();

  const setCompany = useWhitelabelStore((state) => state.setCompany);

  async function loadCompany({
    slug = "",
    domain = "",
  }: {
    slug?: string;
    domain?: string;
  }) {
    const response = await getCompany({ slug, domain });
    console.log("Company fetched:", response);
    setCompany(response);
    return response;
  }

  async function loadWhitelabel({
    slug,
    domain,
  }: {
    slug?: string;
    domain?: string;
  }) {
    try {
      const company = await loadCompany({ slug, domain });
      const whitelabel = company.whitelabel || {};

      const logo = whitelabel.logo_path ? await getImageUrl("admin", whitelabel.logo_path) : "";
      const favicon = whitelabel.favicon_path ? await getImageUrl("admin", whitelabel.favicon_path) : "";
      const banner_login = whitelabel.banner_login_path ? await getImageUrl("admin", whitelabel.banner_login_path) : "";
      const banner_signup = whitelabel.banner_signup_path ? await getImageUrl("admin", whitelabel.banner_signup_path) : "";
      const banner_change_password = whitelabel.banner_change_password_path ? await getImageUrl("admin", whitelabel.banner_change_password_path) : "";
      const banner_request_password_reset = whitelabel.banner_request_password_reset_path ? await getImageUrl("admin", whitelabel.banner_request_password_reset_path) : "";

      setRootColors(whitelabel.colors as unknown as WhitelabelColors);
      useWhitelabelStore.setState({
        name: company.name,
        company: company,
        domain: company.domain,
        slug: company.slug,
        logo_path: logo,
        favicon_path: favicon,
        banner_login_path: banner_login,
        banner_signup_path: banner_signup,
        banner_change_password_path: banner_change_password,
        banner_request_password_reset_path: banner_request_password_reset,
        colors: whitelabel.colors,
      });
    } catch (error) {
      console.error("Error loading whitelabel:", error);
    }
  }

  return {
    whitelabel,
    company,
    colors,
    name,
    logo_path,
    favicon_path,
    banner_login_path,
    banner_signup_path,
    banner_change_password_path,
    banner_request_password_reset_path,
    loadWhitelabel,
    loadCompany,
  };
}
