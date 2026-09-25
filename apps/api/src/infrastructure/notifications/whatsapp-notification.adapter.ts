import { INotificationPort, NotificationPayload } from '../../domain/ports/notification.port';

export class WhatsappNotificationAdapter implements INotificationPort {
  async sendReminder(payload: NotificationPayload): Promise<void> {
    console.log(`WhatsApp reminder sent to ${payload.to}: ${payload.message}`);
  }
}
