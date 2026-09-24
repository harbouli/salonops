import { randomUUID } from 'crypto';
import { IRecordAuditEventUseCase } from '../ports/record-audit-event.port';
import { RecordAuditEventDTO, AuditLogResponseDTO } from '../dtos';
import { IAuditLogRepository } from '../../domain/ports/audit-log-repository.port';
import { AuditLog } from '../../domain/models/audit-log.entity';
import { ITenantContextPort } from '../../domain/ports/tenant-context.port';

export class RecordAuditEventUseCase implements IRecordAuditEventUseCase {
  constructor(
    private readonly auditLogRepo: IAuditLogRepository,
    private readonly tenantPort?: ITenantContextPort
  ) {}

  public async execute(dto: RecordAuditEventDTO): Promise<AuditLogResponseDTO> {
    const tenant = this.tenantPort?.getTenant();
    const effectiveBranchId = dto.branchId ?? tenant?.branchId ?? null;
    const effectiveActorId = dto.actorId ?? tenant?.userId ?? null;

    const auditLog = new AuditLog({
      id: randomUUID(),
      actorId: effectiveActorId,
      branchId: effectiveBranchId,
      actionType: dto.actionType,
      entityType: dto.entityType,
      entityId: dto.entityId,
      changeDiff: dto.changeDiff,
    });

    const saved = await this.auditLogRepo.append(auditLog);

    return {
      id: saved.id,
      actorId: saved.actorId,
      branchId: saved.branchId,
      actionType: saved.actionType,
      entityType: saved.entityType,
      entityId: saved.entityId,
      changeDiff: saved.changeDiff,
      createdAt: saved.createdAt.toISOString(),
    };
  }
}
