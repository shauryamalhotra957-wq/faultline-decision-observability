import { env } from "cloudflare:workers";

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    context TEXT NOT NULL DEFAULT '',
    owner TEXT NOT NULL DEFAULT 'Unassigned',
    domain TEXT NOT NULL DEFAULT 'Strategy',
    status TEXT NOT NULL DEFAULT 'watch',
    confidence INTEGER NOT NULL DEFAULT 50,
    recommendation TEXT NOT NULL DEFAULT '',
    decision_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS evidence (
    id TEXT PRIMARY KEY NOT NULL,
    decision_id TEXT REFERENCES decisions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    stance TEXT NOT NULL DEFAULT 'neutral',
    reliability INTEGER NOT NULL DEFAULT 50,
    tags_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS simulations (
    id TEXT PRIMARY KEY NOT NULL,
    decision_id TEXT REFERENCES decisions(id) ON DELETE CASCADE,
    seed INTEGER NOT NULL,
    inputs_json TEXT NOT NULL,
    outputs_json TEXT NOT NULL,
    expected_value REAL NOT NULL,
    downside_p95 REAL NOT NULL,
    success_probability REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS outcomes (
    id TEXT PRIMARY KEY NOT NULL,
    decision_id TEXT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    actual_outcome TEXT NOT NULL,
    brier_score REAL,
    notes TEXT NOT NULL DEFAULT '',
    recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  "CREATE INDEX IF NOT EXISTS decisions_created_at_idx ON decisions(created_at)",
  "CREATE INDEX IF NOT EXISTS evidence_decision_id_idx ON evidence(decision_id)",
  "CREATE INDEX IF NOT EXISTS simulations_decision_id_idx ON simulations(decision_id)",
  "CREATE INDEX IF NOT EXISTS outcomes_decision_id_idx ON outcomes(decision_id)",
] as const;

let initialized = false;

export function getD1() {
  if (!env.DB) {
    throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  }
  return env.DB;
}

export async function ensureDatabase() {
  if (initialized) return;
  const database = getD1();
  await database.batch(schemaStatements.map((statement) => database.prepare(statement)));
  initialized = true;
}
