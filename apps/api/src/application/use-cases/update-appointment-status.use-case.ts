import {
  IUpdateAppointmentStatusUseCase,
  UpdateAppointmentStatusDTO,
  CancelAppointmentDTO,
  MarkNoShowDTO,
  AppointmentStatusUpdateResultDTO,
} from '../ports/update-appointment-status.port';
import { IAppointmentRepository } from '../../domain/ports/appointment-repository.port';
import { IClientRepository } from '../../domain/ports/client-repository.port';
import { ITenantContextPort } from '../../domain/ports/tenant-context.port';
import {
  EntityNotFoundException,
  InvalidAppointmentStateException,
  CrossTenantAccessException,
} from '../../domain/exceptions/domain.exception';

export class UpdateAppointmentStatusUseCase implements IUpdateAppointmentStatusUseCase {
  constructor(
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly clientRepo?: IClientRepository,
    private readonly tenantPort?: ITenantContextPort
  ) {}

  public async execute(dto: UpdateAppointmentStatusDTO): Promise<AppointmentStatusUpdateResultDTO> {
    const appointment = await this.appointmentRepo.findById(dto.appointmentId);
    if (!appointment) {
      throw new EntityNotFoundException('Rendez-vous', dto.appointmentId);
    }

    const tenant = this.tenantPort?.getTenant();
    if (tenant && !tenant.isSuperAdmin && appointment.branchId !== tenant.branchId) {
      throw new CrossTenantAccessException(`Ce rendez-vous appartient à une autre succursale.`);
    }

    const client = this.clientRepo ? await this.clientRepo.findById(appointment.clientId) : null;
    let isLateCancellation: boolean | undefined;

    switch (dto.status) {
      case 'CONFIRMED':
        appointment.confirm();
        break;
      case 'IN_CHAIR':
        appointment.startInChair();
        break;
      case 'COMPLETED':
        appointment.complete();
        if (client) {
          client.recordCompletedVisit();
          await this.clientRepo!.save(client);
        }
        break;
      case 'CANCELLED': {
        const cancelResult = appointment.cancel({
          reason: dto.reason,
          cancellationTime: dto.cancellationTime,
          minNoticeHours: dto.minNoticeHours,
        });
        isLateCancellation = cancelResult.isLate;
        if (client && isLateCancellation) {
          client.recordLateCancellation();
          await this.clientRepo!.save(client);
        }
        break;
      }
      case 'NO_SHOW':
        appointment.markNoShow({
          recordedAt: dto.recordedAt,
          gracePeriodMinutes: dto.gracePeriodMinutes,
        });
        if (client) {
          client.recordNoShow();
          await this.clientRepo!.save(client);
        }
        break;
      default:
        throw new InvalidAppointmentStateException(`Statut inconnu: ${dto.status}`);
    }

    const saved = await this.appointmentRepo.save(appointment);

    return {
      id: saved.id,
      branchId: saved.branchId,
      stylistId: saved.stylistId,
      clientId: saved.clientId,
      serviceId: saved.serviceId,
      startTime: saved.timeSlot.startTime.toISOString(),
      endTime: saved.timeSlot.endTime.toISOString(),
      bufferEndTime: saved.timeSlot.bufferEndTime.toISOString(),
      priceMad: saved.price.toMadString(),
      status: saved.status,
      notes: saved.notes,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
      clientReliabilityScore: client?.reliabilityScore.value,
      clientReliabilityTier: client?.reliabilityScore.tier,
      isLateCancellation,
    };
  }

  public async cancel(dto: CancelAppointmentDTO): Promise<AppointmentStatusUpdateResultDTO> {
    return this.execute({
      appointmentId: dto.appointmentId,
      status: 'CANCELLED',
      reason: dto.reason,
      cancellationTime: dto.cancellationTime,
      minNoticeHours: dto.minNoticeHours,
    });
  }

  public async markNoShow(dto: MarkNoShowDTO): Promise<AppointmentStatusUpdateResultDTO> {
    return this.execute({
      appointmentId: dto.appointmentId,
      status: 'NO_SHOW',
      recordedAt: dto.recordedAt,
      gracePeriodMinutes: dto.gracePeriodMinutes,
    });
  }
}
