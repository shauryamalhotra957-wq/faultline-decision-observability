import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensureDatabase } from "../../../db/runtime";
import { decisions } from "../../../db/schema";

function clean(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function GET() {
  try {
    await ensureDatabase();
    const rows = await getDb().select().from(decisions).orderBy(desc(decisions.createdAt)).limit(50);
    return Response.json({ decisions: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read decisions.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const title = clean(body.title, 160);
    const context = clean(body.context, 2000);
    const owner = clean(body.owner, 80) || "Unassigned";
    const domain = clean(body.domain, 60) || "Strategy";
    const confidence = Math.max(1, Math.min(99, Number(body.confidence) || 50));
    if (title.length < 4) {
      return Response.json({ error: "Decision title must contain at least four characters." }, { status: 400 });
    }

    const id = `FLT-${Math.floor(100 + Math.random() * 900)}`;
    const createdAt = new Date().toISOString();
    const decisionHash = await digest(`${id}|${title}|${context}|${owner}|${createdAt}`);
    await ensureDatabase();
    const [decision] = await getDb()
      .insert(decisions)
      .values({
        id,
        title,
        context,
        owner,
        domain,
        confidence,
        status: "committed",
        recommendation: "Pending fault scan",
        decisionHash,
        createdAt,
      })
      .returning();

    return Response.json({ decision }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to commit decision.";
    return Response.json({ error: message }, { status: 500 });
  }
}
