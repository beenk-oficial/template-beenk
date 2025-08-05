import { AppSidebar } from "@/components/custom/AppSidebar";
import { SiteHeader } from "@/components/custom/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Share,
  Shield,
  Tag,
  Users,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useWhitelabel } from "@/hooks/useWhitelabel";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { useUserStore } from "@/stores/user";
import { setCookie } from "@/utils";
import type { User, UserType } from "@/types";
import {  useNavigate, useLocation } from "react-router-dom";

enum AdminRoutes {
  Dashboard = "/admin/dashboard",
  Users = "/admin/users",
  Plans = "/admin/plans",
  Subscriptions = "/admin/subscriptions",
  Payments = "/admin/payments",
  Invoices = "/admin/invoices",
  PromoCodes = "/admin/promo_codes",
  Referrals = "/admin/referrals",
  Roles = "/admin/roles",
  SettingsCompany = "/admin/settings/company",
  SettingsWhitelabel = "/admin/settings/whitelabel",
  SettingsBilling = "/admin/settings/billing",
  Settings = "/admin/settings",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { whitelabel } = useWhitelabel();
  const { user } = useSession();
  const t = useTranslation();
  const customFetch = useFetch();
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user?.type !== UserType.ADMIN) handleLogout();
  }, [user, location.pathname]);

  //@TODO: Finish endpoint to logout user
  // and remove access and refresh tokens from cookies.
  function handleLogout() {
    customFetch("/api/auth/logout", {
      method: "POST",
    }).then(() => {
      setUser(null as unknown as User);
      setCookie("accessToken", "", 3600);
      setCookie("refreshToken", "", 604800);
      navigate("/login");
    });
  }

  const sidebarData = {
    user: {
      name: user?.full_name,
      email: user?.email,
      avatar: user?.avatar_url,
    },
    teams: [
      {
        name: whitelabel?.name,
        logo: () => (
          <img
            src={whitelabel?.favicon}
            alt={`${whitelabel?.name} logo`}
            className="h-6 w-6"
          />
        ),
        plan: whitelabel?.company?.email,
      },
    ],
    navMain: [
      {
        title: t("general.dashboard"),
        url: AdminRoutes.Dashboard,
        icon: LayoutDashboard,
        isActive: location.pathname === AdminRoutes.Dashboard,
      },
      {
        title: t("general.manage_users"),
        url: AdminRoutes.Users,
        icon: Users,
        isActive: location.pathname === AdminRoutes.Users,
      },
      {
        title: t("general.plans"),
        url: AdminRoutes.Plans,
        icon: Tag,
        isActive: location.pathname === AdminRoutes.Plans,
      },
      {
        title: t("general.subscriptions"),
        url: AdminRoutes.Subscriptions,
        icon: Package,
        isActive: location.pathname === AdminRoutes.Subscriptions,
      },
      {
        title: t("general.payments"),
        url: AdminRoutes.Payments,
        icon: CreditCard,
        isActive: location.pathname === AdminRoutes.Payments,
      },
      {
        title: t("general.invoices"),
        url: AdminRoutes.Invoices,
        icon: FileText,
        isActive: location.pathname === AdminRoutes.Invoices,
      },
      {
        title: t("general.promo_codes"),
        url: AdminRoutes.PromoCodes,
        icon: Tag,
        isActive: location.pathname === AdminRoutes.PromoCodes,
      },
      {
        title: t("general.referrals"),
        url: AdminRoutes.Referrals,
        icon: Share,
        isActive: location.pathname === AdminRoutes.Referrals,
      },
      {
        title: t("general.access_control"),
        url: AdminRoutes.Roles,
        icon: Shield,
        isActive: location.pathname === AdminRoutes.Roles,
      },
      {
        title: t("general.settings"),
        icon: Settings,
        isActive: location.pathname.startsWith(AdminRoutes.Settings),
        items: [
          {
            title: t("general.company"),
            url: AdminRoutes.SettingsCompany,
          },
          {
            title: t("general.whitelabel"),
            url: AdminRoutes.SettingsWhitelabel,
          },
          {
            title: t("general.billing"),
            url: AdminRoutes.SettingsBilling,
          },
        ],
      },
    ],
  };

  const activeItem =
    sidebarData.navMain.find((item) => item.isActive)?.title ||
    t("general.dashboard");

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" data={sidebarData} />
      <SidebarInset>
        <SiteHeader activeTitle={activeItem} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
