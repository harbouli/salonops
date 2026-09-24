import { AppointmentResponseDTO } from '../dtos';
import { FindAppointmentsFilter, IAppointmentRepository } from '../../domain/ports/appointment-repository.port';
import { IGetAppointmentsUseCase } from '../ports/get-appointments.port';
import { ITenantContextPort } from '../../domain/ports/tenant-context.port';
import { CrossTenantAccessException } from '../../domain/exceptions/domain.exception';

export class GetAppointmentsUseCase implements IGetAppointmentsUseCase {
  constructor(
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly tenantPort?: ITenantContextPort
  ) {}

  public async execute(filter?: FindAppointmentsFilter): Promise<AppointmentResponseDTO[]> {
    const tenant = this.tenantPort?.getTenant();
    let effectiveFilter = filter ? { ...filter } : {};

    if (tenant && !tenant.isSuperAdmin) {
      if (filter?.branchId && filter.branchId !== tenant.branchId) {
        throw new CrossTenantAccessException(
          `Accès inter-succursales interdit : impossible d'accéder aux rendez-vous de la succursale "${filter.branchId}".`
        );
      }
      effectiveFilter.branchId = tenant.branchId;
    }

    const list = await this.appointmentRepo.findAll(effectiveFilter);

    return list.map((apt) => ({
      id: apt.id,
      branchId: apt.branchId,
      stylistId: apt.stylistId,
      clientId: apt.clientId,
      serviceId: apt.serviceId,
      startTime: apt.timeSlot.startTime.toISOString(),
      endTime: apt.timeSlot.endTime.toISOString(),
      bufferEndTime: apt.timeSlot.bufferEndTime.toISOString(),
      priceMad: apt.price.toMadString(),
      status: apt.status,
      notes: apt.notes,
      createdAt: apt.createdAt.toISOString(),
      updatedAt: apt.updatedAt.toISOString(),
    }));
  }
}
