import { InvalidValueException } from '../exceptions/domain.exception';

export interface AuditLogProps {
  id: string;
  actorId?: string | null;
  branchId?: string | null;
  actionType: string;
  entityType: string;
  entityId: string;
  changeDiff: Record<string, any>;
  createdAt?: Date;
}

export class AuditLog {
  public readonly id: string;
  public readonly actorId: string | null;
  public readonly branchId: string | null;
  public readonly actionType: string;
  public readonly entityType: string;
  public readonly entityId: string;
  public readonly changeDiff: Record<string, any>;
  public readonly createdAt: Date;

  constructor(props: AuditLogProps) {
    if (!props.actionType || props.actionType.trim() === '') {
      throw new InvalidValueException('Type d\'action audit requis.');
    }
    if (!props.entityType || props.entityType.trim() === '') {
      throw new InvalidValueException('Type d\'entité audit requis.');
    }
    if (!props.entityId || props.entityId.trim() === '') {
      throw new InvalidValueException('Identifiant d\'entité audit requis.');
    }

    this.id = props.id;
    this.actorId = props.actorId ?? null;
    this.branchId = props.branchId ?? null;
    this.actionType = props.actionType;
    this.entityType = props.entityType;
    this.entityId = props.entityId;
    this.changeDiff = Object.freeze({ ...(props.changeDiff ?? {}) });
    this.createdAt = props.createdAt ? new Date(props.createdAt.getTime()) : new Date();
  }
}
