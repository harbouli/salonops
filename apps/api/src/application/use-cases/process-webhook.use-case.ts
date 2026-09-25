export class ProcessWebhookUseCase {
  async execute(payload: any): Promise<void> {
    if (payload && payload.status === 'delivered') {
      console.log(`Message delivered to ${payload.to}`);
    }
    if (payload && payload.status === 'confirmed') {
      console.log(`Client confirmed appointment: ${payload.to}`);
    }
  }
}
