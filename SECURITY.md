# Security policy

## Reporting

Do not open a public issue for a suspected vulnerability. Report privately through GitHub Security Advisories for the repository owner.

## Current controls

- Prepared or parameterized SQL only.
- Bounded text input and finite-number validation at API boundaries.
- No secrets, API keys, or third-party model credentials in the client.
- SHA-256 integrity digest for decision commits.
- Same-origin API calls and no remote script dependencies.
- D1 binding accessed through a narrow database layer.
- Deterministic analytical engine with regression tests.
- Reduced-motion and keyboard-focus accessibility controls.

## Threat model

The research prototype assumes a single trusted workspace. Before multi-tenant use, add:

1. organization-scoped identity and authorization;
2. row-level ownership checks on every read and write;
3. rate limiting and request-body size enforcement at the edge;
4. CSRF protection for authenticated mutations;
5. immutable audit checkpoints backed by managed signing keys;
6. source-level access control propagation through retrieval;
7. document malware scanning and content-type verification for uploads;
8. prompt-injection isolation for any future LLM ingestion pipeline;
9. retention, deletion, export, and residency policies;
10. structured security logging with sensitive-field redaction.

## Data classification

The bundled evidence corpus is synthetic. Do not place confidential, regulated, or personal information into a public demo deployment.
