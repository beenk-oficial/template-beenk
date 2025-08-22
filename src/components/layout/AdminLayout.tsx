import { AppSidebar } from "@/components/custom/AppSidebar";
import { SiteHeader } from "@/components/custom/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  CreditCard,
  CreditCardIcon,
  FileText,
  LayoutDashboard,
  Package,
  RocketIcon,
  Settings,
  Share,
  Shield,
  ShieldIcon,
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

enum AdminRoutes {
  Dashboard = "/admin/dashboard",
  Users = "/admin/users",
  Plans = "/admin/plans",
  Subscriptions = "/admin/subscriptions",
  License = "/admin/licenses",
  Payments = "/admin/payments",
  Invoices = "/admin/invoices",
  PromoCodes = "/admin/promo-codes",
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
        title: t("product"),
        icon: Package,
        items: [
          {
            title: t("plans"),
            url: AdminRoutes.Plans,
            isActive: location.pathname === AdminRoutes.Plans,
          },
          {
            title: t("promo_codes"),
            url: AdminRoutes.PromoCodes,
            icon: Tag,
            isActive: location.pathname === AdminRoutes.PromoCodes,
          },
        ],
      },
      {
        title: t("billing"),
        icon: CreditCardIcon,
        items: [
          {
            title: t("subscriptions"),
            url: AdminRoutes.Subscriptions,
            isActive: location.pathname === AdminRoutes.Subscriptions,
          },
          {
            title: t("invoices"),
            url: AdminRoutes.Invoices,
            icon: FileText,
            isActive: location.pathname === AdminRoutes.Invoices,
          },
          {
            title: t("payments"),
            url: AdminRoutes.Payments,
            icon: CreditCard,
            isActive: location.pathname === AdminRoutes.Payments,
          },

        ],
      },
      {
        title: t("access"),
        icon: ShieldIcon,
        items: [
          {
            title: t("license"),
            url: AdminRoutes.License,
            isActive: location.pathname === AdminRoutes.License,
          },
          {
            title: t("access_control"),
            url: AdminRoutes.Roles,
            icon: Shield,
            isActive: location.pathname === AdminRoutes.Roles,
          },
        ]
      },
      {
        title: t("growth"),
        icon: RocketIcon,
        items: [
          {
            title: t("referrals"),
            url: AdminRoutes.Referrals,
            icon: Share,
            isActive: location.pathname === AdminRoutes.Referrals,
          },
        ]
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

  function findActiveTitle(items: any[]): string | undefined {
    for (const item of items) {
      if (item.isActive) return item.title;
      if (item.items) {
        const found = findActiveTitle(item.items);
        if (found) return found;
      }
    }
    return undefined;
  }

  const activeItem = findActiveTitle(sidebarData.navMain) || t("dashboard");

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
        <SiteHeader activeTitle={activeItem} userId={user?.id || ""} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
