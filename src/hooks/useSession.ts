import { useUserStore } from "@/stores/user";
import { useWhitelabelStore } from "@/stores/whitelabel";

export const useSession = () => {
  const user = useUserStore((state) => state.user);
  const userId = useUserStore((state) => state.user?.id);
  const company = useWhitelabelStore((state) => state.company);
  const companyId = useWhitelabelStore((state) => state.company?.id);
  const slug = useWhitelabelStore((state) => state.company?.slug);
  const domain = useWhitelabelStore((state) => state.company?.domain);

  return {
    user,
    userId,
    company,
    companyId,
    slug,
    domain,
  };
};
