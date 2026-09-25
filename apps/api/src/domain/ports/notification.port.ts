export interface NotificationPayload {
  to: string;
  message: string;
}

export interface INotificationPort {
  sendReminder(payload: NotificationPayload): Promise<void>;
}
