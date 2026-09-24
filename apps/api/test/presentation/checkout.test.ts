import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { createApp } from '../../src/app';
import { AppContainer, createContainer } from '../../src/infrastructure/container';
import { Stylist } from '../../src/domain/models/stylist.entity';
import { Client } from '../../src/domain/models/client.entity';
import { Appointment } from '../../src/domain/models/appointment.entity';
import { TimeSlot } from '../../src/domain/value-objects/time-slot.vo';
import { Money } from '../../src/domain/value-objects/money.vo';

describe('Checkout & Caisse Reconciliation API (Presentation Layer)', () => {
  let server: Server;
  let baseUrl: string;
  let container: AppContainer;

  const branchId = '11111111-1111-4111-8111-111111111111';
  const stylistId = '22222222-2222-4222-8222-222222222222';
  const clientId = '33333333-3333-4333-8333-333333333333';
  const appointmentId = '44444444-4444-4444-8444-444444444444';

  before(async () => {
    container = createContainer();

    // Mock in-memory repository saves for clean HTTP integration test without database requirement
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
    // Override stylistRepo.findById
    container.stylistRepo.findById = async (id: string) => (id === stylistId ? stylist : null);

    const client = new Client({
      id: clientId,
      branchId,
      fullName: 'Meryem Bennani',
      phone: '+212663456789',
      loyaltyPoints: 10,
    });
    container.clientRepo.findById = async (id: string) => (id === clientId ? client : null);
    container.clientRepo.save = async (c: Client) => c;

    const appointment = new Appointment({
      id: appointmentId,
      branchId,
      stylistId,
      clientId,
      serviceId: '55555555-5555-4555-8555-555555555555',
      timeSlot: TimeSlot.create(new Date(), 60, 15),
      price: Money.fromMad(400),
      status: 'IN_CHAIR',
    });
    container.appointmentRepo.findById = async (id: string) => (id === appointmentId ? appointment : null);
    container.appointmentRepo.save = async (a: Appointment) => a;

    // In-memory transactions store
    const transactionsList: any[] = [];
    container.transactionRepo.save = async (tx: any) => {
      transactionsList.push(tx);
      return tx;
    };
    container.transactionRepo.findById = async (id: string) =>
      transactionsList.find((t) => t.id === id) ?? null;
    container.transactionRepo.findByAppointmentId = async (apptId: string) =>
      transactionsList.find((t) => t.appointmentId === apptId) ?? null;
    container.transactionRepo.findByBranchAndDateRange = async (bId: string) =>
      transactionsList.filter((t) => t.branchId === bId);

    const app = createApp(container);
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });

  it('POST /api/v1/checkout - should successfully record SPLIT checkout (201 Created)', async () => {
    const payload = {
      branchId,
      stylistId,
      clientId,
      serviceTotalMad: 500,
      retailTotalMad: 100,
      tipAmountMad: 50,
      paymentMethod: 'SPLIT',
      cashAmountMad: 300,
      cardAmountMad: 350, // 300 + 350 = 650 MAD
    };

    const res = await fetch(`${baseUrl}/api/v1/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-branch-id': branchId,
      },
      body: JSON.stringify(payload),
    });

    assert.equal(res.status, 201);
    const body = (await res.json()) as any;
    assert.ok(body.id);
    assert.equal(body.serviceTotalMad, '500.00');
    assert.equal(body.retailTotalMad, '100.00');
    assert.equal(body.grandTotalMad, '600.00');
    assert.equal(body.tipAmountMad, '50.00');
    assert.equal(body.totalPaidMad, '650.00');
    assert.equal(body.paymentMethod, 'SPLIT');
    assert.equal(body.stylistCommissionMad, '75.00'); // 15% on 500
  });

  it('POST /api/v1/checkout - should reject underpaid split checkout (400 Bad Request)', async () => {
    const payload = {
      branchId,
      stylistId,
      serviceTotalMad: 500,
      retailTotalMad: 100, // Total: 600 MAD
      paymentMethod: 'SPLIT',
      cashAmountMad: 100,
      cardAmountMad: 200, // 300 < 600
    };

    const res = await fetch(`${baseUrl}/api/v1/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-branch-id': branchId,
      },
      body: JSON.stringify(payload),
    });

    assert.equal(res.status, 400);
    const body = (await res.json()) as any;
    assert.ok(body.error || body.message);
  });

  it('POST /api/v1/checkout - should reject invalid request payload (400 Bad Request)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-branch-id': branchId,
      },
      body: JSON.stringify({
        branchId: 'invalid-uuid',
      }),
    });

    assert.equal(res.status, 400);
  });

  it('GET /api/v1/checkout/reconciliation - should return daily caisse reconciliation (200 OK)', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(
      `${baseUrl}/api/v1/checkout/reconciliation?branchId=${branchId}&date=${today}&openingCashMad=500&actualCashMad=800`,
      {
        headers: {
          'x-branch-id': branchId,
        },
      }
    );

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.branchId, branchId);
    assert.equal(body.date, today);
    assert.ok(body.openingCashMad);
    assert.ok(body.totalCashMad);
    assert.ok(body.totalCardMad);
    assert.ok(body.expectedDrawerCashMad);
    assert.ok(Array.isArray(body.stylistBreakdowns));
  });

  it('GET /api/v1/checkout/:id - should return transaction details or 404 for non-existent', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await fetch(`${baseUrl}/api/v1/checkout/${fakeId}`, {
      headers: {
        'x-branch-id': branchId,
      },
    });

    assert.equal(res.status, 404);
  });
});
