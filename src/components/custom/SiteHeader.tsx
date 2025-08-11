import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SiteHeader({ activeTitle }: { activeTitle?: string }) {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Novo comentário", description: "Alguém comentou no seu post.", read: false },
    { id: 2, title: "Atualização disponível", description: "Versão 2.0 está no ar!", read: false },
    { id: 3, title: "Backup concluído", description: "", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
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
              {notifications.length > 0 && (
                <DropdownMenuItem
                  onClick={markAllAsRead}
                  className="text-blue-600 cursor-pointer font-medium"
                >
                  Marcar todas como lidas
                </DropdownMenuItem>
              )}

              {notifications.length === 0 && (
                <div className="p-4 text-gray-500 text-sm text-center">
                  Nenhuma notificação
                </div>
              )}

              {notifications.map(notif => (
                <DropdownMenuItem
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-medium flex-1">{notif.title}</span>
                    {!notif.read && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                        Novo
                      </span>
                    )}
                  </div>
                  {notif.description && (
                    <p className="text-sm text-gray-500">{notif.description}</p>
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
