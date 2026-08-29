import { ensureDatabase, getD1 } from "../../../db/runtime";
import { simulateDecision } from "../../../lib/engine";
import type { SimulationInput } from "../../../lib/types";

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function validInput(value: unknown): value is SimulationInput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SimulationInput>;
  return [candidate.adoption, candidate.priceDelta, candidate.capacity, candidate.retention].every(
    isFiniteNumber,
  );
}

export function normalizeDecisionId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= 80 ? normalized : undefined;
}

export function normalizeSeed(value: unknown): number {
  return typeof value === "number" && Number.isSafeInteger(value)
    ? value
    : Date.now() % 2_147_483_647;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      decisionId?: unknown;
      input?: unknown;
      seed?: unknown;
    };
    if (!validInput(body.input)) {
      return Response.json({ error: "A complete numeric simulation input is required." }, { status: 400 });
    }

    const seed = normalizeSeed(body.seed);
    const result = simulateDecision(body.input, seed);
    const decisionId = normalizeDecisionId(body.decisionId);

    if (decisionId) {
      await ensureDatabase();
      const database = getD1();
      await database
        .prepare(
          `INSERT INTO simulations
            (id, decision_id, seed, inputs_json, outputs_json, expected_value, downside_p95, success_probability)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          decisionId,
          seed,
          JSON.stringify(body.input),
          JSON.stringify(result),
          result.expectedValue,
          result.downsideP95,
          result.successProbability,
        )
        .run();
    }

    return Response.json({ result, seed });
  } catch {
    return Response.json({ error: "Simulation failed." }, { status: 500 });
  }
}
