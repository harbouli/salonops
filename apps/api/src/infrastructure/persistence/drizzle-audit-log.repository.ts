import { db, auditLogs, eq, and, desc } from '@salonops/database';
import { IAuditLogRepository } from '../../domain/ports/audit-log-repository.port';
import { AuditLog } from '../../domain/models/audit-log.entity';
import { ITenantContextPort } from '../../domain/ports/tenant-context.port';
import { withTenantBranchCondition } from './tenant-scoped-query.decorator';

export class DrizzleAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly tenantPort?: ITenantContextPort) {}

  private toDomain(row: typeof auditLogs.$inferSelect): AuditLog {
    return new AuditLog({
      id: row.id,
      actorId: row.actorId,
      branchId: row.branchId,
      actionType: row.actionType,
      entityType: row.entityType,
      entityId: row.entityId,
      changeDiff: (row.changeDiff as Record<string, any>) ?? {},
      createdAt: row.createdAt,
    });
  }

  public async append(auditLog: AuditLog): Promise<AuditLog> {
    const [row] = await db
      .insert(auditLogs)
      .values({
        id: auditLog.id,
        actorId: auditLog.actorId,
        branchId: auditLog.branchId,
        actionType: auditLog.actionType,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        changeDiff: auditLog.changeDiff,
        createdAt: auditLog.createdAt,
      })
      .returning();

    return this.toDomain(row);
  }

  public async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    const rows = await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
      .orderBy(desc(auditLogs.createdAt));

    return rows.map((r) => this.toDomain(r));
  }

  public async findAll(branchId?: string): Promise<AuditLog[]> {
    const conditions = [];

    const branchCondition = withTenantBranchCondition(
      auditLogs.branchId,
      branchId,
      this.tenantPort?.getTenant()
    );
    if (branchCondition) {
      conditions.push(branchCondition);
    }

    const rows = await db
      .select()
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLogs.createdAt));

    return rows.map((r) => this.toDomain(r));
  }
}
