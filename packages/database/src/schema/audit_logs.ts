import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { branches } from './branches';
import { users } from './users';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'cascade' }),
  actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
  actionType: varchar('action_type', { length: 128 }).notNull(),
  entityType: varchar('entity_type', { length: 128 }).notNull(),
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  changeDiff: jsonb('change_diff').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type AuditLogRecord = typeof auditLogs.$inferSelect;
export type NewAuditLogRecord = typeof auditLogs.$inferInsert;
