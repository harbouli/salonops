import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { Stylist } from '../../src/domain/models/stylist.entity';
import { TimeSlot } from '../../src/domain/value-objects/time-slot.vo';

describe('Stylist Domain Entity (Shift Schedule & Day-Off Rules)', () => {
  const defaultStylistProps = {
    id: 'stylist-uuid-1',
    branchId: 'branch-uuid-1',
    fullName: 'Fatima Zahra',
    phone: '+212661234567',
    role: 'STYLIST',
    avatarUrl: 'https://minio.salonops.ma/photos/fatima.jpg',
    commissionPct: 15.0,
    isActive: true,
    isDayOff: false,
    workingStart: '09:00',
    workingEnd: '19:30',
  };

  it('should allow appointments when active and not on day off', () => {
    const stylist = new Stylist(defaultStylistProps);

    assert.equal(stylist.canTakeAppointments(), true);
    assert.equal(stylist.isDayOff, false);
    assert.equal(stylist.workingStart, '09:00');
    assert.equal(stylist.workingEnd, '19:30');
  });

  it('should prevent appointments when stylist is on day off', () => {
    const stylist = new Stylist({ ...defaultStylistProps, isDayOff: true });

    assert.equal(stylist.canTakeAppointments(), false);

    // Slot during normal shift hours (10:00 - 11:00)
    const timeSlot = TimeSlot.create('2026-09-24T10:00:00.000Z', 60, 0);
    assert.equal(stylist.isAvailableFor(timeSlot), false);
  });

  it('should prevent appointments when stylist account is inactive', () => {
    const stylist = new Stylist({ ...defaultStylistProps, isActive: false });

    assert.equal(stylist.canTakeAppointments(), false);

    const timeSlot = TimeSlot.create('2026-09-24T10:00:00.000Z', 60, 0);
    assert.equal(stylist.isAvailableFor(timeSlot), false);
  });

  it('should validate time slot within working hours boundary', () => {
    const stylist = new Stylist(defaultStylistProps); // 09:00 to 19:30

    // Valid slot: 10:00 to 11:30 (with 15m buffer = 11:45)
    const dValid = new Date();
    dValid.setHours(10, 0, 0, 0);
    const validSlot = TimeSlot.create(dValid, 90, 15);
    assert.equal(stylist.isAvailableFor(validSlot), true);

    // Invalid slot: starts before shift (08:30)
    const dEarly = new Date();
    dEarly.setHours(8, 30, 0, 0);
    const earlySlot = TimeSlot.create(dEarly, 60, 0);
    assert.equal(stylist.isAvailableFor(earlySlot), false);

    // Invalid slot: buffer end exceeds shift end (19:00 + 45m duration + 0m buffer = 19:45 > 19:30)
    const dLate = new Date();
    dLate.setHours(19, 0, 0, 0);
    const lateSlot = TimeSlot.create(dLate, 45, 0);
    assert.equal(stylist.isAvailableFor(lateSlot), false);
  });

  it('should calculate ISO shift schedule window for calendar views', () => {
    const stylist = new Stylist(defaultStylistProps);
    const refDate = new Date('2026-09-24T12:00:00.000Z');

    const schedule = stylist.getShiftScheduleWindow(refDate);

    assert.equal(schedule.workingStart, '09:00');
    assert.equal(schedule.workingEnd, '19:30');
    assert.equal(schedule.isDayOff, false);
    assert.equal(schedule.canTakeAppointments, true);
    assert.ok(schedule.startISO?.includes('2026-09-24T09:00:00.000Z'));
    assert.ok(schedule.endISO?.includes('2026-09-24T19:30:00.000Z'));
  });

  it('should return null ISO windows in shift schedule when on day off', () => {
    const stylist = new Stylist({ ...defaultStylistProps, isDayOff: true });
    const schedule = stylist.getShiftScheduleWindow('2026-09-24');

    assert.equal(schedule.isDayOff, true);
    assert.equal(schedule.canTakeAppointments, false);
    assert.equal(schedule.startISO, null);
    assert.equal(schedule.endISO, null);
  });
});
