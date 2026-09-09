# Security and responsible AI

- Public data is synthetic only.
- No external LLM API is required.
- Request payloads are size-limited and schema-validated in the public API.
- Unknown fields are rejected.
- Decision briefs require explicit human approval.
- Optional model generation is advisory; it cannot mint citations or authorize a sourcing decision.
- The repository contains no secrets and `.env` is ignored.
