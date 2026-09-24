import test from 'node:test';
import assert from 'node:assert/strict';

import { Appointment } from '../src/domain/models/appointment.entity';
import { Client } from '../src/domain/models/client.entity';
import { TimeSlot } from '../src/domain/value-objects/time-slot.vo';
import { Money } from '../src/domain/value-objects/money.vo';
import { MoroccanPhoneNumber } from '../src/domain/value-objects/phone-number.vo';
import { ReliabilityScore } from '../src/domain/value-objects/reliability-score.vo';
import { AppointmentCollisionService } from '../src/domain/services/appointment-collision.service';
import {
  InvalidAppointmentStateException,
  SlotCollisionException,
} from '../src/domain/exceptions/domain.exception';
import { UpdateAppointmentStatusUseCase } from '../src/application/use-cases/update-appointment-status.use-case';
import { IAppointmentRepository } from '../src/domain/ports/appointment-repository.port';
import { IClientRepository } from '../src/domain/ports/client-repository.port';

function createDummyAppointment(status: any = 'BOOKED', startTime?: Date): Appointment {
  const start = startTime ?? new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours in future
  const timeSlot = TimeSlot.create(start, 45, 15);
  return new Appointment({
    id: '11111111-1111-4111-a111-111111111111',
    branchId: '22222222-2222-4222-a222-222222222222',
    stylistId: '33333333-3333-4333-a333-333333333333',
    clientId: '44444444-4444-4444-a444-444444444444',
    serviceId: '55555555-5555-4555-a555-555555555555',
    timeSlot,
    price: Money.fromMad('150.00'),
    status,
    notes: null,
  });
}

function createDummyClient(): Client {
  return new Client({
    id: '44444444-4444-4444-a444-444444444444',
    branchId: '22222222-2222-4222-a222-222222222222',
    fullName: 'Meryem Bennani',
    phone: MoroccanPhoneNumber.create('0661234567'),
    loyaltyPoints: 100,
  });
}

test('ReliabilityScore Value Object penalties, tiers, and rewards', () => {
  const score = ReliabilityScore.create(100);
  assert.equal(score.value, 100);
  assert.equal(score.tier, 'EXCELLENT');
  assert.equal(score.isDepositRecommended(), false);

  // Apply No-show penalty (-20)
  const afterNoShow = score.applyNoShowPenalty();
  assert.equal(afterNoShow.value, 80);
  assert.equal(afterNoShow.tier, 'EXCELLENT');

  // Apply second No-show penalty (-20)
  const afterSecondNoShow = afterNoShow.applyNoShowPenalty();
  assert.equal(afterSecondNoShow.value, 60);
  assert.equal(afterSecondNoShow.tier, 'FAIR');

  // Apply late cancellation penalty (-10)
  const afterLateCancel = afterSecondNoShow.applyLateCancellationPenalty();
  assert.equal(afterLateCancel.value, 50);
  assert.equal(afterLateCancel.tier, 'FAIR');

  // Another late cancellation drops to AT_RISK
  const atRisk = afterLateCancel.applyLateCancellationPenalty();
  assert.equal(atRisk.value, 40);
  assert.equal(atRisk.tier, 'AT_RISK');
  assert.equal(atRisk.isDepositRecommended(), true);

  // Visit reward (+5)
  const recovered = atRisk.applyCompletedVisitReward();
  assert.equal(recovered.value, 45);
});

test('Appointment State Machine: Transitions and Constraints', () => {
  const appt = createDummyAppointment('BOOKED');

  appt.confirm();
  assert.equal(appt.status, 'CONFIRMED');

  appt.startInChair();
  assert.equal(appt.status, 'IN_CHAIR');

  appt.complete();
  assert.equal(appt.status, 'COMPLETED');

  // Cannot cancel completed appointment
  assert.throws(
    () => appt.cancel(),
    (err: any) => err instanceof InvalidAppointmentStateException
  );

  // Cannot mark no-show on completed appointment
  assert.throws(
    () => appt.markNoShow(),
    (err: any) => err instanceof InvalidAppointmentStateException
  );
});

