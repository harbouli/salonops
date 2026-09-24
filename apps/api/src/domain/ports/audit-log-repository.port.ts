import { AuditLog } from '../models/audit-log.entity';

export interface IAuditLogRepository {
  /**
   * Append-only insertion of financial audit log entry.
   * Updates and deletions are explicitly strictly forbidden by design.
   */
  append(auditLog: AuditLog): Promise<AuditLog>;
  findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
  findAll(branchId?: string): Promise<AuditLog[]>;
}
