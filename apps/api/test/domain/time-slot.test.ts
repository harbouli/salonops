import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TimeSlot } from '../../src/domain/value-objects/time-slot.vo';
import { InvalidValueException } from '../../src/domain/exceptions/domain.exception';

describe('TimeSlot Value Object', () => {
  it('should compute endTime and bufferEndTime accurately based on Moroccan buffer minutes', () => {
    const start = new Date('2026-09-18T10:00:00.000Z');
    const slot = TimeSlot.create(start, 60, 15);

    assert.equal(slot.startTime.toISOString(), '2026-09-18T10:00:00.000Z');
    assert.equal(slot.endTime.toISOString(), '2026-09-18T11:00:00.000Z');
    assert.equal(slot.bufferEndTime.toISOString(), '2026-09-18T11:15:00.000Z');
  });

  it('should detect collision when another appointment overlaps with buffer time', () => {
    const start1 = new Date('2026-09-18T10:00:00.000Z');
    const slot1 = TimeSlot.create(start1, 60, 15); // 10:00 to 11:15 (with buffer)

    // Slot 2 begins at 11:10, colliding with slot 1's buffer
    const start2 = new Date('2026-09-18T11:10:00.000Z');
    const slot2 = TimeSlot.create(start2, 30, 0);

    assert.equal(slot1.overlapsWith(slot2), true);
    assert.equal(slot2.overlapsWith(slot1), true);
  });

  it('should allow adjacent appointments when slot begins exactly at buffer end time', () => {
    const start1 = new Date('2026-09-18T10:00:00.000Z');
    const slot1 = TimeSlot.create(start1, 60, 15); // ends with buffer at 11:15

    // Slot 2 starts exactly at 11:15
    const start2 = new Date('2026-09-18T11:15:00.000Z');
    const slot2 = TimeSlot.create(start2, 45, 10);

    assert.equal(slot1.overlapsWith(slot2), false);
    assert.equal(slot2.overlapsWith(slot1), false);
  });

  it('should reject invalid duration or negative buffer', () => {
    const start = new Date();
    assert.throws(() => TimeSlot.create(start, 0, 10), InvalidValueException);
    assert.throws(() => TimeSlot.create(start, -30, 10), InvalidValueException);
    assert.throws(() => TimeSlot.create(start, 45, -5), InvalidValueException);
  });

  it('should validate working hours correctly', () => {
    // 10:00 UTC with 60 min + 15 min buffer (local time will depend on timezone, test shift bounds)
    const d = new Date();
    d.setHours(10, 0, 0, 0);
    const slot = TimeSlot.create(d, 60, 15); // ends at 11:15

    assert.equal(slot.isWithinWorkingHours('09:00', '19:30'), true);
    assert.equal(slot.isWithinWorkingHours('11:30', '19:30'), false);
    assert.equal(slot.isWithinWorkingHours('09:00', '11:00'), false);
  });
});
