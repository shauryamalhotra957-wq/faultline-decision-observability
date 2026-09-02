import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CalibrationEngine } from "../lib/calibration.ts";
import type { EvidenceItem } from "../lib/types.ts";

describe("CalibrationEngine", () => {
  it("computes zero entropy for unanimous consensus evidence", () => {
    const evidence: EvidenceItem[] = [
      {
        id: "ev-1",
        title: "Proof 1",
        excerpt: "Positive",
        source: "Audit",
        publishedAt: "2026-07-01",
        stance: "support",
        trust: 0.9,
        tags: ["scale"],
      },
      {
        id: "ev-2",
        title: "Proof 2",
        excerpt: "Positive 2",
        source: "Ops",
        publishedAt: "2026-07-02",
        stance: "support",
        trust: 0.85,
        tags: ["scale"],
      },
    ];

    const result = CalibrationEngine.computeEntropy(evidence);
    assert.equal(result.entropy, 0);
    assert.equal(result.normalizedDisagreement, 0);
    assert.equal(result.consensusState, "CONSENSUS");
  });

  it("flags polarized state on direct support vs counter tension", () => {
    const evidence: EvidenceItem[] = [
      {
        id: "ev-1",
        title: "Revenue Surge",
        excerpt: "Growing fast",
        source: "Sales",
        publishedAt: "2026-07-01",
        stance: "support",
        trust: 0.9,
        tags: ["revenue"],
      },
      {
        id: "ev-2",
        title: "Margin Squeeze",
        excerpt: "Costs high",
        source: "Finance",
        publishedAt: "2026-07-02",
        stance: "counter",
        trust: 0.9,
        tags: ["margin"],
      },
    ];

    const result = CalibrationEngine.computeEntropy(evidence);
    assert.ok(result.entropy > 0.9);
    assert.equal(result.consensusState, "POLARIZED");
  });
});
