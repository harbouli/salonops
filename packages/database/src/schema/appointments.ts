import { pgTable, uuid, text, numeric, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { branches } from './branches';
import { users } from './users';
import { clients } from './clients';
import { services } from './services';

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'BOOKED',
  'CONFIRMED',
  'IN_CHAIR',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id')
    .references(() => branches.id, { onDelete: 'cascade' })
    .notNull(),
  stylistId: uuid('stylist_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: uuid('client_id')
    .references(() => clients.id, { onDelete: 'cascade' })
    .notNull(),
  serviceId: uuid('service_id')
    .references(() => services.id, { onDelete: 'cascade' })
    .notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  bufferEndTime: timestamp('buffer_end_time', { withTimezone: true }).notNull(),
  priceMad: numeric('price_mad', { precision: 10, scale: 2 }).notNull(),
  status: appointmentStatusEnum('status').default('BOOKED').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
