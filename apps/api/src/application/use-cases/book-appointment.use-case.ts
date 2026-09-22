import { randomUUID } from 'crypto';
import { IBookAppointmentUseCase } from '../ports/book-appointment.port';
import { CreateAppointmentDTO, AppointmentResponseDTO } from '../dtos';
import { IAppointmentRepository } from '../../domain/ports/appointment-repository.port';
import { IStylistRepository } from '../../domain/ports/stylist-repository.port';
import { IServiceRepository } from '../../domain/ports/service-repository.port';
import { IClientRepository } from '../../domain/ports/client-repository.port';
import { IDistributedLockPort } from '../../domain/ports/distributed-lock.port';
import { Appointment } from '../../domain/models/appointment.entity';
import { AppointmentCollisionService } from '../../domain/services/appointment-collision.service';
import {
  EntityNotFoundException,
  StylistUnavailableException,
  CrossTenantAccessException,
} from '../../domain/exceptions/domain.exception';
import { ITenantContextPort } from '../../domain/ports/tenant-context.port';

export class BookAppointmentUseCase implements IBookAppointmentUseCase {
  constructor(
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly stylistRepo: IStylistRepository,
    private readonly serviceRepo: IServiceRepository,
    private readonly clientRepo: IClientRepository,
    private readonly lockService: IDistributedLockPort,
    private readonly tenantPort?: ITenantContextPort
  ) {}

  public async execute(dto: CreateAppointmentDTO): Promise<AppointmentResponseDTO> {
    const tenant = this.tenantPort?.getTenant();
    if (tenant && !tenant.isSuperAdmin) {
      if (dto.branchId && dto.branchId !== tenant.branchId) {
        throw new CrossTenantAccessException(
          `Accès inter-succursales interdit : impossible de réserver pour la succursale "${dto.branchId}".`
        );
      }
    }

    // Acquire distributed lock to prevent race conditions on the same stylist schedule
    const lockResource = `lock:stylist:${dto.stylistId}:slot`;
    const lock = await this.lockService.acquireLock(lockResource, 5000);

    try {
      // 1. Verify stylist
      const stylist = await this.stylistRepo.findById(dto.stylistId);
      if (!stylist) {
        throw new EntityNotFoundException('Coiffeuse', dto.stylistId);
      }
      if (tenant && !tenant.isSuperAdmin && stylist.branchId !== tenant.branchId) {
        throw new CrossTenantAccessException(`La coiffeuse n'appartient pas à votre succursale autorisée.`);
      }

      if (!stylist.canTakeAppointments()) {
        throw new StylistUnavailableException(
          `La coiffeuse ${stylist.fullName} n'est pas disponible (repos ou compte inactif).`
        );
      }

      // 2. Verify service
      const service = await this.serviceRepo.findById(dto.serviceId);
      if (!service) {
        throw new EntityNotFoundException('Prestation', dto.serviceId);
      }
      if (service.branchId !== dto.branchId) {
        throw new CrossTenantAccessException(`La prestation n'appartient pas à la succursale sélectionnée.`);
      }

      // 3. Verify client
      const client = await this.clientRepo.findById(dto.clientId);
      if (!client) {
        throw new EntityNotFoundException('Cliente', dto.clientId);
      }
      if (client.branchId !== dto.branchId) {
        throw new CrossTenantAccessException(`La cliente n'appartient pas à la succursale sélectionnée.`);
      }

      // 4. Build TimeSlot with service duration and Moroccan salon buffer
      const requestedSlot = service.createTimeSlot(dto.startTime);

      // 5. Verify stylist shift bounds
      if (!stylist.isAvailableFor(requestedSlot)) {
        throw new StylistUnavailableException(
          `Le créneau (${requestedSlot.startTime.toLocaleTimeString()} - ${requestedSlot.bufferEndTime.toLocaleTimeString()}) dépasse les heures d'ouverture de ${stylist.fullName} (${stylist.workingStart} - ${stylist.workingEnd}).`
        );
      }

      // 6. Check for collisions against active appointments
      const overlapping = await this.appointmentRepo.findOverlapping(
        dto.stylistId,
        requestedSlot.startTime,
        requestedSlot.bufferEndTime
      );
      AppointmentCollisionService.checkCollision(requestedSlot, overlapping);

      // 7. Instantiate Appointment Aggregate Root
      const appointment = new Appointment({
        id: randomUUID(),
        branchId: dto.branchId,
        stylistId: dto.stylistId,
        clientId: dto.clientId,
        serviceId: dto.serviceId,
        timeSlot: requestedSlot,
        price: service.price,
        status: 'BOOKED',
        notes: dto.notes,
      });

      // 8. Persist appointment via Outbound Port
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
      };
    } finally {
      await lock.release();
    }
  }
}
