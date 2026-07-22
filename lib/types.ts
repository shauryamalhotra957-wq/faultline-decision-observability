export type DecisionStatus = "watch" | "critical" | "stable" | "committed";

export type EvidenceStance = "supports" | "challenges" | "neutral";

export interface DecisionSignal {
  id: string;
  title: string;
  owner: string;
  domain: string;
  status: DecisionStatus;
  tension: number;
  evidenceCoverage: number;
  confidence: number;
  drift: number;
  due: string;
  summary: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  source: string;
  excerpt: string;
  tags: string[];
  stance: EvidenceStance;
  reliability: number;
  publishedAt: string;
}

export interface SimulationInput {
  adoption: number;
  priceDelta: number;
  capacity: number;
  retention: number;
}

export interface SimulationResult {
  expectedValue: number;
  downsideP95: number;
  successProbability: number;
  volatility: number;
  confidence: number;
  distribution: number[];
  recommendation: string;
  primaryRisk: string;
}

export interface RetrievalResult extends EvidenceItem {
  score: number;
  matchReason: string;
}
