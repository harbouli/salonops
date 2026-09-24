import { HairFormula } from '../models/hair-formula.entity';

export interface IHairFormulaRepository {
  findByClientId(clientId: string): Promise<HairFormula[]>;
  save(formula: HairFormula): Promise<HairFormula>;
}
