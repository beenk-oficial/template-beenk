import { create } from "zustand";
import type { Notification } from "@/types";

type NotificationState = {
  notifications: Notification[];

  setNotifications: (notifications: Notification[]) => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
}));
