# Security and responsible AI

KnowledgeOps AI is designed as a portfolio-safe enterprise AI reference implementation. The public corpus is synthetic, the default path needs no paid or external LLM, and decision authority is deliberately kept outside model generation.

## Data and secrets

- Public data is synthetic only.
- No external LLM API is required by the mandatory path.
- `.env` is ignored and no secrets are committed.
- Local database/runtime artifacts are ignored.

## API validation

- FastAPI request models reject unknown fields (`extra='forbid'`).
- Question, thread-ID and edited-text fields are length bounded.
- Invalid approval decisions are rejected by schema validation.
- An edit decision requires explicit human-edited text.
- The interactive web API additionally rejects malformed JSON and oversized request bodies.

## Approval integrity

A normal deterministic query can create a **draft decision brief**, but an API caller cannot mark that brief approved by supplying an `approved=true` field. That field is not part of the public request contract and is rejected.

Approval is completed only through the stateful LangGraph flow:

1. `/v1/graph/query` creates or continues a thread.
2. A decision brief reaches a real LangGraph `interrupt()` and returns `approval_required`.
3. `/v1/graph/resume` accepts an explicit human `approve`, `edit` or `reject` decision for that thread.
4. `edit` replaces the draft answer with the human-edited text.
5. `reject` returns an explicit `rejected` status rather than being represented as successful approval.

These paths are exercised in GitHub Actions end-to-end tests.

## Retrieval and generation authority

- Retrieved source IDs and evidence remain authoritative for the public demo.
- Optional language generation is advisory.
- Model generation cannot mint citations, bypass retrieval or authorize a sourcing decision.
- Evidence gaps are represented explicitly rather than silently filled.

## Current production-security limitations

This is not a production enterprise security boundary. It does not yet implement SSO/RBAC, per-document ACL enforcement, tenant isolation, a managed secrets store, durable LangGraph checkpoints, enterprise audit retention, rate limiting, prompt-injection/document-poisoning defenses or authenticated ingestion connectors. Those controls belong in the documented production-hardening path before use with real enterprise data.
