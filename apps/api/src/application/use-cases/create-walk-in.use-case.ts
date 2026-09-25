import { IAppointmentRepository } from '../../domain/ports/appointment-repository.port';
import { IClientRepository } from '../../domain/ports/client-repository.port';
import { IStylistRepository } from '../../domain/ports/stylist-repository.port';
import { IWalkInTicketPort } from '../ports/walk-in-ticket.port';
import { MoroccanPhoneNumber } from '../../domain/value-objects/phone-number.vo';
import { Client } from '../../domain/models/client.entity';
import { Appointment } from '../../domain/models/appointment.entity';
import { StylistUnavailableException } from '../../domain/exceptions/domain.exception';
import { randomUUID } from 'crypto';
import { TimeSlot } from '../../domain/value-objects/time-slot.vo';
import { Money } from '../../domain/value-objects/money.vo';

export interface CreateWalkInRequest {
  branchId: string;
  phone: string;
  fullName: string;
  serviceId: string;
  price: number; 
  durationMinutes: number; 
  bufferMinutes?: number;
}

export interface CreateWalkInResponse {
  appointmentId: string;
  clientId: string;
  stylistId: string;
  ticket: {
    number: number;
    formatted: string;
  };
}

export class CreateWalkInUseCase {
  constructor(
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly clientRepo: IClientRepository,
    private readonly stylistRepo: IStylistRepository,
    private readonly walkInTicketPort: IWalkInTicketPort
  ) {}

  public async execute(request: CreateWalkInRequest): Promise<CreateWalkInResponse> {
    // 1. Auto-Client Resolution
    const moroccanPhone = MoroccanPhoneNumber.create(request.phone);
    let client = await this.clientRepo.findByPhone(moroccanPhone.value);
    
    if (!client) {
      client = new Client({
        id: randomUUID(),
        branchId: request.branchId,
        fullName: request.fullName,
        phone: moroccanPhone
      });
      await this.clientRepo.save(client);
    }

    // 2. Immediate Chair Assignment
    const activeStylists = await this.stylistRepo.findAllActive(request.branchId);
    if (activeStylists.length === 0) {
      throw new StylistUnavailableException('Aucun coiffeur actif disponible dans cette succursale.');
    }

    const now = new Date();
    const timeSlot = TimeSlot.create(now, request.durationMinutes, request.bufferMinutes ?? 0);
    
    let assignedStylistId: string | null = null;
    
    for (const stylist of activeStylists) {
      const overlaps = await this.appointmentRepo.findOverlapping(
        stylist.id,
        timeSlot.startTime,
        timeSlot.bufferEndTime
      );
      
      if (overlaps.length === 0) {
        assignedStylistId = stylist.id;
        break;
      }
    }

    if (!assignedStylistId) {
      throw new StylistUnavailableException('Tous les coiffeurs sont actuellement occupés.');
    }

    // 3. Generate Ticket
    const ticket = await this.walkInTicketPort.generateTicket(request.branchId, now);

    // 4. Create and Save Appointment
    const appointment = new Appointment({
      id: randomUUID(),
      branchId: request.branchId,
      stylistId: assignedStylistId,
      clientId: client.id,
      serviceId: request.serviceId,
      timeSlot,
      price: Money.fromMad(request.price),
      status: 'IN_CHAIR', // Immediate seating
      notes: `Walk-in: ${ticket.formatted}`
    });

    await this.appointmentRepo.save(appointment);

    return {
      appointmentId: appointment.id,
      clientId: client.id,
      stylistId: assignedStylistId,
      ticket: {
        number: ticket.number,
        formatted: ticket.formatted
      }
    };
  }
}
