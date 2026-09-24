import { CreateHairFormulaDTO, HairFormulaResponseDTO } from '../dtos';

export interface IGetClientFormulasUseCase {
  execute(clientId: string): Promise<HairFormulaResponseDTO[]>;
}

export interface ISaveHairFormulaUseCase {
  execute(dto: CreateHairFormulaDTO): Promise<HairFormulaResponseDTO>;
}
