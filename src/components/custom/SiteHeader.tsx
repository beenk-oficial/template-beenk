import { useState, useEffect } from "react";
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

import type { Notification } from "@/types";
import { getNotifications, markNotificationAsRead } from "@/lib/supabase/api/notification";

export function SiteHeader({ activeTitle, userId }: { activeTitle?: string; userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    getNotifications(userId)
      .then(({ data, error }) => {
        if (error) {
          setError("Erro ao carregar notificações.");
          console.error(error);
        } else if (data) {
          setNotifications(data);
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (error) {
      console.log("Erro ao marcar notificação como lida:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(notifications.map(n => markNotificationAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    } catch (error) {
      console.log("Erro ao marcar todas as notificações como lidas:", error);
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
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
              {loading && (
                <div className="p-4 text-center text-gray-400 text-sm">Carregando...</div>
              )}

              {error && (
                <div className="p-4 text-center text-red-500 text-sm">{error}</div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="p-4 text-gray-400 text-sm text-center">
                  Nenhuma notificação
                </div>
              )}

              {notifications.length > 0 && (
                <DropdownMenuItem
                  onClick={markAllAsRead}
                  className="text-muted-foreground cursor-pointer font-medium"
                >
                  Marcar todas como lidas
                </DropdownMenuItem>
              )}

              {notifications.map(notif => (
                <DropdownMenuItem
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-medium flex-1">{notif.title}</span>
                    {!notif.read_at && (
                      <span className="text-xs bg-sidebar text-popover-foreground px-2 py-0.5 rounded-full">
                        Novo
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
