import { INotificationPort } from '../../domain/ports/notification.port';
import { MoroccanPhoneNumber } from '../../domain/value-objects/phone-number.vo';

export class SendReminderUseCase {
  constructor(private readonly notificationPort: INotificationPort) {}

  async execute(phone: string, message: string): Promise<void> {
    const phoneNumber = MoroccanPhoneNumber.create(phone);
    await this.notificationPort.sendReminder({
      to: phoneNumber.getValue(),
      message,
    });
  }
}
