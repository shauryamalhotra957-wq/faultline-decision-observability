import { ensureDatabase, getD1 } from "../../../db/runtime";
import { simulateDecision } from "../../../lib/engine";
import type { SimulationInput } from "../../../lib/types";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validInput(value: unknown): value is SimulationInput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SimulationInput>;
  return [candidate.adoption, candidate.priceDelta, candidate.capacity, candidate.retention].every(
    isFiniteNumber,
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      decisionId?: string;
      input?: unknown;
      seed?: number;
    };
    if (!validInput(body.input)) {
      return Response.json({ error: "A complete numeric simulation input is required." }, { status: 400 });
    }

    const seed = Number.isInteger(body.seed) ? Number(body.seed) : Date.now() % 2_147_483_647;
    const result = simulateDecision(body.input, seed);

    if (body.decisionId) {
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
          body.decisionId.slice(0, 80),
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Simulation failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
