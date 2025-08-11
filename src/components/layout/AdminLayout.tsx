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
import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user";
import { type User, UserType } from "@/types";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { logout, refreshToken } from "@/lib/supabase/api/auth";
import { Spinner } from "../custom/Spinner";
import { getCompanyIdFromToken } from "@/utils/api";

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

export default function AdminLayout() {
  const { whitelabel } = useWhitelabel();
  const { user } = useSession();
  const { t } = useTranslation("general");
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const checkUser = async () => {
      try {
        if (!user?.email) {
          const response = await refreshToken();
          if (!response.user) handleLogout();

          setUser(response.user as unknown as User);

        } else {
          if (user?.type !== UserType.ADMIN) handleLogout();
        }

        setLoading(false);
      } catch {
        handleLogout();
      }
    };

    checkUser();
  }, [user, location.pathname]);

  function handleLogout() {
    logout({
      email: user?.email || "",
      company_id: user?.company_id || "",
    });
    setUser(null as unknown as User);
    navigate("/auth/signin");
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
        title: t("dashboard"),
        url: AdminRoutes.Dashboard,
        icon: LayoutDashboard,
        isActive: location.pathname === AdminRoutes.Dashboard,
      },
      {
        title: t("manage_users"),
        url: AdminRoutes.Users,
        icon: Users,
        isActive: location.pathname === AdminRoutes.Users,
      },
      {
        title: t("plans"),
        url: AdminRoutes.Plans,
        icon: Tag,
        isActive: location.pathname === AdminRoutes.Plans,
      },
      {
        title: t("subscriptions"),
        url: AdminRoutes.Subscriptions,
        icon: Package,
        isActive: location.pathname === AdminRoutes.Subscriptions,
      },
      {
        title: t("payments"),
        url: AdminRoutes.Payments,
        icon: CreditCard,
        isActive: location.pathname === AdminRoutes.Payments,
      },
      {
        title: t("invoices"),
        url: AdminRoutes.Invoices,
        icon: FileText,
        isActive: location.pathname === AdminRoutes.Invoices,
      },
      {
        title: t("promo_codes"),
        url: AdminRoutes.PromoCodes,
        icon: Tag,
        isActive: location.pathname === AdminRoutes.PromoCodes,
      },
      {
        title: t("referrals"),
        url: AdminRoutes.Referrals,
        icon: Share,
        isActive: location.pathname === AdminRoutes.Referrals,
      },
      {
        title: t("access_control"),
        url: AdminRoutes.Roles,
        icon: Shield,
        isActive: location.pathname === AdminRoutes.Roles,
      },
      {
        title: t("settings"),
        icon: Settings,
        isActive: location.pathname.startsWith(AdminRoutes.Settings),
        items: [
          {
            title: t("company"),
            url: AdminRoutes.SettingsCompany,
          },
          {
            title: t("whitelabel"),
            url: AdminRoutes.SettingsWhitelabel,
          },
          {
            title: t("billing"),
            url: AdminRoutes.SettingsBilling,
          },
        ],
      },
    ],
  };

  const activeItem =
    sidebarData.navMain.find((item) => item.isActive)?.title ||
    t("dashboard");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background/20">
        <Spinner />
      </div>
    );
  }

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
            <Outlet />

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
