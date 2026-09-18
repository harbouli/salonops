import { pgTable, uuid, varchar, integer, numeric, boolean, timestamp } from 'drizzle-orm/pg-core';
import { branches } from './branches';

export const services = pgTable('services', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id')
    .references(() => branches.id, { onDelete: 'cascade' })
    .notNull(),
  nameFr: varchar('name_fr', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }).notNull(),
  category: varchar('category', { length: 64 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  bufferMinutes: integer('buffer_minutes').default(10).notNull(),
  priceMad: numeric('price_mad', { precision: 10, scale: 2 }).notNull(),
  depositRequired: boolean('deposit_required').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
