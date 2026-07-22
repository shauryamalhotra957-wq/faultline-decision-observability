import type { DecisionSignal, EvidenceItem } from "./types";

export const decisionSignals: DecisionSignal[] = [
  {
    id: "FLT-071",
    title: "Enterprise launch in EMEA",
    owner: "Maya Chen",
    domain: "Market",
    status: "critical",
    tension: 92,
    evidenceCoverage: 64,
    confidence: 78,
    drift: 18,
    due: "48h",
    summary:
      "The board plan assumes a Q4 launch, while security and localization evidence imply a six-week certification gap.",
  },
  {
    id: "FLT-068",
    title: "Usage-based pricing migration",
    owner: "Jon Bell",
    domain: "Revenue",
    status: "watch",
    tension: 74,
    evidenceCoverage: 81,
    confidence: 69,
    drift: 11,
    due: "6d",
    summary:
      "Expansion upside is strong, but the model understates procurement friction among regulated accounts.",
  },
  {
    id: "FLT-054",
    title: "Inference vendor consolidation",
    owner: "Ira Nwosu",
    domain: "Platform",
    status: "stable",
    tension: 31,
    evidenceCoverage: 93,
    confidence: 86,
    drift: -4,
    due: "14d",
    summary:
      "Latency and cost evidence converge on a dual-vendor strategy with a controlled 30-day migration window.",
  },
  {
    id: "FLT-049",
    title: "Support automation threshold",
    owner: "Leah Kim",
    domain: "Operations",
    status: "watch",
    tension: 61,
    evidenceCoverage: 72,
    confidence: 73,
    drift: 7,
    due: "9d",
    summary:
      "Deflection targets conflict with the customer promise for high-touch enterprise onboarding.",
  },
];

export const evidenceCorpus: EvidenceItem[] = [
  {
    id: "EV-204",
    title: "EU launch readiness review",
    source: "Security Council / memo",
    excerpt:
      "SOC 2 controls cover the core platform, but German data residency and sector-specific DPA language remain outside the signed scope.",
    tags: ["security", "emea", "compliance", "launch"],
    stance: "challenges",
    reliability: 96,
    publishedAt: "2026-07-18",
  },
  {
    id: "EV-199",
    title: "EMEA design-partner pipeline",
    source: "CRM / verified snapshot",
    excerpt:
      "Eleven design partners represent $2.8M potential ARR; seven require EU-only processing before production procurement can begin.",
    tags: ["revenue", "emea", "pipeline", "residency"],
    stance: "neutral",
    reliability: 91,
    publishedAt: "2026-07-20",
  },
  {
    id: "EV-187",
    title: "Pricing elasticity cohort study",
    source: "Data Science / model card",
    excerpt:
      "Usage pricing increased expansion revenue in mid-market cohorts, while predictability-sensitive enterprise accounts showed elevated downgrade intent.",
    tags: ["pricing", "revenue", "retention", "enterprise"],
    stance: "challenges",
    reliability: 88,
    publishedAt: "2026-07-11",
  },
  {
    id: "EV-176",
    title: "Inference cost benchmark — v6",
    source: "Platform / benchmark",
    excerpt:
      "A dual-vendor routing policy reduced blended inference cost 23% while holding p95 latency within the enterprise SLO.",
    tags: ["platform", "inference", "cost", "vendor", "latency"],
    stance: "supports",
    reliability: 94,
    publishedAt: "2026-07-08",
  },
  {
    id: "EV-163",
    title: "Customer trust interview synthesis",
    source: "Research / 28 interviews",
    excerpt:
      "Buyers treat response quality as table stakes. Auditability, data boundaries, and named human ownership drive final security approval.",
    tags: ["customer", "trust", "security", "enterprise", "audit"],
    stance: "supports",
    reliability: 84,
    publishedAt: "2026-06-29",
  },
  {
    id: "EV-155",
    title: "Support deflection experiment",
    source: "Operations / experiment",
    excerpt:
      "Automation resolved 62% of tier-one tickets, but accounts in their first 45 days experienced a 9-point CSAT decline without a human escalation path.",
    tags: ["support", "automation", "customer", "retention", "onboarding"],
    stance: "challenges",
    reliability: 90,
    publishedAt: "2026-06-22",
  },
];

export const contradictionEdges = [
  { from: "Q4 BOARD PLAN", to: "RESIDENCY GAP", severity: 94, label: "timing conflict" },
  { from: "PRICE EXPANSION", to: "PROCUREMENT", severity: 72, label: "model omission" },
  { from: "AUTO-RESOLVE", to: "HIGH-TOUCH", severity: 61, label: "promise conflict" },
  { from: "SINGLE VENDOR", to: "RESILIENCE", severity: 38, label: "mitigated" },
];
