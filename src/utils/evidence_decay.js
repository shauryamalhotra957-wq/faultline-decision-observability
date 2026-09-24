/**
 * Evidence Temporal Freshness & Half-Life Decay Evaluator.
 * Computes decayed confidence scores of observational facts in calibration ledgers
 * using exponential decay: Score(t) = Score_0 * (0.5 ^ (elapsed_days / half_life_days)).
 */
export class EvidenceDecayEvaluator {
  constructor(defaultHalfLifeDays = 30.0) {
    this.defaultHalfLifeDays = defaultHalfLifeDays;
  }

  calculateDecayedScore(initialScore, elapsedDays, halfLifeDays = this.defaultHalfLifeDays) {
    if (elapsedDays <= 0) return initialScore;
    if (halfLifeDays <= 0) return 0.0;

    const decayFactor = Math.pow(0.5, elapsedDays / halfLifeDays);
    const score = initialScore * decayFactor;
    return Number(score.toFixed(4));
  }

  auditPortfolioFreshness(evidenceList, currentDayOffset = 0) {
    return evidenceList.map(e => {
      const elapsed = Math.max(0, currentDayOffset - (e.timestampDay || 0));
      const decayedScore = this.calculateDecayedScore(e.initialScore, elapsed, e.halfLifeDays);
      return {
        id: e.id,
        initialScore: e.initialScore,
        decayedScore,
        retireRecommended: decayedScore < (e.retirementThreshold || 0.1),
      };
    });
  }
}
