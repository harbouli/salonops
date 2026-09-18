import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { clients } from './clients';
import { users } from './users';
import { appointments } from './appointments';

export const hairFormulas = pgTable('hair_formulas', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id')
    .references(() => clients.id, { onDelete: 'cascade' })
    .notNull(),
  appointmentId: uuid('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
  stylistId: uuid('stylist_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  visitDate: timestamp('visit_date', { withTimezone: true }).defaultNow().notNull(),
  brand: varchar('brand', { length: 128 }).notNull(),
  shadeFormula: text('shade_formula').notNull(),
  developerVolume: varchar('developer_volume', { length: 64 }).notNull(),
  processingTimeMinutes: integer('processing_time_minutes').notNull(),
  beforePhotoUrl: text('before_photo_url'),
  afterPhotoUrl: text('after_photo_url'),
  scalpAlert: text('scalp_alert'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type HairFormula = typeof hairFormulas.$inferSelect;
export type NewHairFormula = typeof hairFormulas.$inferInsert;
