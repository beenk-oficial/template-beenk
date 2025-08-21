import { AppSidebar } from "@/components/custom/AppSidebar";
import { SiteHeader } from "@/components/custom/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import {
  BookOpen,
  Bot,
  LayoutDashboard,
  Settings2,
  SquareTerminal,
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
        title: "Playground",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "History",
            url: "#",
          },
          {
            title: "Starred",
            url: "#",
          },
          {
            title: "Settings",
            url: "#",
          },
        ],
      },
      {
        title: "Models",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "Genesis",
            url: "#",
          },
          {
            title: "Explorer",
            url: "#",
          },
          {
            title: "Quantum",
            url: "#",
          },
        ],
      },
      {
        title: "Documentation",
        url: "#",
        icon: BookOpen,
        items: [
          {
            title: "Introduction",
            url: "#",
          },
          {
            title: "Get Started",
            url: "#",
          },
          {
            title: "Tutorials",
            url: "#",
          },
          {
            title: "Changelog",
            url: "#",
          },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        items: [
          {
            title: "General",
            url: "#",
          },
          {
            title: "Team",
            url: "#",
          },
          {
            title: "Billing",
            url: "#",
          },
          {
            title: "Limits",
            url: "#",
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
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
