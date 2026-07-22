import type {
  EvidenceItem,
  RetrievalResult,
  SimulationInput,
  SimulationResult,
} from "./types";

const semanticGroups = [
  ["revenue", "arr", "sales", "pipeline", "pricing", "price", "margin"],
  ["security", "compliance", "residency", "privacy", "audit", "dpa"],
  ["customer", "retention", "churn", "csat", "onboarding", "buyer"],
  ["platform", "inference", "latency", "vendor", "cost", "capacity"],
  ["launch", "rollout", "release", "timing", "q4", "readiness"],
  ["automation", "support", "deflection", "escalation", "operations"],
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function expandTerms(tokens: string[]) {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    const group = semanticGroups.find((candidate) => candidate.includes(token));
    group?.forEach((term) => expanded.add(term));
  }
  return expanded;
}

export function rankEvidence(
  query: string,
  corpus: EvidenceItem[],
  limit = 4,
): RetrievalResult[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const expanded = expandTerms(queryTokens);
  return corpus
    .map((item) => {
      const titleTokens = tokenize(item.title);
      const excerptTokens = tokenize(item.excerpt);
      const tagTokens = item.tags.map((tag) => tag.toLowerCase());
      const exactTitle = titleTokens.filter((token) => queryTokens.includes(token)).length;
      const exactTags = tagTokens.filter((token) => queryTokens.includes(token)).length;
      const semanticTags = tagTokens.filter((token) => expanded.has(token)).length;
      const semanticBody = excerptTokens.filter((token) => expanded.has(token)).length;
      const freshness = clamp(
        1 -
          (Date.parse("2026-07-22") - Date.parse(item.publishedAt)) /
            (1000 * 60 * 60 * 24 * 180),
        0,
        1,
      );
      const score =
        exactTitle * 4.2 +
        exactTags * 3.6 +
        semanticTags * 1.8 +
        Math.min(semanticBody, 7) * 0.65 +
        (item.reliability / 100) * 1.5 +
        freshness * 0.7;

      const reason = exactTags
        ? `${exactTags} exact tag match${exactTags > 1 ? "es" : ""}`
        : semanticTags
          ? `${semanticTags} semantic signal${semanticTags > 1 ? "s" : ""}`
          : "body relevance";

      return { ...item, score: Number(score.toFixed(2)), matchReason: reason };
    })
    .filter((item) => item.score > 2.2)
    .sort((a, b) => b.score - a.score || b.reliability - a.reliability)
    .slice(0, limit);
}

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(random: () => number) {
  const first = Math.max(random(), Number.EPSILON);
  const second = random();
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}

function percentile(values: number[], quantile: number) {
  const index = Math.floor((values.length - 1) * quantile);
  return values[index];
}

export function simulateDecision(
  input: SimulationInput,
  seed = 71071,
  iterations = 5000,
): SimulationResult {
  const safeInput = {
    adoption: clamp(input.adoption, 0, 100),
    priceDelta: clamp(input.priceDelta, -30, 40),
    capacity: clamp(input.capacity, 40, 160),
    retention: clamp(input.retention, 60, 100),
  };
  const random = mulberry32(seed);
  const outcomes: number[] = [];

  for (let index = 0; index < Math.max(500, iterations); index += 1) {
    const demandShock = gaussian(random) * 0.11;
    const executionShock = gaussian(random) * 0.075;
    const priceElasticity = 0.42 + random() * 0.38;
    const adoptionFactor = safeInput.adoption / 100 + demandShock;
    const retentionFactor = safeInput.retention / 100 + gaussian(random) * 0.025;
    const capacityPenalty = Math.max(0, adoptionFactor * 125 - safeInput.capacity) * 0.018;
    const priceEffect = (safeInput.priceDelta / 100) * (1 - priceElasticity);
    const expansion = 0.56 * adoptionFactor + priceEffect - capacityPenalty;
    const revenue = 18.4 * (1 + expansion) * retentionFactor;
    const operatingCost =
      8.9 + safeInput.capacity * 0.024 + Math.max(0, adoptionFactor - 0.65) * 2.8;
    const riskCost = Math.max(0, 0.88 - retentionFactor) * 12 + Math.abs(executionShock) * 3.4;
    outcomes.push(revenue - operatingCost - riskCost + executionShock * 7.5);
  }

  outcomes.sort((a, b) => a - b);
  const expectedValue = outcomes.reduce((sum, value) => sum + value, 0) / outcomes.length;
  const variance =
    outcomes.reduce((sum, value) => sum + (value - expectedValue) ** 2, 0) /
    outcomes.length;
  const minimum = outcomes[0];
  const maximum = outcomes[outcomes.length - 1];
  const bucketCount = 24;
  const distribution = Array.from({ length: bucketCount }, () => 0);
  for (const outcome of outcomes) {
    const position = clamp(
      Math.floor(((outcome - minimum) / Math.max(maximum - minimum, 0.001)) * bucketCount),
      0,
      bucketCount - 1,
    );
    distribution[position] += 1;
  }
  const peak = Math.max(...distribution);
  const normalizedDistribution = distribution.map((value) =>
    Math.round((value / peak) * 100),
  );
  const successThreshold = 8.6;
  const successProbability =
    (outcomes.filter((outcome) => outcome >= successThreshold).length / outcomes.length) * 100;
  const downsideP95 = percentile(outcomes, 0.05);
  const volatility = Math.sqrt(variance);
  const confidence = clamp(
    96 - volatility * 4.6 - Math.max(0, 75 - safeInput.retention) * 0.4,
    42,
    94,
  );

  const capacityRisk = safeInput.capacity < safeInput.adoption * 1.05;
  const retentionRisk = safeInput.retention < 84;
  const recommendation =
    successProbability >= 72 && downsideP95 >= 5
      ? "Advance with a staged release and a pre-committed rollback gate."
      : successProbability >= 55
        ? "Run a limited cohort; buy evidence before committing the full rollout."
        : "Do not commit. Reduce exposure and resolve the dominant assumption first.";

  return {
    expectedValue: Number(expectedValue.toFixed(2)),
    downsideP95: Number(downsideP95.toFixed(2)),
    successProbability: Number(successProbability.toFixed(1)),
    volatility: Number(volatility.toFixed(2)),
    confidence: Number(confidence.toFixed(1)),
    distribution: normalizedDistribution,
    recommendation,
    primaryRisk: capacityRisk
      ? "Capacity becomes binding before demand reaches the base case."
      : retentionRisk
        ? "Retention uncertainty dominates the downside tail."
        : "Regulatory timing is the largest unpriced externality.",
  };
}

export function computeFaultlineScore({
  contradiction,
  impact,
  evidenceCoverage,
  drift,
}: {
  contradiction: number;
  impact: number;
  evidenceCoverage: number;
  drift: number;
}) {
  const uncertainty = 100 - clamp(evidenceCoverage, 0, 100);
  const score =
    clamp(contradiction, 0, 100) * 0.42 +
    clamp(impact, 0, 100) * 0.32 +
    uncertainty * 0.16 +
    clamp(drift, 0, 100) * 0.1;
  return Math.round(clamp(score, 0, 100));
}

export function calculateBrierScore(probability: number, outcome: 0 | 1) {
  const normalized = clamp(probability, 0, 100) / 100;
  return Number(((normalized - outcome) ** 2).toFixed(4));
}
