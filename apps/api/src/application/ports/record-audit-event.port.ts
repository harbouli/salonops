import { RecordAuditEventDTO, AuditLogResponseDTO } from '../dtos';

export interface IRecordAuditEventUseCase {
  execute(dto: RecordAuditEventDTO): Promise<AuditLogResponseDTO>;
}
