import { create } from "zustand";
import type { Notification } from "@/types";
import * as notificationApi from "@/lib/supabase/api/notification";

type NotificationState = {
  notifications: Notification[];
  loading: boolean;
  error: string | null;

  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async (userId: string) => {
    set({ loading: true, error: null });
    const { data, error } = await notificationApi.getNotifications(userId);
    if (error) {
      set({ error: error.message || "Erro ao carregar notificações", loading: false });
    } else {
      set({ notifications: data || [], loading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await notificationApi.markNotificationAsRead(notificationId);
      set({
        notifications: get().notifications.map((n) =>
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        ),
      });
    } catch (error) {
      console.error("Erro ao marcar notificação como lida no store:", error);
    }
  },
}));
