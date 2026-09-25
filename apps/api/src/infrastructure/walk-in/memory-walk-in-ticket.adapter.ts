import { IWalkInTicketPort } from '../../application/ports/walk-in-ticket.port';
import { DailyTicket } from '../../domain/value-objects/daily-ticket.vo';

export class MemoryWalkInTicketAdapter implements IWalkInTicketPort {
  private currentTicket = 0;
  private lastDate = new Date().toDateString();

  public async generateTicket(branchId: string, date: Date = new Date()): Promise<DailyTicket> {
    const today = date.toDateString();
    if (today !== this.lastDate) {
      this.currentTicket = 0;
      this.lastDate = today;
    }
    this.currentTicket += 1;
    return DailyTicket.create(this.currentTicket, branchId, date);
  }
}
