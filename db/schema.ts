import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const decisions = sqliteTable(
  "decisions",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    context: text("context").notNull().default(""),
    owner: text("owner").notNull().default("Unassigned"),
    domain: text("domain").notNull().default("Strategy"),
    status: text("status").notNull().default("watch"),
    confidence: integer("confidence").notNull().default(50),
    recommendation: text("recommendation").notNull().default(""),
    decisionHash: text("decision_hash").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("decisions_created_at_idx").on(table.createdAt)],
);

export const evidence = sqliteTable(
  "evidence",
  {
    id: text("id").primaryKey(),
    decisionId: text("decision_id").references(() => decisions.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    source: text("source").notNull(),
    excerpt: text("excerpt").notNull(),
    stance: text("stance").notNull().default("neutral"),
    reliability: integer("reliability").notNull().default(50),
    tagsJson: text("tags_json").notNull().default("[]"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("evidence_decision_id_idx").on(table.decisionId)],
);

export const simulations = sqliteTable(
  "simulations",
  {
    id: text("id").primaryKey(),
    decisionId: text("decision_id").references(() => decisions.id, {
      onDelete: "cascade",
    }),
    seed: integer("seed").notNull(),
    inputsJson: text("inputs_json").notNull(),
    outputsJson: text("outputs_json").notNull(),
    expectedValue: real("expected_value").notNull(),
    downsideP95: real("downside_p95").notNull(),
    successProbability: real("success_probability").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("simulations_decision_id_idx").on(table.decisionId)],
);

export const outcomes = sqliteTable(
  "outcomes",
  {
    id: text("id").primaryKey(),
    decisionId: text("decision_id")
      .notNull()
      .references(() => decisions.id, { onDelete: "cascade" }),
    actualOutcome: text("actual_outcome").notNull(),
    brierScore: real("brier_score"),
    notes: text("notes").notNull().default(""),
    recordedAt: text("recorded_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("outcomes_decision_id_idx").on(table.decisionId)],
);
