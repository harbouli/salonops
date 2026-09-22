import { ProcessCheckoutDTO, CheckoutResponseDTO } from '../dtos';

export interface IProcessCheckoutUseCase {
  execute(dto: ProcessCheckoutDTO): Promise<CheckoutResponseDTO>;
}
