import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { branches } from './branches';

export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id')
    .references(() => branches.id, { onDelete: 'cascade' })
    .notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 32 }).unique().notNull(),
  loyaltyPoints: integer('loyalty_points').default(0).notNull(),
  noShowCount: integer('no_show_count').default(0).notNull(),
  lateCancellationCount: integer('late_cancellation_count').default(0).notNull(),
  reliabilityScore: integer('reliability_score').default(100).notNull(),
  preferences: text('preferences').array(),
  scalpAlert: text('scalp_alert'),
  allergies: text('allergies'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
