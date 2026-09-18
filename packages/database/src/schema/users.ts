import { pgTable, uuid, varchar, text, boolean, doublePrecision, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { branches } from './branches';

export const roleEnum = pgEnum('role', ['OWNER', 'MANAGER', 'STYLIST', 'RECEPTIONIST']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id')
    .references(() => branches.id, { onDelete: 'cascade' })
    .notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 32 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').default('STYLIST').notNull(),
  avatarUrl: text('avatar_url'),
  commissionPct: doublePrecision('commission_pct').default(15.0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isDayOff: boolean('is_day_off').default(false).notNull(),
  workingStart: varchar('working_start', { length: 16 }).default('09:00').notNull(),
  workingEnd: varchar('working_end', { length: 16 }).default('19:30').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
