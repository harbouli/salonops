import { INotificationPort } from '../../domain/ports/notification.port';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo';

export class SendReminderUseCase {
  constructor(private readonly notificationPort: INotificationPort) {}

  async execute(phone: string, message: string): Promise<void> {
    const phoneNumber = PhoneNumber.create(phone);
    await this.notificationPort.sendReminder({
      to: phoneNumber.getValue(),
      message,
    });
  }
}
