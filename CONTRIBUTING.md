# Contributing

## Development loop

1. Create a focused branch.
2. Install exactly from the lockfile with `npm ci`.
3. Keep analytical behavior pure and deterministic where possible.
4. Add tests for every scoring, retrieval, or persistence change.
5. Run `npm test` and `npm run lint` before opening a pull request.
6. Generate and inspect a migration whenever `db/schema.ts` changes.

## Product invariants

- Never display confidence without exposing its evidence basis.
- Never generate a citation that does not exist in the retrieved corpus.
- Never silently rewrite a committed belief state.
- Never make a stochastic analytical result unreproducible.
- Never collapse a dissenting or contradictory source into false consensus.

## Pull requests

Explain what changed, why the product needs it, user or developer impact, and the checks performed. Changes to the analytical engine should include fixed-seed regression coverage.
