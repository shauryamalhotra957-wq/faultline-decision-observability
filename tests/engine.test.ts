import assert from "node:assert/strict";
import test from "node:test";
import { evidenceCorpus } from "../lib/demo-data.ts";
import {
  calculateBrierScore,
  computeFaultlineScore,
  rankEvidence,
  simulateDecision,
} from "../lib/engine.ts";

test("simulation is deterministic for a fixed seed", () => {
  const input = { adoption: 67, priceDelta: 8, capacity: 88, retention: 91 };
  const first = simulateDecision(input, 9917, 1200);
  const second = simulateDecision(input, 9917, 1200);
  assert.deepEqual(first, second);
  assert.equal(first.distribution.length, 24);
  assert.ok(first.successProbability >= 0 && first.successProbability <= 100);
});

test("simulation clamps hostile input to safe modeling bounds", () => {
  const result = simulateDecision(
    { adoption: 999, priceDelta: -999, capacity: 0, retention: -20 },
    42,
    600,
  );
  for (const value of [result.expectedValue, result.downsideP95, result.volatility, result.confidence]) {
    assert.ok(Number.isFinite(value));
  }
  assert.ok(result.confidence >= 42 && result.confidence <= 94);
});

test("hybrid retrieval promotes semantically aligned, reliable evidence", () => {
  const results = rankEvidence("safe European launch and data privacy", evidenceCorpus, 4);
  assert.ok(results.length >= 2);
  assert.equal(results[0].id, "EV-204");
  assert.ok(results[0].score > results[1].score);
  assert.match(results[0].matchReason, /signal|tag|relevance/);
});

test("empty evidence queries return no fabricated results", () => {
  assert.deepEqual(rankEvidence("   ", evidenceCorpus), []);
});

test("fault score increases with contradiction, impact, and drift", () => {
  const controlled = computeFaultlineScore({ contradiction: 20, impact: 30, evidenceCoverage: 95, drift: 2 });
  const critical = computeFaultlineScore({ contradiction: 96, impact: 91, evidenceCoverage: 40, drift: 70 });
  assert.ok(critical > controlled);
  assert.ok(critical <= 100);
});

test("Brier scoring rewards calibrated outcomes", () => {
  assert.equal(calculateBrierScore(90, 1), 0.01);
  assert.equal(calculateBrierScore(10, 1), 0.81);
  assert.equal(calculateBrierScore(150, 1), 0);
});
