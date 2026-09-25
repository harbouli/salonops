import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { SendReminderUseCase } from '../../src/application/use-cases/send-reminder.use-case';
import { INotificationPort, NotificationPayload } from '../../src/domain/ports/notification.port';

class MockNotificationPort implements INotificationPort {
  public sentPayloads: NotificationPayload[] = [];
  async sendReminder(payload: NotificationPayload): Promise<void> {
    this.sentPayloads.push(payload);
  }
}

describe('SendReminderUseCase', () => {
  it('should send reminder with valid phone number', async () => {
    const port = new MockNotificationPort();
    const useCase = new SendReminderUseCase(port);
    
    await useCase.execute('0612345678', 'Hello');
    
    assert.equal(port.sentPayloads.length, 1);
    assert.equal(port.sentPayloads[0].to, '+212612345678');
    assert.equal(port.sentPayloads[0].message, 'Hello');
  });
});
