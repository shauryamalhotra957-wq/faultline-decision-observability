import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { EvidenceDecayEvaluator } from '../src/utils/evidence_decay.js';

describe('EvidenceDecayEvaluator Test Suite', () => {
  const evaluator = new EvidenceDecayEvaluator(30.0);

  test('score precisely halves after one half-life period', () => {
    const score = evaluator.calculateDecayedScore(1.0, 30.0, 30.0);
    assert.strictEqual(score, 0.5);
  });

  test('zero elapsed days preserves full initial score', () => {
    assert.strictEqual(evaluator.calculateDecayedScore(0.95, 0.0), 0.95);
  });

  test('auditPortfolioFreshness flags expired evidence for retirement', () => {
    const items = [
      { id: 'fresh-fact', initialScore: 1.0, timestampDay: 90, halfLifeDays: 30, retirementThreshold: 0.2 },
      { id: 'stale-fact', initialScore: 1.0, timestampDay: 0, halfLifeDays: 30, retirementThreshold: 0.2 },
    ];
    // Current day = 100 -> fresh-fact elapsed = 10 days, stale-fact elapsed = 100 days
    const results = evaluator.auditPortfolioFreshness(items, 100);
    assert.strictEqual(results[0].retireRecommended, false);
    assert.strictEqual(results[1].retireRecommended, true);
  });
});
