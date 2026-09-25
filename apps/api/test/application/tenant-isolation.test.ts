import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GetAppointmentsUseCase } from '../../src/application/use-cases/get-appointments.use-case';
import { BookAppointmentUseCase } from '../../src/application/use-cases/book-appointment.use-case';
import { UpdateAppointmentStatusUseCase } from '../../src/application/use-cases/update-appointment-status.use-case';
import { GetStylistsUseCase } from '../../src/application/use-cases/get-stylists.use-case';
import { GetServicesUseCase } from '../../src/application/use-cases/get-services.use-case';
import { SearchClientsUseCase } from '../../src/application/use-cases/search-clients.use-case';
import { CrossTenantAccessException } from '../../src/domain/exceptions/domain.exception';
import { ITenantContextPort, TenantContext } from '../../src/domain/ports/tenant-context.port';
import { Stylist } from '../../src/domain/models/stylist.entity';
import { Service } from '../../src/domain/models/service.entity';
import { Client } from '../../src/domain/models/client.entity';
import { Appointment } from '../../src/domain/models/appointment.entity';
import { TimeSlot } from '../../src/domain/value-objects/time-slot.vo';
import { Money } from '../../src/domain/value-objects/money.vo';
import { MoroccanPhoneNumber } from '../../src/domain/value-objects/phone-number.vo';

describe('Application Layer Tenant Isolation (Use Cases)', () => {
  const casaBranch = 'branch-casablanca-uuid';
  const rabatBranch = 'branch-rabat-uuid';

  function createMockTenantPort(context?: TenantContext): ITenantContextPort {
    let current = context;
    return {
      getTenant: () => current,
      runWithTenant: async (t, fn) => {
        current = t;
        return fn();
      },
    };
  }

  const dummyStylistCasa = new Stylist({
    id: 'stylist-casa-1',
    branchId: casaBranch,
    fullName: 'Fatima Casablanca',
    phone: '0661000001',
    role: 'STYLIST',
    commissionPct: 20,
    isActive: true,
    isDayOff: false,
    workingStart: '09:00',
    workingEnd: '19:00',
  });

  const dummyServiceCasa = new Service({
    id: 'service-casa-1',
    branchId: casaBranch,
    nameFr: 'Coupe Casablanca',
    nameAr: 'قص شعر',
    category: 'coiffure',
    durationMinutes: 45,
    bufferMinutes: 15,
    price: Money.fromMad(200),
    depositRequired: false,
  });

  const dummyClientCasa = new Client({
    id: 'client-casa-1',
    branchId: casaBranch,
    fullName: 'Sara Casablanca',
    phone: MoroccanPhoneNumber.create('0661111111'),
  });

  const dummyAppointmentRabat = new Appointment({
    id: 'apt-rabat-1',
    branchId: rabatBranch,
    stylistId: 'stylist-rabat-1',
    clientId: 'client-rabat-1',
    serviceId: 'service-rabat-1',
    timeSlot: TimeSlot.create(new Date(), 45, 15),
    price: Money.fromMad(250),
    status: 'BOOKED',
  });

  it('GetAppointmentsUseCase: should reject query targeting Rabat from Casablanca tenant context', async () => {
    const tenantPort = createMockTenantPort({ branchId: casaBranch, isSuperAdmin: false });
    const mockRepo: any = {
      findAll: async () => [],
    };

    const useCase = new GetAppointmentsUseCase(mockRepo, tenantPort);

    await assert.rejects(
      async () => {
        await useCase.execute({ branchId: rabatBranch });
      },
      CrossTenantAccessException
    );
  });

  it('GetAppointmentsUseCase: should automatically scope to Casablanca when filter branchId is omitted', async () => {
    const tenantPort = createMockTenantPort({ branchId: casaBranch, isSuperAdmin: false });
    let queriedFilter: any = null;

    const mockRepo: any = {
      findAll: async (filter: any) => {
        queriedFilter = filter;
        return [];
      },
    };

    const useCase = new GetAppointmentsUseCase(mockRepo, tenantPort);
    await useCase.execute();

    assert.ok(queriedFilter);
    assert.equal(queriedFilter.branchId, casaBranch);
  });

  it('BookAppointmentUseCase: should reject booking for Rabat branch from Casablanca tenant context', async () => {
    const tenantPort = createMockTenantPort({ branchId: casaBranch, isSuperAdmin: false });
    const mockLock: any = { acquireLock: async () => ({ release: async () => {} }) };
    const mockRepo: any = {
      findById: async () => null,
      findOverlapping: async () => [],
      save: async (a: any) => a,
    };

    const useCase = new BookAppointmentUseCase(
      mockRepo,
      mockRepo,
      mockRepo,
      mockRepo,
      mockLock,
      tenantPort
    );

    await assert.rejects(
      async () => {
        await useCase.execute({
          branchId: rabatBranch,
          stylistId: dummyStylistCasa.id,
          serviceId: dummyServiceCasa.id,
          clientId: dummyClientCasa.id,
          startTime: new Date().toISOString(),
        });
      },
      CrossTenantAccessException
    );
  });

  it('UpdateAppointmentStatusUseCase: should reject modifying a Rabat appointment from Casablanca tenant context', async () => {
    const tenantPort = createMockTenantPort({ branchId: casaBranch, isSuperAdmin: false });
    const mockAptRepo: any = {
      findById: async (id: string) => (id === dummyAppointmentRabat.id ? dummyAppointmentRabat : null),
      save: async (a: any) => a,
    };

    const useCase = new UpdateAppointmentStatusUseCase(mockAptRepo, undefined, tenantPort);

    await assert.rejects(
      async () => {
        await useCase.execute({
          appointmentId: dummyAppointmentRabat.id,
          status: 'CONFIRMED',
        });
      },
      CrossTenantAccessException
    );
  });

  it('GetStylistsUseCase & GetServicesUseCase: should reject cross-branch requests', async () => {
    const tenantPort = createMockTenantPort({ branchId: casaBranch, isSuperAdmin: false });
    const mockStylistRepo: any = { findAllActive: async () => [] };
    const mockServiceRepo: any = { findAll: async () => [] };

    const stylistsUseCase = new GetStylistsUseCase(mockStylistRepo, tenantPort);
    const servicesUseCase = new GetServicesUseCase(mockServiceRepo, tenantPort);

    await assert.rejects(async () => stylistsUseCase.execute(rabatBranch), CrossTenantAccessException);
    await assert.rejects(async () => servicesUseCase.execute(rabatBranch), CrossTenantAccessException);
  });

  it('SearchClientsUseCase: should reject cross-branch client searches', async () => {
    const tenantPort = createMockTenantPort({ branchId: casaBranch, isSuperAdmin: false });
    const mockClientRepo: any = { search: async () => [] };

    const useCase = new SearchClientsUseCase(mockClientRepo, tenantPort);

    await assert.rejects(
      async () => useCase.execute('Fatima', rabatBranch),
      CrossTenantAccessException
    );
  });
});
