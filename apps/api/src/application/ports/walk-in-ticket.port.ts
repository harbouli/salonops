import { DailyTicket } from '../../domain/value-objects/daily-ticket.vo';

export interface IWalkInTicketPort {
  generateTicket(branchId: string, date?: Date): Promise<DailyTicket>;
}
