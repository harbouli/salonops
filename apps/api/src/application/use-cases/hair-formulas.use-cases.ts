import { randomUUID } from 'crypto';
import { CreateHairFormulaDTO, HairFormulaResponseDTO } from '../dtos';
import { IHairFormulaRepository } from '../../domain/ports/hair-formula-repository.port';
import { IClientRepository } from '../../domain/ports/client-repository.port';
import { HairFormula } from '../../domain/models/hair-formula.entity';
import { EntityNotFoundException } from '../../domain/exceptions/domain.exception';
import {
  IGetClientFormulasUseCase,
  ISaveHairFormulaUseCase,
} from '../ports/hair-formulas.port';

export class GetClientFormulasUseCase implements IGetClientFormulasUseCase {
  constructor(
    private readonly formulaRepo: IHairFormulaRepository,
    private readonly clientRepo: IClientRepository
  ) {}

  public async execute(clientId: string): Promise<HairFormulaResponseDTO[]> {
    const client = await this.clientRepo.findById(clientId);
    if (!client) {
      throw new EntityNotFoundException('Cliente', clientId);
    }

    const list = await this.formulaRepo.findByClientId(clientId);

    return list.map((f) => ({
      id: f.id,
      clientId: f.clientId,
      appointmentId: f.appointmentId,
      stylistId: f.stylistId,
      visitDate: f.visitDate.toISOString(),
      brand: f.brand,
      shadeFormula: f.shadeFormula,
      developerVolume: f.developerVolume,
      processingTimeMinutes: f.processingTimeMinutes,
      beforePhotoUrl: f.beforePhotoUrl,
      afterPhotoUrl: f.afterPhotoUrl,
      scalpAlert: f.scalpAlert,
      notes: f.notes,
      createdAt: f.createdAt.toISOString(),
    }));
  }
}

export class SaveHairFormulaUseCase implements ISaveHairFormulaUseCase {
  constructor(
    private readonly formulaRepo: IHairFormulaRepository,
    private readonly clientRepo: IClientRepository
  ) {}

  public async execute(dto: CreateHairFormulaDTO): Promise<HairFormulaResponseDTO> {
    const client = await this.clientRepo.findById(dto.clientId);
    if (!client) {
      throw new EntityNotFoundException('Cliente', dto.clientId);
    }

    const formula = new HairFormula({
      id: randomUUID(),
      clientId: dto.clientId,
      appointmentId: dto.appointmentId,
      stylistId: dto.stylistId,
      visitDate: new Date(),
      brand: dto.brand,
      shadeFormula: dto.shadeFormula,
      developerVolume: dto.developerVolume,
      processingTimeMinutes: dto.processingTimeMinutes,
      beforePhotoUrl: dto.beforePhotoUrl,
      afterPhotoUrl: dto.afterPhotoUrl,
      scalpAlert: dto.scalpAlert,
      notes: dto.notes,
    });

    const saved = await this.formulaRepo.save(formula);

    return {
      id: saved.id,
      clientId: saved.clientId,
      appointmentId: saved.appointmentId,
      stylistId: saved.stylistId,
      visitDate: saved.visitDate.toISOString(),
      brand: saved.brand,
      shadeFormula: saved.shadeFormula,
      developerVolume: saved.developerVolume,
      processingTimeMinutes: saved.processingTimeMinutes,
      beforePhotoUrl: saved.beforePhotoUrl,
      afterPhotoUrl: saved.afterPhotoUrl,
      scalpAlert: saved.scalpAlert,
      notes: saved.notes,
      createdAt: saved.createdAt.toISOString(),
    };
  }
}
