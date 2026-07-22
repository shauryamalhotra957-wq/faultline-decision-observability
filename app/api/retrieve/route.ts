import { evidenceCorpus } from "../../../lib/demo-data";
import { rankEvidence } from "../../../lib/engine";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: string };
    const query = body.query?.trim().slice(0, 240) ?? "";
    if (query.length < 2) {
      return Response.json({ error: "Query must contain at least two characters." }, { status: 400 });
    }

    return Response.json({
      results: rankEvidence(query, evidenceCorpus),
      meta: {
        method: "hybrid lexical + semantic expansion + reliability rerank",
        corpusSize: evidenceCorpus.length,
      },
    });
  } catch {
    return Response.json({ error: "Evidence retrieval failed." }, { status: 500 });
  }
}
