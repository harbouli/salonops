import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Appointment } from '../../src/domain/models/appointment.entity';
import { TimeSlot } from '../../src/domain/value-objects/time-slot.vo';
import { Money } from '../../src/domain/value-objects/money.vo';
import { InvalidAppointmentStateException } from '../../src/domain/exceptions/domain.exception';

describe('Appointment Aggregate Root', () => {
  function makeAppointment(status: any = 'BOOKED') {
    return new Appointment({
      id: 'apt-1',
      branchId: 'branch-1',
      stylistId: 'stylist-1',
      clientId: 'client-1',
      serviceId: 'svc-1',
      timeSlot: TimeSlot.create(new Date('2026-09-18T10:00:00.000Z'), 60, 15),
      price: Money.fromMad(250),
      status,
    });
  }

  it('should advance status through normal lifecycle: BOOKED -> CONFIRMED -> IN_CHAIR -> COMPLETED', () => {
    const apt = makeAppointment('BOOKED');
    assert.equal(apt.status, 'BOOKED');

    apt.confirm();
    assert.equal(apt.status, 'CONFIRMED');

    apt.startInChair();
    assert.equal(apt.status, 'IN_CHAIR');

    apt.complete();
    assert.equal(apt.status, 'COMPLETED');
    assert.equal(apt.isActive(), true);
  });

  it('should prevent illegal transitions on cancelled appointments', () => {
    const apt = makeAppointment('BOOKED');
    apt.cancel('Client unwell');

    assert.equal(apt.status, 'CANCELLED');
    assert.equal(apt.isActive(), false);
    assert.ok(apt.notes?.includes('Client unwell'));

    assert.throws(() => apt.confirm(), InvalidAppointmentStateException);
    assert.throws(() => apt.startInChair(), InvalidAppointmentStateException);
    assert.throws(() => apt.complete(), InvalidAppointmentStateException);
  });

  it('should prevent cancelling or marking absent an already completed appointment', () => {
    const apt = makeAppointment('COMPLETED');

    assert.throws(() => apt.cancel(), InvalidAppointmentStateException);
    assert.throws(() => apt.markNoShow(), InvalidAppointmentStateException);
  });
});
