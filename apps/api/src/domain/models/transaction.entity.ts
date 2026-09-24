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
    if (params.stylistCommissionPct < 0 || params.stylistCommissionPct > 100) {
      throw new InvalidValueException('Le pourcentage de commission coiffeuse doit être compris entre 0% et 100%.');
    }

    const serviceTotal = Money.fromMad(params.serviceTotalMad);
    const retailTotal = Money.fromMad(params.retailTotalMad ?? 0);
    const tipAmount = Money.fromMad(params.tipAmountMad ?? 0);
    const grandTotal = serviceTotal.add(retailTotal);

    let cash = Money.zero();
    let card = Money.zero();

    if (params.paymentMethod === 'CASH') {
      cash = params.cashAmountMad !== undefined
        ? Money.fromMad(params.cashAmountMad)
        : grandTotal.add(tipAmount);
      card = Money.zero();
    } else if (params.paymentMethod === 'TPE_CARD') {
      card = params.cardAmountMad !== undefined
        ? Money.fromMad(params.cardAmountMad)
        : grandTotal.add(tipAmount);
      cash = Money.zero();
    } else {
      // SPLIT
      cash = Money.fromMad(params.cashAmountMad ?? 0);
      card = Money.fromMad(params.cardAmountMad ?? 0);
    }

    // Moroccan salon standard: Stylist commission is calculated strictly on service total
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

  public get totalPaid(): Money {
    return this.cashAmount.add(this.cardAmount);
  }

  public get totalWithTip(): Money {
    return this.grandTotal.add(this.tipAmount);
  }

  public get changeDue(): Money {
    const required = this.totalWithTip;
    return this.totalPaid.isGreaterThan(required) ? this.totalPaid.subtract(required) : Money.zero();
  }

  public get netSalonRevenue(): Money {
    return this.grandTotal.subtract(this.stylistCommission);
  }

  private validatePaymentInvariants(): void {
    // 1. Prevent negative balances using Money value object
    this.serviceTotal.ensureNonNegative('Le total des prestations');
    this.retailTotal.ensureNonNegative('Le total des ventes de produits');
    this.tipAmount.ensureNonNegative('Le montant du pourboire');
    this.cashAmount.ensureNonNegative('Le montant en espèces');
    this.cardAmount.ensureNonNegative('Le montant par carte bancaire TPE');
    this.stylistCommission.ensureNonNegative('La commission de la coiffeuse');

    // 2. Validate payment method distribution
    if (this.paymentMethod === 'CASH' && this.cardAmount.isPositive()) {
      throw new InvalidValueException('Un paiement en espèces ne peut pas comporter de montant par carte TPE.');
    }

    if (this.paymentMethod === 'TPE_CARD' && this.cashAmount.isPositive()) {
      throw new InvalidValueException('Un paiement par carte TPE ne peut pas comporter de montant en espèces.');
    }

    if (this.paymentMethod === 'SPLIT' && this.cashAmount.isZero() && this.cardAmount.isZero()) {
      throw new InvalidValueException('Un paiement mixte (Split) doit comprendre au moins un montant en espèces ou carte.');
    }

    // 3. Enforce cashAmount + cardAmount >= serviceTotal + retailTotal
    const totalPaid = this.totalPaid;
    const totalDue = this.grandTotal;

    if (totalPaid.isLessThan(totalDue)) {
      throw new InvalidValueException(
        `Montant réglé (${totalPaid.formatted()}) insuffisant pour régler le total dû (${totalDue.formatted()}).`
      );
    }
  }
}
