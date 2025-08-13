import { supabase } from "@/lib/supabase";
import type { Notification } from "@/types";

export async function getNotifications(userId: string): Promise<{ data: Notification[] | null; error: any }> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("sent_at", { ascending: false });

  return { data: data as Notification[] | null, error };
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    throw error;
  }
}
