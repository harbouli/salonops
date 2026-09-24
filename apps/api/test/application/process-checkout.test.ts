import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ProcessCheckoutUseCase } from '../../src/application/use-cases/process-checkout.use-case';
import { GetCaisseReconciliationUseCase } from '../../src/application/use-cases/get-caisse-reconciliation.use-case';
import { ITransactionRepository } from '../../src/domain/ports/transaction-repository.port';
import { IAppointmentRepository, FindAppointmentsFilter } from '../../src/domain/ports/appointment-repository.port';
import { IStylistRepository } from '../../src/domain/ports/stylist-repository.port';
import { IClientRepository } from '../../src/domain/ports/client-repository.port';
import { ITenantContextPort, TenantContext } from '../../src/domain/ports/tenant-context.port';
import { Transaction } from '../../src/domain/models/transaction.entity';
import { Appointment } from '../../src/domain/models/appointment.entity';
import { Stylist } from '../../src/domain/models/stylist.entity';
import { Client } from '../../src/domain/models/client.entity';
import { TimeSlot } from '../../src/domain/value-objects/time-slot.vo';
import { Money } from '../../src/domain/value-objects/money.vo';
import {
  EntityNotFoundException,
  CrossTenantAccessException,
  InvalidAppointmentStateException,
  InvalidValueException,
} from '../../src/domain/exceptions/domain.exception';

// Mock Repositories
class MockTransactionRepository implements ITransactionRepository {
  public transactions: Transaction[] = [];

  async findById(id: string): Promise<Transaction | null> {
    return this.transactions.find((t) => t.id === id) ?? null;
  }

  async save(transaction: Transaction): Promise<Transaction> {
    this.transactions.push(transaction);
    return transaction;
  }

  async findByBranchAndDateRange(
    branchId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    return this.transactions.filter(
      (t) =>
        t.branchId === branchId &&
        t.createdAt >= startDate &&
        t.createdAt <= endDate
    );
  }

  async findByAppointmentId(appointmentId: string): Promise<Transaction | null> {
    return this.transactions.find((t) => t.appointmentId === appointmentId) ?? null;
  }
}

class MockAppointmentRepository implements IAppointmentRepository {
  public appointments: Map<string, Appointment> = new Map();

  async findById(id: string): Promise<Appointment | null> {
    return this.appointments.get(id) ?? null;
  }

  async findOverlapping(): Promise<Appointment[]> {
    return [];
  }

  async findByFilter(filter: FindAppointmentsFilter): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (a) => !filter.branchId || a.branchId === filter.branchId
    );
  }

  async save(appointment: Appointment): Promise<Appointment> {
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }
}

class MockStylistRepository implements IStylistRepository {
  public stylists: Map<string, Stylist> = new Map();

  async findById(id: string): Promise<Stylist | null> {
    return this.stylists.get(id) ?? null;
  }

  async findByBranch(branchId: string): Promise<Stylist[]> {
    return Array.from(this.stylists.values()).filter((s) => s.branchId === branchId);
  }

  async save(stylist: Stylist): Promise<Stylist> {
    this.stylists.set(stylist.id, stylist);
    return stylist;
  }
}

class MockClientRepository implements IClientRepository {
  public clients: Map<string, Client> = new Map();

  async findById(id: string): Promise<Client | null> {
    return this.clients.get(id) ?? null;
  }

  async search(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async save(client: Client): Promise<Client> {
    this.clients.set(client.id, client);
    return client;
  }
}

class MockTenantContextPort implements ITenantContextPort {
  constructor(private context?: TenantContext) {}

  getTenant(): TenantContext | undefined {
    return this.context;
  }

