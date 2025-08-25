import { supabase } from "@/lib/supabase";
import type { Notification } from "@/types";
import { useNotificationStore } from "@/stores/notification";


export async function fetchNotifications(userId: string) {
  const setNotifications = useNotificationStore.getState().setNotifications;

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("sent_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar notificações:", error);
      throw error;
    }

    setNotifications(data as Notification[] || []);
    return data;
  } catch (err) {
    setNotifications([]);
    throw err;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) throw error;

    // Atualiza o store local
    const store = useNotificationStore.getState();
    store.setNotifications(
      store.notifications.map((n) =>
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
  } catch (err) {
    console.error("Erro ao marcar notificação como lida:", err);
    throw err;
  }
}

export async function markManyAsRead(notificationIds: string[]) {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", notificationIds);

    if (error) throw error;

    const store = useNotificationStore.getState();
    store.setNotifications(
      store.notifications.map((n) =>
        notificationIds.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
  } catch (err) {
    console.error("Erro ao marcar várias notificações como lidas:", err);
    throw err;
  }
}