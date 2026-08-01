import assert from "node:assert/strict";
import test from "node:test";
import { GET as listDecisions, POST as createDecision } from "../app/api/decisions/route.ts";
import { POST as retrieveEvidence } from "../app/api/retrieve/route.ts";
import { POST as simulate } from "../app/api/simulate/route.ts";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function malformedRequest() {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  });
}

async function payload(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

test("simulation rejects incomplete inputs before touching persistence", async () => {
  const response = await simulate(
    jsonRequest({ input: { adoption: 65, capacity: 80, retention: 90 }, seed: 7 }),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await payload(response), {
    error: "A complete numeric simulation input is required.",
  });
});

test("simulation returns a deterministic response for an explicit seed", async () => {
  const response = await simulate(
    jsonRequest({
      input: { adoption: 65, priceDelta: 8, capacity: 80, retention: 90 },
      seed: 9917,
    }),
  );
  const body = await payload(response);

  assert.equal(response.status, 200);
  assert.equal(body.seed, 9917);
  assert.equal(typeof body.result, "object");
});

test("simulation reports malformed JSON as a server error", async () => {
  const response = await simulate(malformedRequest());
  const body = await payload(response);

  assert.equal(response.status, 500);
  assert.equal(typeof body.error, "string");
});

test("retrieval rejects short queries and ranks valid ones", async () => {
  const invalid = await retrieveEvidence(jsonRequest({ query: " x " }));
  assert.equal(invalid.status, 400);

  const valid = await retrieveEvidence(jsonRequest({ query: "European privacy launch risk" }));
  const body = await payload(valid);
  const results = body.results as unknown[];
  const meta = body.meta as Record<string, unknown>;

  assert.equal(valid.status, 200);
  assert.ok(results.length > 0);
  assert.equal(typeof meta.corpusSize, "number");
});

test("retrieval returns its stable error contract for malformed JSON", async () => {
  const response = await retrieveEvidence(malformedRequest());

  assert.equal(response.status, 500);
  assert.deepEqual(await payload(response), { error: "Evidence retrieval failed." });
});

test("decision creation validates titles before accessing the database", async () => {
  const response = await createDecision(jsonRequest({ title: " no " }));

  assert.equal(response.status, 400);
  assert.deepEqual(await payload(response), {
    error: "Decision title must contain at least four characters.",
  });
});

test("decision routes expose persistence failures as JSON errors", async () => {
  const listResponse = await listDecisions();
  const createResponse = await createDecision(
    jsonRequest({ title: "Launch in Europe", context: "Assess regulatory exposure" }),
  );

  assert.equal(listResponse.status, 500);
  assert.match(String((await payload(listResponse)).error), /D1 binding/i);
  assert.equal(createResponse.status, 500);
  assert.match(String((await payload(createResponse)).error), /D1 binding/i);
});
