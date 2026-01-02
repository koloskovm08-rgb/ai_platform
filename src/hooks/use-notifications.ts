'use client';

import * as React from 'react';
import type { Notification, NotificationType } from '@/lib/notifications/types';

const NOTIFICATIONS_STORAGE_KEY = 'ai-platform-notifications';
const MAX_NOTIFICATIONS = 50; // Максимум хранимых уведомлений

/**
 * Хук для управления уведомлениями
 */
export function useNotifications() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  // Загрузка из localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Восстанавливаем Date объекты
        const withDates = parsed.map((n: Notification & { timestamp: string }) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })) as Notification[];
        setNotifications(withDates);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);

  // Сохранение в localStorage
  const saveNotifications = React.useCallback((newNotifications: Notification[]) => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(newNotifications));
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, []);

  // Добавить уведомление
  const addNotification = React.useCallback(
    (
      type: NotificationType,
      title: string,
      message: string,
      options?: {
        link?: string;
        actionLabel?: string;
        onAction?: () => void;
      }
    ) => {
      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        title,
        message,
        timestamp: new Date(),
        read: false,
        ...options,
      };

      const updated = [notification, ...notifications].slice(0, MAX_NOTIFICATIONS);
      saveNotifications(updated);

      return notification.id;
    },
    [notifications, saveNotifications]
  );

  // Отметить как прочитанное
  const markAsRead = React.useCallback(
    (id: string) => {
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  // Отметить все как прочитанные
  const markAllAsRead = React.useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // Удалить уведомление
  const removeNotification = React.useCallback(
    (id: string) => {
      const updated = notifications.filter((n) => n.id !== id);
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  // Очистить все
  const clearAll = React.useCallback(() => {
    saveNotifications([]);
  }, [saveNotifications]);

  // Количество непрочитанных
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}

