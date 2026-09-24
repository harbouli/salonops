import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseTimeToMinutes,
  minutesToTimeString,
  formatDurationHuman,
  calculateSlotTimeline,
  validateDoubleBooking,
} from '../utils/bookingUtils';
import { SALON_SERVICES, MOCK_STYLISTS } from '../mock/agendaData';
import { Appointment } from '../types/agenda';

describe('SALON-3 / BOOK-02: Mobile Appointment Booking Prototype & Buffer Engine', () => {
  describe('1. Service Catalog with Predefined Durations and Required Buffers', () => {
    it('should have Coupe + Brushing configured as 45 min + 10 min buffer (150 MAD)', () => {
      const coupe = SALON_SERVICES.find((s) => s.id === 'srv-coupe-brushing')!;
      assert.ok(coupe, 'Coupe service must exist');
      assert.strictEqual(coupe.durationMinutes, 45);
      assert.strictEqual(coupe.bufferMinutes, 10);
      assert.strictEqual(coupe.priceMad, 150);
      assert.strictEqual(coupe.priceFormatted, '150 MAD');
      assert.strictEqual(coupe.isChemical, false);
    });

    it('should have Coloration Racine configured as 1h45 (105 min) + 15 min buffer (350 MAD)', () => {
      const coloration = SALON_SERVICES.find((s) => s.id === 'srv-coloration-racine')!;
      assert.ok(coloration, 'Coloration service must exist');
      assert.strictEqual(coloration.durationMinutes, 105);
      assert.strictEqual(coloration.bufferMinutes, 15);
      assert.strictEqual(coloration.priceMad, 350);
      assert.strictEqual(coloration.priceFormatted, '350 MAD');
      assert.strictEqual(coloration.isChemical, true);
    });

    it('should have Lissage Protéine configured as 3h00 (180 min) + 20 min buffer (900 MAD)', () => {
      const lissage = SALON_SERVICES.find((s) => s.id === 'srv-lissage-proteine')!;
      assert.ok(lissage, 'Lissage service must exist');
      assert.strictEqual(lissage.durationMinutes, 180);
      assert.strictEqual(lissage.bufferMinutes, 20);
      assert.strictEqual(lissage.priceMad, 900);
      assert.strictEqual(lissage.priceFormatted, '900 MAD');
      assert.strictEqual(lissage.isChemical, true);
    });
  });

  describe('2. Buffer Timeline Preview: Automatic Calculation & Visual Formula', () => {
    it('should calculate [Service: 10:00 - 11:45] + [Buffer: 11:45 - 12:00] = Next free slot at 12:00', () => {
      const coloration = SALON_SERVICES.find((s) => s.id === 'srv-coloration-racine')!;
      const timeline = calculateSlotTimeline('10:00', coloration.durationMinutes, coloration.bufferMinutes);

      assert.strictEqual(timeline.startTime, '10:00');
      assert.strictEqual(timeline.endTime, '11:45');
      assert.strictEqual(timeline.bufferEndTime, '12:00');
      assert.strictEqual(timeline.nextFreeSlot, '12:00');
      assert.strictEqual(timeline.durationMinutes, 105);
      assert.strictEqual(timeline.bufferMinutes, 15);
      assert.strictEqual(timeline.totalReservedMinutes, 120);
    });

    it('should calculate Coupe + Brushing timeline accurately (45 min + 10 min buffer)', () => {
      const coupe = SALON_SERVICES.find((s) => s.id === 'srv-coupe-brushing')!;
      const timeline = calculateSlotTimeline('14:00', coupe.durationMinutes, coupe.bufferMinutes);

      assert.strictEqual(timeline.startTime, '14:00');
      assert.strictEqual(timeline.endTime, '14:45');
      assert.strictEqual(timeline.bufferEndTime, '14:55');
      assert.strictEqual(timeline.nextFreeSlot, '14:55');
      assert.strictEqual(timeline.totalReservedMinutes, 55);
    });

    it('should calculate Lissage Protéine timeline accurately (180 min + 20 min buffer)', () => {
      const lissage = SALON_SERVICES.find((s) => s.id === 'srv-lissage-proteine')!;
      const timeline = calculateSlotTimeline('14:00', lissage.durationMinutes, lissage.bufferMinutes);

      assert.strictEqual(timeline.startTime, '14:00');
      assert.strictEqual(timeline.endTime, '17:00');
      assert.strictEqual(timeline.bufferEndTime, '17:20');
      assert.strictEqual(timeline.nextFreeSlot, '17:20');
      assert.strictEqual(timeline.totalReservedMinutes, 200);
    });

    it('should format durations in human-friendly format', () => {
      assert.strictEqual(formatDurationHuman(45), '45 min');
      assert.strictEqual(formatDurationHuman(105), '1h45');
      assert.strictEqual(formatDurationHuman(180), '3h00');
      assert.strictEqual(formatDurationHuman(200), '3h20');
    });
  });

  describe('3. Concurrency / Double-Booking Guard & Collision Detection', () => {
    const mockAppointments: Appointment[] = [
      {
        id: 'apt-1',
        stylistId: '1', // Fatima
        client: 'Meryem Bennani',
        service: 'Coloration Racine',
        startTime: '10:00',
        endTime: '11:45',
        buffer: '15', // buffer runs until 12:00
        bufferEndTime: '12:00',
        price: '350 MAD',
        status: 'CONFIRMED',
      },
      {
        id: 'apt-2',
        stylistId: '1', // Fatima
        client: 'Kenza Tazi',
        service: 'Coupe + Brushing',
        startTime: '12:00',
        endTime: '12:45',
        buffer: '10', // buffer runs until 12:55
        bufferEndTime: '12:55',
        price: '150 MAD',
        status: 'IN_CHAIR',
      },
      {
        id: 'apt-3',
        stylistId: '2', // Salma
        client: 'Samira Idrissi',
        service: 'Lissage Protéine',
        startTime: '14:00',
        endTime: '17:00',
        buffer: '20',
        bufferEndTime: '17:20',
        price: '900 MAD',
        status: 'CONFIRMED',
      },
    ];

    it('should detect collision when requested interval overlaps with active service', () => {
      const result = validateDoubleBooking({
        stylistId: '1',
        startTime: '10:30',
        durationMinutes: 45,
        bufferMinutes: 10,
        appointments: mockAppointments,
        stylist: MOCK_STYLISTS[0],
      });

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.reason, 'collision');
      assert.strictEqual(result.conflictingAppointment?.client, 'Meryem Bennani');
      assert.ok(result.message.includes('Conflit de créneau'));
    });

    it('should detect collision when requested interval overlaps with post-chemical buffer time', () => {
      // Fatima is in service 10:00-11:45, and in buffer 11:45-12:00.
      // Trying to book starting at 11:45 should be blocked by the buffer!
      const result = validateDoubleBooking({
        stylistId: '1',
        startTime: '11:45',
        durationMinutes: 45,
        bufferMinutes: 10,
        appointments: mockAppointments,
        stylist: MOCK_STYLISTS[0],
      });

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.reason, 'collision');
      assert.ok(result.message.includes('buffer technique'));
      assert.strictEqual(result.nextAvailableSlot, '12:00');
    });

    it('should detect collision when an earlier booking buffer extends into an existing appointment', () => {
      // Trying to book 09:30 with 45m duration + 15m buffer -> buffer ends at 10:30.
      // Existing appointment starts at 10:00 -> COLLISION!
      const result = validateDoubleBooking({
        stylistId: '1',
        startTime: '09:30',
        durationMinutes: 45,
        bufferMinutes: 15,
        appointments: mockAppointments,
        stylist: MOCK_STYLISTS[0],
      });

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.reason, 'collision');
    });

    it('should detect collision with subsequent booking at 12:00', () => {
      // At 12:00, Kenza Tazi is booked (12:00 - 12:45 + 10m buffer = 12:55)
      const result = validateDoubleBooking({
        stylistId: '1',
        startTime: '12:00',
        durationMinutes: 45,
        bufferMinutes: 10,
        appointments: mockAppointments,
        stylist: MOCK_STYLISTS[0],
      });

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.reason, 'collision');
      assert.strictEqual(result.conflictingAppointment?.client, 'Kenza Tazi');
    });

    it('should allow booking when slot is completely free after all previous buffers', () => {
      // At 13:00, Kenza Tazi buffer ended at 12:55 -> 13:00 is completely free!
      const result = validateDoubleBooking({
        stylistId: '1',
        startTime: '13:00',
        durationMinutes: 45,
        bufferMinutes: 10,
        appointments: mockAppointments,
        stylist: MOCK_STYLISTS[0],
      });

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.nextAvailableSlot, '13:55');
      assert.ok(result.message.includes('Créneau libre'));
    });

    it('should allow booking for another stylist who is free at that time', () => {
      // Salma (stylistId: '2') only has an appointment at 14:00.
      // Booking at 10:00 for Salma is completely valid!
      const result = validateDoubleBooking({
        stylistId: '2',
        startTime: '10:00',
        durationMinutes: 105,
        bufferMinutes: 15,
        appointments: mockAppointments,
        stylist: MOCK_STYLISTS[1],
      });

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.nextAvailableSlot, '12:00');
    });

    it('should immediately block booking if stylist is on day off', () => {
      const youssef = MOCK_STYLISTS.find((s) => s.id === '3')!; // isDayOff: true
      const result = validateDoubleBooking({
        stylistId: youssef.id,
        startTime: '11:00',
        durationMinutes: 45,
        bufferMinutes: 10,
        appointments: mockAppointments,
        stylist: youssef,
      });

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.reason, 'stylist_off');
      assert.ok(result.message.includes('congé'));
    });

    it('should block booking outside salon operating hours (09:00 - 20:00)', () => {
      // Too early: 08:30
      const earlyResult = validateDoubleBooking({
        stylistId: '1',
        startTime: '08:30',
        durationMinutes: 45,
        bufferMinutes: 10,
        appointments: mockAppointments,
        stylist: MOCK_STYLISTS[0],
      });
      assert.strictEqual(earlyResult.isValid, false);
      assert.strictEqual(earlyResult.reason, 'out_of_hours');

      // Too late: 18:00 + 180m duration + 20m buffer = 21:20 (> 20:00)
      const lateResult = validateDoubleBooking({
        stylistId: '1',
        startTime: '18:00',
        durationMinutes: 180,
        bufferMinutes: 20,
        appointments: mockAppointments,
        stylist: MOCK_STYLISTS[0],
      });
      assert.strictEqual(lateResult.isValid, false);
      assert.strictEqual(lateResult.reason, 'out_of_hours');
    });
  });
});
