import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationStore } from "@/stores/notification";
import { useTranslation } from "react-i18next";
import { fetchNotifications,markNotificationAsRead, markManyAsRead } from "@/lib/supabase/api/notification";

export function SiteHeader({ activeTitle, userId }: { activeTitle?: string; userId: string }) {
    const { notifications } = useNotificationStore();
    const { t } = useTranslation("general");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
    setLoading(true);
    fetchNotifications(userId)
      .catch(err => setError(err.message || "Erro ao carregar notificações"))
      .finally(() => setLoading(false));
    }
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const markAllAsRead = async () => {
    try {
      await markManyAsRead(
        notifications.filter(n => !n.read_at).map(n => n.id)
      );

      useNotificationStore.getState().setNotifications(
      notifications.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );

    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
  try {
    await markNotificationAsRead(notificationId);
    useNotificationStore.getState().setNotifications(
      notifications.map(n =>
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
  } catch (err) {
    console.error("Erro ao marcar notificação como lida:", err);
  }
};

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{activeTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative rounded-md border">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-red-500 text-white font-light rounded-full flex items-center justify-center w-4 h-4 ${unreadCount >= 10 ? "text-[10px]" : "text-[8px]"}`}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
              {loading && (
                <div className="p-4 text-center text-muted-foreground text-sm">{t("loading")}</div>
              )}

              {error && (
                <div className="p-4 text-center text-red-500 text-sm">{error}</div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="p-4 text-muted-foreground text-sm text-center">
                  {t("no_notifications")}
                </div>
              )}

              {notifications.length > 0 && (
                <DropdownMenuItem
                  onClick={markAllAsRead}
                  className="text-muted-foreground cursor-pointer font-medium"
                >
                  {t("mark_all_as_read")}
                </DropdownMenuItem>
              )}

              {notifications.slice(0, 10).map(notif => (
                <DropdownMenuItem
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-semibold flex-1">{notif.title}</span>
                    {!notif.read_at && (
                      <span className="text-xs bg-sidebar/50 text-popover-foreground px-2 py-0.5 rounded-full border border-popover-foreground/30">
                        {t("new")}
                      </span>
                    )}
                  </div>
                  {notif.message && (
                    <p className="text-sm text-gray-400">{notif.message}</p>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
