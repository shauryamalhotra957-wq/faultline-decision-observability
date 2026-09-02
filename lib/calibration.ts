import type { EvidenceItem } from "./types";

export interface EvidenceEntropyResult {
  entropy: number; // 0.0 (unanimous consensus) to ~1.58 (maximum uncertainty)
  normalizedDisagreement: number; // 0.0 to 1.0
  stanceBreakdown: {
    support: number;
    counter: number;
    neutral: number;
  };
  consensusState: "CONSENSUS" | "POLARIZED" | "HIGH_UNCERTAINTY";
  recommendationNote: string;
}

export class CalibrationEngine {
  static computeEntropy(evidence: EvidenceItem[]): EvidenceEntropyResult {
    if (!evidence || evidence.length === 0) {
      return {
        entropy: 0,
        normalizedDisagreement: 0,
        stanceBreakdown: { support: 0, counter: 0, neutral: 0 },
        consensusState: "HIGH_UNCERTAINTY",
        recommendationNote: "No evidence observed.",
      };
    }

    let supportCount = 0;
    let counterCount = 0;
    let neutralCount = 0;

    for (const item of evidence) {
      if (item.stance === "support") supportCount++;
      else if (item.stance === "counter") counterCount++;
      else neutralCount++;
    }

    const total = evidence.length;
    const pSupport = supportCount / total;
    const pCounter = counterCount / total;
    const pNeutral = neutralCount / total;

    const probs = [pSupport, pCounter, pNeutral].filter((p) => p > 0);
    const entropy = -probs.reduce((sum, p) => sum + p * Math.log2(p), 0);
    const maxEntropy = Math.log2(3); // ~1.585
    const normalizedDisagreement = Number((entropy / maxEntropy).toFixed(3));

    let consensusState: "CONSENSUS" | "POLARIZED" | "HIGH_UNCERTAINTY";
    let recommendationNote: string;

    if (normalizedDisagreement < 0.35) {
      consensusState = "CONSENSUS";
      recommendationNote = "Strong directional alignment across observed evidence.";
    } else if (pSupport > 0.3 && pCounter > 0.3) {
      consensusState = "POLARIZED";
      recommendationNote = "Active tension between supporting and counter-evidence signals.";
    } else {
      consensusState = "HIGH_UNCERTAINTY";
      recommendationNote = "Diffuse evidence distribution requiring additional domain probing.";
    }

    return {
      entropy: Number(entropy.toFixed(3)),
      normalizedDisagreement,
      stanceBreakdown: {
        support: supportCount,
        counter: counterCount,
        neutral: neutralCount,
      },
      consensusState,
      recommendationNote,
    };
  }
}
