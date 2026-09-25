/// <reference types="node" />
import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CreateWalkInUseCase } from '../../../src/application/use-cases/create-walk-in.use-case';
import { IAppointmentRepository } from '../../../src/domain/ports/appointment-repository.port';
import { IClientRepository } from '../../../src/domain/ports/client-repository.port';
import { IStylistRepository } from '../../../src/domain/ports/stylist-repository.port';
import { IWalkInTicketPort } from '../../../src/application/ports/walk-in-ticket.port';
import { Stylist } from '../../../src/domain/models/stylist.entity';
import { Client } from '../../../src/domain/models/client.entity';
import { MoroccanPhoneNumber } from '../../../src/domain/value-objects/phone-number.vo';
import { DailyTicket } from '../../../src/domain/value-objects/daily-ticket.vo';

describe('CreateWalkInUseCase', () => {
  let useCase: CreateWalkInUseCase;
  let mockAppointmentRepo: unknown;
  let mockClientRepo: unknown;
  let mockStylistRepo: unknown;
  let mockTicketPort: unknown;

  beforeEach(() => {
    mockAppointmentRepo = {
      findOverlapping: async () => [],
      save: async (app: any) => app,
    };
    mockClientRepo = {
      findByPhone: async () => null,
      save: async (c: any) => c,
    };
    mockStylistRepo = {
      findAllActive: async () => [
        { id: 'stylist-1' } as unknown as Stylist
      ],
    };
    mockTicketPort = {
      generateTicket: async (branchId: string, date: Date) => DailyTicket.create(14, branchId, date),
    };

    useCase = new CreateWalkInUseCase(
      mockAppointmentRepo as IAppointmentRepository,
      mockClientRepo as IClientRepository,
      mockStylistRepo as IStylistRepository,
      mockTicketPort as IWalkInTicketPort
    );
  });

  it('should auto-create a client and assign the first available stylist', async () => {
    const start = performance.now();
    
    const response = await useCase.execute({
      branchId: 'branch-1',
      phone: '0612345678',
      fullName: 'WalkIn Client',
      serviceId: 'service-1',
      price: 150,
      durationMinutes: 30
    });
    
    const end = performance.now();
    const duration = end - start;

    assert.ok(response.appointmentId);
    assert.ok(response.clientId);
    assert.equal(response.stylistId, 'stylist-1');
    assert.equal(response.ticket.number, 14);
    assert.equal(response.ticket.formatted, 'Ticket #14');
    
    // Performance assertion (< 100ms)
    assert.ok(duration < 100, `Execution time ${duration}ms is not under 100ms`);
  });

  it('should use existing client if phone number matches', async () => {
    const existingClient = new Client({
      id: 'existing-client-id',
      branchId: 'branch-1',
      fullName: 'Existing Client',
      phone: MoroccanPhoneNumber.create('0612345678')
    });
    
    (mockClientRepo as any).findByPhone = async () => existingClient;
    
    const response = await useCase.execute({
      branchId: 'branch-1',
      phone: '0612345678',
      fullName: 'WalkIn Client',
      serviceId: 'service-1',
      price: 150,
      durationMinutes: 30
    });

    assert.equal(response.clientId, 'existing-client-id');
  });

  it('should throw an error if no stylist is available', async () => {
    (mockAppointmentRepo as any).findOverlapping = async () => [{ id: 'blocking-appointment' }];
    
    try {
      await useCase.execute({
        branchId: 'branch-1',
        phone: '0612345678',
        fullName: 'WalkIn Client',
        serviceId: 'service-1',
        price: 150,
        durationMinutes: 30
      });
      assert.fail('Should have thrown StylistUnavailableException');
    } catch (err: any) {
      assert.equal(err.name, 'StylistUnavailableException');
      assert.match(err.message, /Tous les coiffeurs sont actuellement occupés/);
    }
  });
});
