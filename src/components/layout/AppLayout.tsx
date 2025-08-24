import { AppSidebar } from "@/components/custom/AppSidebar";
import { SiteHeader } from "@/components/custom/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import {
  BookOpen,
  Bot,
  LayoutDashboard,
  SquareTerminal,
  Users,
  Package,
  Box,
  FileText,
  CreditCard,
  DollarSign,
  Truck,
  ClipboardList,
  ShoppingCart,
  ArrowLeftRight,
} from "lucide-react";
import { logout, refreshToken } from "@/lib/supabase/api/auth";
import { useSession } from "@/hooks/useSession";
import { useTranslation } from "react-i18next";
import { useUserStore } from "@/stores/user";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useWhitelabel } from "@/hooks/useWhitelabel";
import { UserType, type User } from "@/types";
import { Spinner } from "../custom/Spinner";

enum AppRoutes {
  Dashboard = "/app/dashboard",
  Customers = "/app/customers",
  Vehicles = "/app/vehicles",
  Services = "/app/services",
  Products = "/app/products",
  WorkOrders = "/app/work-orders",
  Sales = "/app/sales",
  AccountsReceivable = "/app/accounts-receivable",
  AccountsPayable = "/app/accounts-payable",
  StockMovements = "/app/stock-movements",
}

export default function AppLayout() {
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
          if (!response) handleLogout();

          setUser(response.user as unknown as User);

        } else {
          if (user?.type !== UserType.USER) handleLogout();
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
        url: AppRoutes.Dashboard,
        icon: LayoutDashboard,
        isActive: location.pathname === AppRoutes.Dashboard,
      },
      {
        title: t("customers"),
        url: AppRoutes.Customers,
        icon: Users,
        isActive: location.pathname.startsWith(AppRoutes.Customers),
      },
      {
        title: t("vehicles"),
        url: AppRoutes.Vehicles,
        icon: Truck, // Alterado de Package para Truck
        isActive: location.pathname.startsWith(AppRoutes.Vehicles),
      },
      {
        title: t("services"),
        url: AppRoutes.Services,
        icon: ClipboardList, // Alterado de Bot para ClipboardList
        isActive: location.pathname.startsWith(AppRoutes.Services),
      },
      {
        title: t("products"),
        url: AppRoutes.Products,
        icon: Box,
        isActive: location.pathname.startsWith(AppRoutes.Products),
      },
      {
        title: t("work_orders"),
        url: AppRoutes.WorkOrders,
        icon: FileText,
        isActive: location.pathname.startsWith(AppRoutes.WorkOrders),
      },
      {
        title: t("sales"),
        url: AppRoutes.Sales,
        icon: ShoppingCart, // Alterado de CreditCard para ShoppingCart
        isActive: location.pathname.startsWith(AppRoutes.Sales),
      },
      {
        title: t("accounts_receivable"),
        url: AppRoutes.AccountsReceivable,
        icon: DollarSign, // Alterado de BookOpen para DollarSign
        isActive: location.pathname.startsWith(AppRoutes.AccountsReceivable),
      },
      {
        title: t("accounts_payable"),
        url: AppRoutes.AccountsPayable,
        icon: CreditCard, // Mantido para representar pagamentos
        isActive: location.pathname.startsWith(AppRoutes.AccountsPayable),
      },
      {
        title: t("stock_movements"),
        url: AppRoutes.StockMovements,
        icon: ArrowLeftRight, // Alterado de SquareTerminal para ArrowLeftRight
        isActive: location.pathname.startsWith(AppRoutes.StockMovements),
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
