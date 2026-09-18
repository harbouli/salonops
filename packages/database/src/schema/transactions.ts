import { pgTable, uuid, numeric, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { branches } from './branches';
import { users } from './users';
import { clients } from './clients';
import { appointments } from './appointments';

export const paymentMethodEnum = pgEnum('payment_method', ['CASH', 'TPE_CARD', 'SPLIT']);

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id')
    .references(() => branches.id, { onDelete: 'cascade' })
    .notNull(),
  appointmentId: uuid('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
  stylistId: uuid('stylist_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  serviceTotalMad: numeric('service_total_mad', { precision: 10, scale: 2 }).notNull(),
  retailTotalMad: numeric('retail_total_mad', { precision: 10, scale: 2 }).default('0.00').notNull(),
  tipAmountMad: numeric('tip_amount_mad', { precision: 10, scale: 2 }).default('0.00').notNull(),
  paymentMethod: paymentMethodEnum('payment_method').default('CASH').notNull(),
  cashAmountMad: numeric('cash_amount_mad', { precision: 10, scale: 2 }).default('0.00').notNull(),
  cardAmountMad: numeric('card_amount_mad', { precision: 10, scale: 2 }).default('0.00').notNull(),
  stylistCommissionMad: numeric('stylist_commission_mad', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