test('Notice Window: Standard Cancellation vs Late Cancellation (< 2h notice)', () => {
  const now = new Date();
  const startTime = new Date(now.getTime() + 4 * 60 * 60 * 1000); // in 4 hours
  const appt = createDummyAppointment('CONFIRMED', startTime);

  // Cancel 4 hours before (normal notice)
  const resultOnTime = appt.cancel({
    cancellationTime: now,
    minNoticeHours: 2,
    reason: 'Changement d’emploi du temps',
  });
  assert.equal(resultOnTime.isLate, false);
  assert.equal(appt.status, 'CANCELLED');
  assert.match(appt.notes ?? '', /Annulation: Changement d’emploi du temps/);

  // Late cancellation test (< 2 hours before)
  const lateStartTime = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour in future
  const lateAppt = createDummyAppointment('CONFIRMED', lateStartTime);
  const resultLate = lateAppt.cancel({
    cancellationTime: now,
    minNoticeHours: 2,
    reason: 'Empêchement de dernière minute',
  });
  assert.equal(resultLate.isLate, true);
  assert.equal(lateAppt.status, 'CANCELLED');
  assert.match(lateAppt.notes ?? '', /Annulation tardive/);
});

test('Grace Period: Cannot mark No-Show prematurely', () => {
  const now = new Date();
  const startTime = new Date(now.getTime()); // appointment starts right now
  const appt = createDummyAppointment('CONFIRMED', startTime);

  // Attempt to mark absent immediately (within 15 min grace period)
  assert.throws(
    () =>
      appt.markNoShow({
        recordedAt: new Date(now.getTime() + 5 * 60 * 1000), // only 5 mins elapsed
        gracePeriodMinutes: 15,
      }),
    (err: any) => err instanceof InvalidAppointmentStateException
  );

  // Mark absent after grace period (20 minutes past start time)
  appt.markNoShow({
    recordedAt: new Date(now.getTime() + 20 * 60 * 1000),
    gracePeriodMinutes: 15,
  });
  assert.equal(appt.status, 'NO_SHOW');
});

test('Immediate Slot Release: Cancelled & No-Show appointments do not block new bookings', () => {
  const now = new Date();
  const slot = TimeSlot.create(now, 45, 15);

  const activeAppt = createDummyAppointment('BOOKED', now);
  assert.throws(
    () => AppointmentCollisionService.checkCollision(slot, [activeAppt]),
    (err: any) => err instanceof SlotCollisionException
  );

  // Cancel active appointment -> immediate release
  activeAppt.cancel({ cancellationTime: new Date(now.getTime() - 5 * 3600 * 1000) });
  assert.equal(activeAppt.isActive(), false);
  assert.doesNotThrow(() => AppointmentCollisionService.checkCollision(slot, [activeAppt]));

  // No-show appointment -> immediate release
  const noShowAppt = createDummyAppointment('NO_SHOW', now);
  assert.equal(noShowAppt.isActive(), false);
  assert.doesNotThrow(() => AppointmentCollisionService.checkCollision(slot, [noShowAppt]));
});

test('UpdateAppointmentStatusUseCase: Full status lifecycle, score updates, and persistence', async () => {
  let savedAppt: Appointment | null = null;
  let savedClient: Client | null = null;

  const mockAppt = createDummyAppointment('CONFIRMED', new Date(Date.now() + 60 * 60 * 1000)); // 1 hour away
  const mockClient = createDummyClient();

  const appointmentRepo: IAppointmentRepository = {
    findById: async () => mockAppt,
    findOverlapping: async () => [],
    findByStylistAndDateRange: async () => [],
    findAll: async () => [mockAppt],
    save: async (a) => {
      savedAppt = a;
      return a;
    },
  };

  const clientRepo: IClientRepository = {
    findById: async () => mockClient,
    findByPhone: async () => mockClient,
    search: async () => [mockClient],
    save: async (c) => {
      savedClient = c;
      return c;
    },
  };

  const useCase = new UpdateAppointmentStatusUseCase(appointmentRepo, clientRepo);

  // Execute late cancellation
  const cancelResult = await useCase.cancel({
    appointmentId: mockAppt.id,
    reason: 'Panne de voiture',
    cancellationTime: new Date(),
    minNoticeHours: 2,
  });

  assert.equal(cancelResult.status, 'CANCELLED');
  assert.equal(cancelResult.isLateCancellation, true);
  assert.equal(cancelResult.clientReliabilityScore, 90); // 100 - 10 (late cancellation penalty)
  assert.equal(savedClient?.lateCancellationCount, 1);
  assert.equal(savedAppt?.status, 'CANCELLED');

  // Test No-Show on another appointment
  const pastAppt = createDummyAppointment('CONFIRMED', new Date(Date.now() - 30 * 60 * 1000)); // 30 mins ago
  appointmentRepo.findById = async () => pastAppt;

  const noShowResult = await useCase.markNoShow({
    appointmentId: pastAppt.id,
    recordedAt: new Date(),
    gracePeriodMinutes: 15,
  });

  assert.equal(noShowResult.status, 'NO_SHOW');
  assert.equal(noShowResult.clientReliabilityScore, 70); // 90 - 20 (no-show penalty)
  assert.equal(savedClient?.noShowCount, 1);
});
