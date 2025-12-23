/**
 * Типы и интерфейсы для системы уведомлений
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string; // Ссылка для перехода
  actionLabel?: string;
  onAction?: () => void;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  generationComplete: boolean;
  newFeatures: boolean;
  subscriptionUpdates: boolean;
  marketingEmails: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  generationComplete: true,
  newFeatures: true,
  subscriptionUpdates: true,
  marketingEmails: false,
};

