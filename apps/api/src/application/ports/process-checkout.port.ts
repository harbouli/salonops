import {
  ProcessCheckoutDTO,
  CheckoutResponseDTO,
  GetCaisseReconciliationDTO,
  CaisseReconciliationResponseDTO,
} from '../dtos';

export interface IProcessCheckoutUseCase {
  execute(dto: ProcessCheckoutDTO): Promise<CheckoutResponseDTO>;
}

export interface IGetCaisseReconciliationUseCase {
  execute(dto: GetCaisseReconciliationDTO): Promise<CaisseReconciliationResponseDTO>;
}
