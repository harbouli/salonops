import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BookAppointmentUseCase } from '../../src/application/use-cases/book-appointment.use-case';
import { IAppointmentRepository } from '../../src/domain/ports/appointment-repository.port';
import { IStylistRepository } from '../../src/domain/ports/stylist-repository.port';
import { IServiceRepository } from '../../src/domain/ports/service-repository.port';
import { IClientRepository } from '../../src/domain/ports/client-repository.port';
import { IDistributedLockPort } from '../../src/domain/ports/distributed-lock.port';
import { Stylist } from '../../src/domain/models/stylist.entity';
import { Service } from '../../src/domain/models/service.entity';
import { Client } from '../../src/domain/models/client.entity';
import { Appointment } from '../../src/domain/models/appointment.entity';
import { TimeSlot } from '../../src/domain/value-objects/time-slot.vo';
import { Money } from '../../src/domain/value-objects/money.vo';
import { MoroccanPhoneNumber } from '../../src/domain/value-objects/phone-number.vo';
import {
  SlotCollisionException,
  StylistUnavailableException,
} from '../../src/domain/exceptions/domain.exception';

describe('BookAppointmentUseCase (Hexagonal Inbound Port Orchestration)', () => {
  const dummyStylist = new Stylist({
    id: 'stylist-uuid-1',
    branchId: 'branch-uuid-1',
    fullName: 'Fatima Zahra',
    phone: '0612345678',
    role: 'STYLIST',
    commissionPct: 20,
    isActive: true,
    isDayOff: false,
    workingStart: '08:00',
    workingEnd: '20:00',
  });

  const dummyService = new Service({
    id: 'service-uuid-1',
    branchId: 'branch-uuid-1',
    nameFr: 'Coloration + Brushing',
    nameAr: 'صبغة وسشوار',
    category: 'coloration',
    durationMinutes: 90,
    bufferMinutes: 15,
    price: Money.fromMad(450),
    depositRequired: false,
  });

  const dummyClient = new Client({
    id: 'client-uuid-1',
    branchId: 'branch-uuid-1',
    fullName: 'Salma Bennani',
    phone: MoroccanPhoneNumber.create('0698765432'),
  });

  function createMockPorts(options?: {
    overlappingAppointments?: Appointment[];
    stylistDayOff?: boolean;
  }) {
    let savedAppointment: Appointment | null = null;

    const appointmentRepo: IAppointmentRepository = {
      findById: async () => null,
      findAll: async () => [],
      findByStylistAndDateRange: async () => [],
      findOverlapping: async () => options?.overlappingAppointments ?? [],
      save: async (apt) => {
        savedAppointment = apt;
        return apt;
      },
    };

    const stylistRepo: IStylistRepository = {
      findById: async (id) => {
        if (id === dummyStylist.id) {
          if (options?.stylistDayOff) {
            return new Stylist({ ...dummyStylist, isDayOff: true });
          }
          return dummyStylist;
        }
        return null;
      },
      findAllActive: async () => [dummyStylist],
    };

    const serviceRepo: IServiceRepository = {
      findById: async (id) => (id === dummyService.id ? dummyService : null),
      findAll: async () => [dummyService],
    };

    const clientRepo: IClientRepository = {
      findById: async (id) => (id === dummyClient.id ? dummyClient : null),
      findByPhone: async () => null,
      search: async () => [dummyClient],
      save: async (c) => c,
    };

    let lockAcquired = false;
    let lockReleased = false;

    const lockService: IDistributedLockPort = {
      acquireLock: async () => {
        lockAcquired = true;
        return {
          release: async () => {
            lockReleased = true;
          },
        };
      },
    };

    return {
      appointmentRepo,
      stylistRepo,
      serviceRepo,
      clientRepo,
      lockService,
      getLockState: () => ({ lockAcquired, lockReleased }),
      getSaved: () => savedAppointment,
    };
  }

  it('should successfully book appointment and release distributed lock', async () => {
    const ports = createMockPorts();
    const useCase = new BookAppointmentUseCase(
      ports.appointmentRepo,
      ports.stylistRepo,
      ports.serviceRepo,
      ports.clientRepo,
      ports.lockService
    );

    const bookingDate = new Date();
    bookingDate.setHours(14, 0, 0, 0);

    const result = await useCase.execute({
      branchId: 'branch-uuid-1',
      stylistId: dummyStylist.id,
      clientId: dummyClient.id,
      serviceId: dummyService.id,
      startTime: bookingDate.toISOString(),
      notes: 'Formule sans ammoniaque demandée',
    });

    assert.ok(result.id);
    assert.equal(result.status, 'BOOKED');
    assert.equal(result.priceMad, '450.00');
    assert.equal(result.notes, 'Formule sans ammoniaque demandée');

    const lockState = ports.getLockState();
    assert.equal(lockState.lockAcquired, true);
    assert.equal(lockState.lockReleased, true);
  });

  it('should prevent booking and release lock when a slot collision occurs', async () => {
    const bookingDate = new Date();
    bookingDate.setHours(14, 0, 0, 0);

    const existingSlot = TimeSlot.create(bookingDate, 60, 15);
    const collidingApt = new Appointment({
      id: 'existing-apt',
      branchId: 'branch-uuid-1',
      stylistId: dummyStylist.id,
      clientId: dummyClient.id,
      serviceId: dummyService.id,
      timeSlot: existingSlot,
      price: Money.fromMad(200),
      status: 'CONFIRMED',
    });

    const ports = createMockPorts({ overlappingAppointments: [collidingApt] });
    const useCase = new BookAppointmentUseCase(
      ports.appointmentRepo,
      ports.stylistRepo,
      ports.serviceRepo,
      ports.clientRepo,
      ports.lockService
    );

    await assert.rejects(
      async () => {
        await useCase.execute({
          branchId: 'branch-uuid-1',
          stylistId: dummyStylist.id,
          clientId: dummyClient.id,
          serviceId: dummyService.id,
          startTime: bookingDate.toISOString(),
        });
      },
      SlotCollisionException
    );

    // Distributed lock must always be released even on failure!
    const lockState = ports.getLockState();
    assert.equal(lockState.lockAcquired, true);
    assert.equal(lockState.lockReleased, true);
  });

  it('should reject booking if stylist is on day off', async () => {
    const ports = createMockPorts({ stylistDayOff: true });
    const useCase = new BookAppointmentUseCase(
      ports.appointmentRepo,
      ports.stylistRepo,
      ports.serviceRepo,
      ports.clientRepo,
      ports.lockService
    );

    const bookingDate = new Date();
    bookingDate.setHours(14, 0, 0, 0);

    await assert.rejects(
      async () => {
        await useCase.execute({
          branchId: 'branch-uuid-1',
          stylistId: dummyStylist.id,
          clientId: dummyClient.id,
          serviceId: dummyService.id,
          startTime: bookingDate.toISOString(),
        });
      },
      StylistUnavailableException
    );
  });
});
