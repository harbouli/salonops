import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  IProcessCheckoutUseCase,
  IGetCaisseReconciliationUseCase,
} from '../../application/ports/process-checkout.port';
import { ITransactionRepository } from '../../domain/ports/transaction-repository.port';
import { EntityNotFoundException, InvalidValueException } from '../../domain/exceptions/domain.exception';
import { processCheckoutSchema, caisseReconciliationQuerySchema } from '../validation/schemas';

export class CheckoutController {
  constructor(
    private readonly processCheckoutUseCase: IProcessCheckoutUseCase,
    private readonly getCaisseReconciliationUseCase?: IGetCaisseReconciliationUseCase,
    private readonly transactionRepo?: ITransactionRepository
  ) {}

  public checkout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = processCheckoutSchema.parse(req.body);
      const result = await this.processCheckoutUseCase.execute(validated);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  public getReconciliation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.getCaisseReconciliationUseCase) {
        throw new InvalidValueException('Service de réconciliation de caisse non configuré.');
      }

      const parsedQuery = caisseReconciliationQuerySchema.parse(req.query);

      // Resolve branchId: explicit query param, or tenant context from auth/header
      const branchId =
        parsedQuery.branchId ||
        (req as any).user?.branchId ||
        (req.headers['x-branch-id'] as string);

      if (!branchId) {
        throw new InvalidValueException('Le paramètre branchId est requis pour la réconciliation.');
      }

      const result = await this.getCaisseReconciliationUseCase.execute({
        branchId,
        date: parsedQuery.date,
        openingCashMad: parsedQuery.openingCashMad,
        actualCashMad: parsedQuery.actualCashMad,
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.transactionRepo) {
        throw new InvalidValueException('Dépôt de transactions non configuré.');
      }

      const id = z.string().uuid({ message: 'ID de transaction invalide' }).parse(req.params.id);
      const tx = await this.transactionRepo.findById(id);

      if (!tx) {
        throw new EntityNotFoundException('Transaction', id);
      }

      res.status(200).json({
        id: tx.id,
        branchId: tx.branchId,
        appointmentId: tx.appointmentId,
        stylistId: tx.stylistId,
        clientId: tx.clientId,
        serviceTotalMad: tx.serviceTotal.toMadString(),
        retailTotalMad: tx.retailTotal.toMadString(),
        tipAmountMad: tx.tipAmount.toMadString(),
        grandTotalMad: tx.grandTotal.toMadString(),
        totalPaidMad: tx.totalPaid.toMadString(),
        changeDueMad: tx.changeDue.toMadString(),
        netSalonRevenueMad: tx.netSalonRevenue.toMadString(),
        paymentMethod: tx.paymentMethod,
        cashAmountMad: tx.cashAmount.toMadString(),
        cardAmountMad: tx.cardAmount.toMadString(),
        stylistCommissionMad: tx.stylistCommission.toMadString(),
        createdAt: tx.createdAt.toISOString(),
      });
    } catch (err) {
      next(err);
    }
  };
}
