import { Money } from '../value-objects/money.vo';
import { InvalidValueException } from '../exceptions/domain.exception';

export type PaymentMethod = 'CASH' | 'TPE_CARD' | 'SPLIT';

export interface TransactionProps {
  id: string;
  branchId: string;
  appointmentId?: string | null;
  stylistId: string;
  clientId?: string | null;
  serviceTotal: Money;
  retailTotal?: Money;
  tipAmount?: Money;
  paymentMethod: PaymentMethod;
  cashAmount: Money;
  cardAmount: Money;
  stylistCommission: Money;
  createdAt?: Date;
}

export class Transaction {
  public readonly id: string;
  public readonly branchId: string;
  public readonly appointmentId?: string | null;
  public readonly stylistId: string;
  public readonly clientId?: string | null;
  public readonly serviceTotal: Money;
  public readonly retailTotal: Money;
  public readonly tipAmount: Money;
  public readonly paymentMethod: PaymentMethod;
  public readonly cashAmount: Money;
  public readonly cardAmount: Money;
  public readonly stylistCommission: Money;
  public readonly createdAt: Date;

  constructor(props: TransactionProps) {
    this.id = props.id;
    this.branchId = props.branchId;
    this.appointmentId = props.appointmentId ?? null;
    this.stylistId = props.stylistId;
    this.clientId = props.clientId ?? null;
    this.serviceTotal = props.serviceTotal;
    this.retailTotal = props.retailTotal ?? Money.zero();
    this.tipAmount = props.tipAmount ?? Money.zero();
    this.paymentMethod = props.paymentMethod;
    this.cashAmount = props.cashAmount;
    this.cardAmount = props.cardAmount;
    this.stylistCommission = props.stylistCommission;
    this.createdAt = props.createdAt ?? new Date();

    this.validatePaymentInvariants();
  }

  public static createCheckout(params: {
    id: string;
    branchId: string;
    appointmentId?: string | null;
    stylistId: string;
    clientId?: string | null;
    serviceTotalMad: number | string;
    retailTotalMad?: number | string;
    tipAmountMad?: number | string;
    paymentMethod: PaymentMethod;
    cashAmountMad?: number | string;
    cardAmountMad?: number | string;
    stylistCommissionPct: number;
  }): Transaction {
    const serviceTotal = Money.fromMad(params.serviceTotalMad);
    const retailTotal = Money.fromMad(params.retailTotalMad ?? 0);
    const tipAmount = Money.fromMad(params.tipAmountMad ?? 0);
    const grandTotal = serviceTotal.add(retailTotal);

    let cash = Money.zero();
    let card = Money.zero();

    if (params.paymentMethod === 'CASH') {
      cash = grandTotal;
    } else if (params.paymentMethod === 'TPE_CARD') {
      card = grandTotal;
    } else {
      // SPLIT
      cash = Money.fromMad(params.cashAmountMad ?? 0);
      card = Money.fromMad(params.cardAmountMad ?? 0);
    }

    // Moroccan salon standard: Stylist commission is calculated on service total
    const stylistCommission = serviceTotal.percentage(params.stylistCommissionPct);

    return new Transaction({
      id: params.id,
      branchId: params.branchId,
      appointmentId: params.appointmentId,
      stylistId: params.stylistId,
      clientId: params.clientId,
      serviceTotal,
      retailTotal,
      tipAmount,
      paymentMethod: params.paymentMethod,
      cashAmount: cash,
      cardAmount: card,
      stylistCommission,
    });
  }

  public get grandTotal(): Money {
    return this.serviceTotal.add(this.retailTotal);
  }

  private validatePaymentInvariants(): void {
    const totalPaid = this.cashAmount.add(this.cardAmount);
    const totalDue = this.serviceTotal.add(this.retailTotal);

    // Allow slight tolerance if tip is included in card/cash, but paid cannot be less than total due
    if (totalPaid.isLessThan(totalDue)) {
      throw new InvalidValueException(
        `Montant réglé (${totalPaid.formatted()}) insuffisant pour régler le total (${totalDue.formatted()}).`
      );
    }
  }
}
