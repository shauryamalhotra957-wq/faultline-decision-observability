import assert from "node:assert/strict";
import test from "node:test";
import {
  isFiniteNumber,
  normalizeDecisionId,
  normalizeSeed,
  validInput,
} from "../app/api/simulate/route.ts";

test("simulation request helpers reject non-finite and incomplete input", () => {
  assert.equal(isFiniteNumber(Number.NaN), false);
  assert.equal(isFiniteNumber(Infinity), false);
  assert.equal(validInput({ adoption: 70, priceDelta: 4, capacity: 90, retention: 88 }), true);
  assert.equal(validInput({ adoption: 70, priceDelta: 4, capacity: "90", retention: 88 }), false);
});

test("decision ids are trimmed and bounded before persistence", () => {
  assert.equal(normalizeDecisionId("  decision-42  "), "decision-42");
  assert.equal(normalizeDecisionId(""), undefined);
  assert.equal(normalizeDecisionId("x".repeat(81)), undefined);
  assert.equal(normalizeDecisionId(42), undefined);
});

test("only safe integer seeds are accepted", () => {
  assert.equal(normalizeSeed(12345), 12345);
  assert.notEqual(normalizeSeed(Number.MAX_SAFE_INTEGER + 1), Number.MAX_SAFE_INTEGER + 1);
  assert.notEqual(normalizeSeed("12345"), 12345);
});
