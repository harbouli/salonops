import { Money } from '../value-objects/money.vo';
import { Transaction } from './transaction.entity';

export interface StylistCaisseSummary {
  stylistId: string;
  serviceRevenue: Money;
  commission: Money;
  tips: Money;
  transactionCount: number;
}

export interface CaisseReconciliationProps {
  branchId: string;
  date: string;
  openingCash: Money;
  totalCash: Money;
  totalCard: Money;
  totalPaid: Money;
  totalServiceRevenue: Money;
  totalRetailRevenue: Money;
  totalGrossRevenue: Money;
  totalTips: Money;
  totalCommissions: Money;
  netSalonRevenue: Money;
  transactionCount: number;
  expectedDrawerCash: Money;
  actualCash?: Money | null;
  variance?: Money | null;
  isBalanced: boolean;
  stylistBreakdowns: StylistCaisseSummary[];
}

export class CaisseReconciliation {
  public readonly branchId: string;
  public readonly date: string;
  public readonly openingCash: Money;
  public readonly totalCash: Money;
  public readonly totalCard: Money;
  public readonly totalPaid: Money;
  public readonly totalServiceRevenue: Money;
  public readonly totalRetailRevenue: Money;
  public readonly totalGrossRevenue: Money;
  public readonly totalTips: Money;
  public readonly totalCommissions: Money;
  public readonly netSalonRevenue: Money;
  public readonly transactionCount: number;
  public readonly expectedDrawerCash: Money;
  public readonly actualCash: Money | null;
  public readonly variance: Money | null;
  public readonly isBalanced: boolean;
  public readonly stylistBreakdowns: StylistCaisseSummary[];

  constructor(props: CaisseReconciliationProps) {
    this.branchId = props.branchId;
    this.date = props.date;
    this.openingCash = props.openingCash;
    this.totalCash = props.totalCash;
    this.totalCard = props.totalCard;
    this.totalPaid = props.totalPaid;
    this.totalServiceRevenue = props.totalServiceRevenue;
    this.totalRetailRevenue = props.totalRetailRevenue;
    this.totalGrossRevenue = props.totalGrossRevenue;
    this.totalTips = props.totalTips;
    this.totalCommissions = props.totalCommissions;
    this.netSalonRevenue = props.netSalonRevenue;
    this.transactionCount = props.transactionCount;
    this.expectedDrawerCash = props.expectedDrawerCash;
    this.actualCash = props.actualCash ?? null;
    this.variance = props.variance ?? null;
    this.isBalanced = props.isBalanced;
    this.stylistBreakdowns = props.stylistBreakdowns;
  }

  public static fromTransactions(params: {
    branchId: string;
    date: string;
    transactions: Transaction[];
    openingCashMad?: number | string;
    actualCashMad?: number | string;
  }): CaisseReconciliation {
    const openingCash = params.openingCashMad !== undefined
      ? Money.fromMad(params.openingCashMad).ensureNonNegative('Le fond de caisse')
      : Money.zero();

    let totalCash = Money.zero();
    let totalCard = Money.zero();
    let totalServiceRevenue = Money.zero();
    let totalRetailRevenue = Money.zero();
    let totalTips = Money.zero();
    let totalCommissions = Money.zero();

    const stylistMap = new Map<string, {
      serviceRevenue: Money;
      commission: Money;
      tips: Money;
      count: number;
    }>();

    for (const tx of params.transactions) {
      totalCash = totalCash.add(tx.cashAmount);
      totalCard = totalCard.add(tx.cardAmount);
      totalServiceRevenue = totalServiceRevenue.add(tx.serviceTotal);
      totalRetailRevenue = totalRetailRevenue.add(tx.retailTotal);
      totalTips = totalTips.add(tx.tipAmount);
      totalCommissions = totalCommissions.add(tx.stylistCommission);

      const existing = stylistMap.get(tx.stylistId) ?? {
        serviceRevenue: Money.zero(),
        commission: Money.zero(),
        tips: Money.zero(),
        count: 0,
      };

      existing.serviceRevenue = existing.serviceRevenue.add(tx.serviceTotal);
      existing.commission = existing.commission.add(tx.stylistCommission);
      existing.tips = existing.tips.add(tx.tipAmount);
      existing.count += 1;

      stylistMap.set(tx.stylistId, existing);
    }

    const totalPaid = totalCash.add(totalCard);
    const totalGrossRevenue = totalServiceRevenue.add(totalRetailRevenue);
    const netSalonRevenue = totalGrossRevenue.subtract(totalCommissions);
    const expectedDrawerCash = openingCash.add(totalCash);

    let actualCash: Money | null = null;
    let variance: Money | null = null;
    let isBalanced = true;

    if (params.actualCashMad !== undefined) {
      actualCash = Money.fromMad(params.actualCashMad).ensureNonNegative('Le montant réel en caisse');
      const check = Money.varianceCheck(expectedDrawerCash, actualCash);
      variance = check.variance;
      isBalanced = check.isBalanced;
    }

    const stylistBreakdowns: StylistCaisseSummary[] = Array.from(stylistMap.entries()).map(
      ([stylistId, data]) => ({
        stylistId,
        serviceRevenue: data.serviceRevenue,
        commission: data.commission,
        tips: data.tips,
        transactionCount: data.count,
      })
    );

    return new CaisseReconciliation({
      branchId: params.branchId,
      date: params.date,
      openingCash,
      totalCash,
      totalCard,
      totalPaid,
      totalServiceRevenue,
      totalRetailRevenue,
      totalGrossRevenue,
      totalTips,
      totalCommissions,
      netSalonRevenue,
      transactionCount: params.transactions.length,
      expectedDrawerCash,
      actualCash,
      variance,
      isBalanced,
      stylistBreakdowns,
    });
  }
}