  runWithTenant<T>(_context: TenantContext, fn: () => T): T {
    return fn();
  }
}

describe('ProcessCheckoutUseCase (Application Layer Inbound Port)', () => {
  const branchId = '11111111-1111-4111-8111-111111111111';
  const stylistId = '22222222-2222-4222-8222-222222222222';
  const clientId = '33333333-3333-4333-8333-333333333333';
  const appointmentId = '44444444-4444-4444-8444-444444444444';

  function setup() {
    const txRepo = new MockTransactionRepository();
    const apptRepo = new MockAppointmentRepository();
    const stylistRepo = new MockStylistRepository();
    const clientRepo = new MockClientRepository();

    // Populate stylist (15% commission)
    const stylist = new Stylist({
      id: stylistId,
      branchId,
      fullName: 'Fatima Zohra',
      phone: '+212661234567',
      role: 'Coloriste Expert',
      commissionPct: 15,
      isActive: true,
      workingHours: { start: '09:00', end: '19:00' },
      daysOff: [0],
    });
    stylistRepo.save(stylist);

    // Populate client (starting with 10 loyalty points)
    const client = new Client({
      id: clientId,
      branchId,
      fullName: 'Meryem Bennani',
      phone: '+212663456789',
      loyaltyPoints: 10,
    });
    clientRepo.save(client);

    // Populate appointment
    const startTime = new Date(Date.now() + 3600000);
    const appointment = new Appointment({
      id: appointmentId,
      branchId,
      stylistId,
      clientId,
      serviceId: '55555555-5555-4555-8555-555555555555',
      timeSlot: TimeSlot.create(startTime, 60, 15),
      price: Money.fromMad(400),
      status: 'IN_CHAIR',
    });
    apptRepo.save(appointment);

    return { txRepo, apptRepo, stylistRepo, clientRepo };
  }

  it('should successfully process CASH checkout, complete appointment, and award loyalty points', async () => {
    const { txRepo, apptRepo, stylistRepo, clientRepo } = setup();
    const useCase = new ProcessCheckoutUseCase(txRepo, apptRepo, stylistRepo, clientRepo);

    const result = await useCase.execute({
      branchId,
      stylistId,
      appointmentId,
      clientId,
      serviceTotalMad: 400,
      retailTotalMad: 100, // Grand total: 500 MAD
      tipAmountMad: 50,
      paymentMethod: 'CASH',
    });

    // 1. Transaction verification
    assert.equal(result.serviceTotalMad, '400.00');
    assert.equal(result.retailTotalMad, '100.00');
    assert.equal(result.grandTotalMad, '500.00');
    assert.equal(result.tipAmountMad, '50.00');
    assert.equal(result.totalPaidMad, '550.00'); // 500 + 50 tip
    assert.equal(result.paymentMethod, 'CASH');
    // Stylist commission is strictly 15% on 400 MAD service total = 60.00 MAD (NOT on 500 MAD)
    assert.equal(result.stylistCommissionMad, '60.00');
    assert.equal(result.netSalonRevenueMad, '440.00'); // 500 - 60

    // 2. Appointment auto-completion verification
    const updatedAppt = await apptRepo.findById(appointmentId);
    assert.equal(updatedAppt?.status, 'COMPLETED');

    // 3. Client loyalty points: 10 existing + Math.floor(500 / 10) = 60 points
    const updatedClient = await clientRepo.findById(clientId);
    assert.equal(updatedClient?.loyaltyPoints, 60);
  });

  it('should successfully process TPE_CARD checkout', async () => {
    const { txRepo, apptRepo, stylistRepo, clientRepo } = setup();
    const useCase = new ProcessCheckoutUseCase(txRepo, apptRepo, stylistRepo, clientRepo);

    const result = await useCase.execute({
      branchId,
      stylistId,
      serviceTotalMad: 300,
      paymentMethod: 'TPE_CARD',
    });

    assert.equal(result.serviceTotalMad, '300.00');
    assert.equal(result.cardAmountMad, '300.00');
    assert.equal(result.cashAmountMad, '0.00');
    assert.equal(result.stylistCommissionMad, '45.00'); // 15% on 300
    assert.equal(result.paymentMethod, 'TPE_CARD');
  });

  it('should successfully process SPLIT checkout (Cash + TPE Card)', async () => {
    const { txRepo, apptRepo, stylistRepo, clientRepo } = setup();
    const useCase = new ProcessCheckoutUseCase(txRepo, apptRepo, stylistRepo, clientRepo);

    const result = await useCase.execute({
      branchId,
      stylistId,
      serviceTotalMad: 500,
      retailTotalMad: 100, // Total: 600 MAD
      paymentMethod: 'SPLIT',
      cashAmountMad: 250,
      cardAmountMad: 350,
    });

    assert.equal(result.serviceTotalMad, '500.00');
    assert.equal(result.retailTotalMad, '100.00');
    assert.equal(result.grandTotalMad, '600.00');
    assert.equal(result.cashAmountMad, '250.00');
    assert.equal(result.cardAmountMad, '350.00');
    assert.equal(result.totalPaidMad, '600.00');
    assert.equal(result.stylistCommissionMad, '75.00'); // 15% on 500
  });

  it('should reject checkout if stylist does not exist', async () => {
    const { txRepo, apptRepo, stylistRepo, clientRepo } = setup();
    const useCase = new ProcessCheckoutUseCase(txRepo, apptRepo, stylistRepo, clientRepo);

    await assert.rejects(
      () =>
        useCase.execute({
          branchId,
          stylistId: '00000000-0000-0000-0000-000000000000',
          serviceTotalMad: 300,
          paymentMethod: 'CASH',
        }),
      EntityNotFoundException
    );
  });

  it('should reject checkout if appointment does not exist', async () => {
    const { txRepo, apptRepo, stylistRepo, clientRepo } = setup();
    const useCase = new ProcessCheckoutUseCase(txRepo, apptRepo, stylistRepo, clientRepo);

    await assert.rejects(
      () =>
        useCase.execute({
          branchId,
          stylistId,
          appointmentId: '00000000-0000-0000-0000-000000000000',
          serviceTotalMad: 300,
          paymentMethod: 'CASH',
        }),
      EntityNotFoundException
    );
  });

  it('should reject duplicate checkout for already processed appointment', async () => {
    const { txRepo, apptRepo, stylistRepo, clientRepo } = setup();
    const useCase = new ProcessCheckoutUseCase(txRepo, apptRepo, stylistRepo, clientRepo);

    // First checkout succeeds
    await useCase.execute({
      branchId,
      stylistId,
      appointmentId,
      serviceTotalMad: 400,
      paymentMethod: 'CASH',
    });

    // Second checkout for the same appointment must fail
    await assert.rejects(
      () =>
        useCase.execute({
          branchId,
          stylistId,
          appointmentId,
          serviceTotalMad: 400,
          paymentMethod: 'CASH',
        }),
      InvalidAppointmentStateException
    );
  });

  it('should reject checkout with insufficient split payment', async () => {
    const { txRepo, apptRepo, stylistRepo, clientRepo } = setup();
    const useCase = new ProcessCheckoutUseCase(txRepo, apptRepo, stylistRepo, clientRepo);

    await assert.rejects(
      () =>
        useCase.execute({
          branchId,
          stylistId,
          serviceTotalMad: 500,
          paymentMethod: 'SPLIT',
          cashAmountMad: 100,
          cardAmountMad: 200, // 300 < 500
        }),
      InvalidValueException
    );
  });

  it('should enforce multi-branch tenant isolation', async () => {
    const { txRepo, apptRepo, stylistRepo, clientRepo } = setup();
    const casablancaBranch = branchId;
    const rabatBranch = '99999999-9999-4999-8999-999999999999';

    const tenantPort = new MockTenantContextPort({
      userId: 'user-1',
      branchId: casablancaBranch,
      role: 'MANAGER',
      isSuperAdmin: false,
    });

    const useCase = new ProcessCheckoutUseCase(
      txRepo,
      apptRepo,
      stylistRepo,
      clientRepo,
      tenantPort
    );

    // Attempting to checkout a transaction for Rabat while tenant is Casablanca
    await assert.rejects(
      () =>
        useCase.execute({
          branchId: rabatBranch,
          stylistId,
          serviceTotalMad: 300,
          paymentMethod: 'CASH',
        }),
      CrossTenantAccessException
    );
  });
});

describe('GetCaisseReconciliationUseCase (Application Layer Inbound Port)', () => {
  const branchId = '11111111-1111-4111-8111-111111111111';
  const stylist1 = '22222222-2222-4222-8222-222222222222';
  const stylist2 = '33333333-3333-4333-8333-333333333333';

  it('should reconcile daily transactions with opening float and physical cash drawer count', async () => {
    const txRepo = new MockTransactionRepository();
    const todayStr = '2026-09-24';

    // Transaction 1: Cash (300 service + 50 retail + 20 tip = 370 cash)
    txRepo.transactions.push(
      new Transaction({
        id: 'tx-1',
        branchId,
        stylistId: stylist1,
        serviceTotal: Money.fromMad(300),
        retailTotal: Money.fromMad(50),
        tipAmount: Money.fromMad(20),
        paymentMethod: 'CASH',
        cashAmount: Money.fromMad(370),
        cardAmount: Money.zero(),
        stylistCommission: Money.fromMad(45),
        createdAt: new Date(`${todayStr}T10:00:00.000Z`),
      })
    );

    // Transaction 2: TPE Card (500 service = 500 card)
    txRepo.transactions.push(
      new Transaction({
        id: 'tx-2',
        branchId,
        stylistId: stylist2,
        serviceTotal: Money.fromMad(500),
        retailTotal: Money.zero(),
        tipAmount: Money.zero(),
        paymentMethod: 'TPE_CARD',
        cashAmount: Money.zero(),
        cardAmount: Money.fromMad(500),
        stylistCommission: Money.fromMad(100),
        createdAt: new Date(`${todayStr}T12:00:00.000Z`),
      })
    );

    const useCase = new GetCaisseReconciliationUseCase(txRepo);

    // Opening float: 500 MAD
    // Cash collected: 370 MAD
    // Expected drawer cash: 500 + 370 = 870 MAD
    // Actual drawer counted: 870 MAD
    const result = await useCase.execute({
      branchId,
      date: todayStr,
      openingCashMad: 500,
      actualCashMad: 870,
    });

    assert.equal(result.branchId, branchId);
    assert.equal(result.date, todayStr);
    assert.equal(result.openingCashMad, '500.00');
    assert.equal(result.totalCashMad, '370.00');
    assert.equal(result.totalCardMad, '500.00');
    assert.equal(result.totalPaidMad, '870.00');
    assert.equal(result.totalServiceRevenueMad, '800.00');
    assert.equal(result.totalRetailRevenueMad, '50.00');
    assert.equal(result.totalGrossRevenueMad, '850.00');
    assert.equal(result.totalTipsMad, '20.00');
    assert.equal(result.totalCommissionsMad, '145.00'); // 45 + 100
    assert.equal(result.netSalonRevenueMad, '705.00'); // 850 - 145
    assert.equal(result.transactionCount, 2);
    assert.equal(result.expectedDrawerCashMad, '870.00');
    assert.equal(result.actualCashMad, '870.00');
    assert.equal(result.varianceMad, '0.00');
    assert.equal(result.isBalanced, true);

    // Stylist breakdowns
    assert.equal(result.stylistBreakdowns.length, 2);
    const s1 = result.stylistBreakdowns.find((s) => s.stylistId === stylist1);
    assert.equal(s1?.serviceRevenueMad, '300.00');
    assert.equal(s1?.commissionMad, '45.00');
    assert.equal(s1?.tipsMad, '20.00');
  });

  it('should detect cash discrepancy when actual cash does not match drawer balance', async () => {
    const txRepo = new MockTransactionRepository();
    const todayStr = '2026-09-24';

    txRepo.transactions.push(
      new Transaction({
        id: 'tx-1',
        branchId,
        stylistId: stylist1,
        serviceTotal: Money.fromMad(200),
        paymentMethod: 'CASH',
        cashAmount: Money.fromMad(200),
        cardAmount: Money.zero(),
        stylistCommission: Money.fromMad(30),
        createdAt: new Date(`${todayStr}T11:00:00.000Z`),
      })
    );

    const useCase = new GetCaisseReconciliationUseCase(txRepo);

    // Expected drawer cash: 200 MAD
    // Actual counted: 170 MAD (30 MAD deficit)
    const result = await useCase.execute({
      branchId,
      date: todayStr,
      openingCashMad: 0,
      actualCashMad: 170,
    });

    assert.equal(result.expectedDrawerCashMad, '200.00');
    assert.equal(result.actualCashMad, '170.00');
    assert.equal(result.varianceMad, '-30.00');
    assert.equal(result.isBalanced, false);
  });
});
