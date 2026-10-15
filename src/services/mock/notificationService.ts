import { Notification, NotificationType } from '../../types';
import { getStorage, setStorage, STORAGE_KEYS, initStorageIfEmpty } from '../mockStorage';
import { INITIAL_NOTIFICATIONS } from '../../data/mockData';

export const notificationService = {
  getUserNotifications: (userId: string): Notification[] => {
    initStorageIfEmpty();
    const notifs = getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return notifs
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUnreadCount: (userId: string): number => {
    const list = notificationService.getUserNotifications(userId);
    return list.filter((n) => !n.isRead).length;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    const notifs = getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = notifs.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));
    setStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    const notifs = getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = notifs.map((n) => (n.userId === userId ? { ...n, isRead: true } : n));
    setStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  createNotification: async (params: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
  }): Promise<Notification> => {
    initStorageIfEmpty();
    const notifs = getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...notifs]);
    return newNotif;
  },
};
