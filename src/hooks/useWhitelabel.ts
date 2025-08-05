import { useWhitelabelStore, type WhitelabelColors } from "@/stores/whitelabel";
import { setRootColors } from "@/utils/setRootColors";
import { getCompany } from "@/lib/supabase/api/company";
import { getWhitelabel } from "@/lib/supabase/api/whitelabel";

import { type Company, type WhiteLabel } from "@/types";

export function useWhitelabel() {
  const whitelabel = useWhitelabelStore((state) => state);

  const colors = useWhitelabelStore((state) => state.colors);
  const name = useWhitelabelStore((state) => state.name);
  const logo = useWhitelabelStore((state) => state.logo);
  const favicon = useWhitelabelStore((state) => state.favicon);

  const marketing_banner = useWhitelabelStore(
    (state) => state.marketing_banner
  );
  const company = useWhitelabelStore((state) => state.company);
  const setColors = useWhitelabelStore((state) => state.setColors);
  const setCompany = useWhitelabelStore((state) => state.setCompany);

  async function loadCompany({
    slug = "",
    domain = "",
  }: {
    slug?: string;
    domain?: string;
  }) {
    const response = (await getCompany({ slug, domain })) as Company;
    if (response.id) setCompany(response);
    return response;
  }

  async function loadWhitelabel({
    slug,
    domain,
  }: {
    slug?: string;
    domain?: string;
  }) {
    const company = await loadCompany({ slug, domain });
    const response = await getWhitelabel({ company_id: company?.id });

    if ('error' in response && response.error) {
      console.error("Error fetching whitelabel data:", response.error);
      return;
    }

    if (!('colors' in response)) {
      console.error("Whitelabel response missing colors property");
      return;
    }

    setColors(response.colors);
    setRootColors(response.colors as unknown as WhitelabelColors);
    useWhitelabelStore.setState({
      ...response,
      name: response.name,
      logo: response.logo_url,
      marketing_banner: response.marketing_banner,
      favicon: response.favicon_url,
    });
  }

  return {
    whitelabel,
    colors,
    name,
    logo,
    favicon,
    marketing_banner,
    loadWhitelabel,
    loadCompany,
  };
}
