import { InvalidValueException } from '../exceptions/domain.exception';

export type ReliabilityTier = 'EXCELLENT' | 'FAIR' | 'AT_RISK';

export class ReliabilityScore {
  private readonly _score: number;

  public static readonly MIN_SCORE = 0;
  public static readonly MAX_SCORE = 100;
  public static readonly INITIAL_SCORE = 100;
  public static readonly NO_SHOW_PENALTY = 20;
  public static readonly LATE_CANCELLATION_PENALTY = 10;
  public static readonly COMPLETED_VISIT_REWARD = 5;

  private constructor(score: number) {
    if (score < ReliabilityScore.MIN_SCORE || score > ReliabilityScore.MAX_SCORE) {
      throw new InvalidValueException(
        `Le score de fiabilité doit être compris entre ${ReliabilityScore.MIN_SCORE} et ${ReliabilityScore.MAX_SCORE}. Reçu: ${score}`
      );
    }
    this._score = score;
  }

  public static create(score: number = ReliabilityScore.INITIAL_SCORE): ReliabilityScore {
    const clamped = Math.max(
      ReliabilityScore.MIN_SCORE,
      Math.min(ReliabilityScore.MAX_SCORE, Math.round(score))
    );
    return new ReliabilityScore(clamped);
  }

  public get value(): number {
    return this._score;
  }

  public get tier(): ReliabilityTier {
    if (this._score >= 80) return 'EXCELLENT';
    if (this._score >= 50) return 'FAIR';
    return 'AT_RISK';
  }

  public isDepositRecommended(): boolean {
    return this.tier === 'AT_RISK';
  }

  public applyNoShowPenalty(): ReliabilityScore {
    return ReliabilityScore.create(this._score - ReliabilityScore.NO_SHOW_PENALTY);
  }

  public applyLateCancellationPenalty(): ReliabilityScore {
    return ReliabilityScore.create(this._score - ReliabilityScore.LATE_CANCELLATION_PENALTY);
  }

  public applyCompletedVisitReward(): ReliabilityScore {
    return ReliabilityScore.create(this._score + ReliabilityScore.COMPLETED_VISIT_REWARD);
  }
}
