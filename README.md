# KnowledgeOps AI — Enterprise Agentic RAG Platform

[![Python AI CI](https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag/actions/workflows/python-ci.yml/badge.svg)](https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag/actions/workflows/python-ci.yml)
[![Interactive Web CI](https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag/actions/workflows/web-ci.yml/badge.svg)](https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag/actions/workflows/web-ci.yml)
[![Production Smoke](https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag/actions/workflows/production-smoke.yml/badge.svg)](https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag/actions/workflows/production-smoke.yml)

> **From enterprise knowledge to evidence-backed decisions — with citations, explicit uncertainty and accountable human approval.**

### 🚀 [Open the verified live app →](https://knowledgeops-ai-enterprise-agentic-six.vercel.app/)

KnowledgeOps AI is an end-to-end **Agentic RAG and decision-intelligence reference platform** built around a synthetic industrial engineering and procurement scenario. It demonstrates how enterprise evidence can be ingested, retrieved, compared, traced and converted into human-reviewed decision briefs without treating an LLM as the source of truth or decision authority.

**Stack:** `Python` · `LangChain` · `LangGraph` · `FastAPI` · `Qdrant` · `BM25` · `Next.js` · `React` · `TypeScript` · `Docker` · `GitHub Actions` · `Vercel`

> All checked-in business data is synthetic and portfolio-safe. No employer, customer, supplier or confidential enterprise data is used.

---

## Why this project exists

Enterprise teams rarely lack information. They lack a reliable way to turn fragmented specifications, supplier submissions, commercial terms, policies, manuals, risk notes and revision-controlled documents into a decision that is both fast **and inspectable**.

A normal “chat with PDFs” demo can summarize content, but a business decision needs stronger controls:

- Was the right evidence retrieved?
- Which sources support the answer?
- What evidence is missing?
- Did a controlled revision change the conclusion?
- Can a model invent a citation or approve its own recommendation?
- Can a reviewer explicitly approve, edit or reject the result?

KnowledgeOps AI is built around those questions.

---

## What is live now

The public Vercel deployment is externally smoke-tested against the real production URL:

**https://knowledgeops-ai-enterprise-agentic-six.vercel.app/**

The live application currently runs the deliberately transparent **deterministic public mode**:

```text
Next.js
  → deterministic hybrid retrieval
  → evidence + citations
  → decision synthesis
  → explicit human approve / edit / reject
```

The external production test verifies:

- homepage availability;
- `/api/health` service contract;
- `/api/evaluation` with **60 cases** and `all_passed=true`;
- supplier comparison with retrieved evidence;
- decision-brief `approval_required` state;
- approve / edit / reject behavior;
- rejection of self-approval bypass attempts;
- rejection of malformed JSON and unknown fields;
- production deployment identity through the Vercel Git SHA.

The public app therefore is not just a static landing page: its retrieval, evidence and governance flows execute against the deployed production application.

---

## Runtime trust boundary

The project intentionally distinguishes two execution modes instead of making a stronger claim than the infrastructure supports.

| Mode | Execution path | State behavior | Status |
|---|---|---|---|
| **Deterministic public demo** | Next.js → TypeScript retrieval/workflow | Explicit approve/edit/reject; portfolio-safe stateless boundary | **Live on Vercel** |
| **Connected LangGraph** | Next.js → FastAPI → real LangGraph graph | Real `interrupt()` + exact `thread_id` resume | **Verified end to end in CI** |

The live UI labels the active runtime. When `KNOWLEDGEOPS_API_URL` is configured, the Next.js server bridge switches to the real FastAPI/LangGraph execution path and displays the evidence returned by Python graph state.

### Why the connected backend is not falsely presented as durable production state

The current LangGraph reference graph uses `InMemorySaver`. That is excellent for deterministic CI and local architecture verification, but it is **not a durable horizontally scaled production checkpointer**. A professionally hosted connected mode should move approval state to Postgres/Redis or another durable LangGraph-compatible checkpoint store before claiming persistent enterprise state.

That limitation is explicit by design.

See [`docs/deployment-modes.md`](docs/deployment-modes.md) and [`docs/interview-guide.md`](docs/interview-guide.md).

---

## End-to-end architecture

```text
Synthetic enterprise documents
        │
        ▼
LangChain ingestion / normalization
        │
        ├── document metadata
        ├── recursive chunking
        └── deterministic embeddings adapter
        │
        ▼
Hybrid retrieval
        ├── BM25 sparse retrieval
        ├── TF-IDF-style similarity baseline
        ├── metadata / revision / supplier boosts
        └── optional local Qdrant vector index
        │
        ▼
Reranked evidence set
        │
        ▼
LangGraph state machine
 classify → retrieve → synthesize → approval interrupt → complete
        │                                  │
        │                                  └── human approve / edit / reject
        ▼
Evidence-backed graph state
        ├── answer
        ├── citations
        ├── retrieved sources + scores
        ├── unsupported claims / gaps
        └── thread identity
        │
        ▼
Human-reviewed decision pack
```

The core design principle is:

> **Retrieval evidence is authoritative; optional model generation is advisory; accountable humans retain decision authority.**

---

## What the platform demonstrates

- grounded enterprise Q&A with source IDs and retrieval scores;
- supplier comparison across technical fit, price, lead time, warranty and resilience;
- cybersecurity and sourcing-risk review;
- evidence-gap detection instead of silent unsupported completion;
- revision A vs. revision B change analysis;
- structured sourcing decision briefs;
- real LangGraph `StateGraph` orchestration;
- real LangGraph `interrupt()` for human review;
- same-thread approve / edit / reject resume semantics in the connected path;
- deterministic zero-key public mode;
- local Qdrant vector queries with deterministic embeddings;
- optional local Ollama generation that cannot replace retrieval or approval authority;
- typed Next.js API contracts and privacy-safe structured request logging;
- reproducible CI across Python, TypeScript, FastAPI, Next.js, LangGraph, Qdrant and Docker;
- external Vercel production smoke verification.

---

## Evaluation and verified quality gates

The repository contains a **60-case synthetic goldset** across six intent families:

`QA` · `compare` · `risk` · `evidence gap` · `revision` · `decision brief`

### Python / backend

- **8/8 Python unit and governance tests**
- **60/60 intent-routing cases**
- **60/60 cases retrieving at least one expected source in top-6**
- **0.9514 mean expected-document recall@6**
- LangChain Runnable retrieval smoke
- deterministic embedding smoke
- actual local Qdrant vector query
- real LangGraph interrupt + same-thread approve/edit/reject
- FastAPI HTTP contracts
- self-approval bypass rejection
- Docker production image build

### Web / cross-stack

- strict TypeScript validation
- **8/8 TypeScript engine/bridge tests**
- Next.js production build
- public zero-key HTTP E2E
- connected **Next.js → FastAPI → LangGraph** E2E
- same-thread approve/edit/reject verification
- malformed JSON rejection
- unknown-field rejection
- oversized-request rejection
- external production smoke against the public Vercel URL

These are synthetic regression results for this repository, not claims of real-world procurement accuracy, legal compliance or production model quality.

See [`VERIFICATION.md`](VERIFICATION.md) and [`docs/evaluation.md`](docs/evaluation.md).

---

## Human-in-the-loop governance

Decision briefs are intentionally treated differently from ordinary questions.

A connected sourcing brief reaches the LangGraph approval node and returns `approval_required`. The normal query route cannot complete the decision by accepting an `approved=true` shortcut. The reviewer must explicitly resume the graph with one of three outcomes:

- **approve** — accept the evidence-backed draft;
- **edit** — replace the recommendation with human-edited text;
- **reject** — terminate the decision path with explicit rejected state.

The connected web bridge preserves `thread_id`, so the decision resumes the same interrupted graph execution rather than creating a new pre-approved answer.

---

## API surface

### FastAPI reference backend

- `GET /health`
- `POST /v1/query`
- `POST /v1/graph/query`
- `POST /v1/graph/resume`

### Next.js production application

- `GET /api/health`
- `GET /api/evaluation`
- `POST /api/query`
- `POST /api/approve`

The Next.js API validates payload size and shape, rejects unknown fields, preserves runtime mode and emits structured operational logs without logging the user's business question.

---

## Production observability behavior

API request logs contain only operational metadata such as:

```text
operation
runtime
intent
result_status
source_count
approval_required
http_status
duration_ms
deployment_sha
```

The query text itself is intentionally excluded from structured production logging.

The health endpoint also exposes the deployed Git SHA so post-deploy smoke tests can prove that the production alias actually reached the commit that passed CI.

---

## Production delivery pipeline

```text
feature branch
    ↓
Pull Request
    ↓
Python verification + Web verification
    ↓
Vercel preview deployment
    ↓
protected main merge
    ↓
Vercel production deployment
    ↓
Production Smoke waits for matching Git SHA
    ↓
real public HTTP verification
```

`main` is protected with required pull requests and required CI checks:

- **Python verification**
- **Web verification**

Force pushes and branch deletion are blocked.

---

## Repository structure

```text
.
├── api.py                         # FastAPI reference service
├── data/                          # synthetic enterprise corpus
├── evaluation/                    # 60-case goldset
├── frontend/
│   ├── app/                       # Next.js UI + API routes
│   ├── components/                # decision command center + evidence scene
│   ├── lib/
│   │   ├── contracts.ts           # typed shared API contracts
│   │   ├── engine.ts              # deterministic public workflow
│   │   ├── backend.ts             # optional FastAPI/LangGraph bridge
│   │   └── observability.ts       # structured privacy-safe logging
│   └── tests/                     # engine + bridge regression tests
├── src/knowledgeops/
│   ├── retrieval.py
│   ├── workflow.py
│   ├── langchain_components.py
│   ├── langchain_pipeline.py
│   ├── langgraph_runtime.py
│   ├── graph_service.py
│   ├── qdrant_store.py
│   └── observability.py
├── tests/
├── docs/
├── .github/workflows/
├── Dockerfile
├── docker-compose.yml
└── LICENSE
```

---

## Run locally

### Backend

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m unittest discover -s tests -p 'test_*.py' -v
python scripts/evaluate.py
uvicorn api:app --reload
```

FastAPI runs at `http://127.0.0.1:8000`.

### Frontend — deterministic zero-key mode

```bash
npm install
npm run typecheck
npm run test:web
npm run build
npm run start
```

### Frontend — connected LangGraph mode

Run FastAPI first, then:

```bash
export KNOWLEDGEOPS_API_URL=http://127.0.0.1:8000
npm run start
```

Windows PowerShell:

```powershell
$env:KNOWLEDGEOPS_API_URL="http://127.0.0.1:8000"
npm run start
```

---

## Current limitations

This is a portfolio-scale enterprise reference implementation, not a claim of production completeness.

- synthetic and intentionally small corpus;
- synthetic evaluation fixture rather than domain-expert production traffic;
- deterministic mandatory retrieval baseline;
- local Qdrant rather than managed multi-tenant infrastructure;
- Python LangGraph checkpointing currently in-memory;
- no enterprise SSO/RBAC or authenticated approver identity;
- no document ACL filtering or tenant isolation;
- no durable audit retention;
- no prompt-injection/document-poisoning defense layer yet;
- no real ERP, SharePoint, procurement or supplier system connection.

---

## Production-hardening path

A production evolution would add:

- persistent Postgres/Redis LangGraph checkpointing;
- authenticated ingestion and ACL-aware retrieval;
- managed Qdrant/pgvector with metadata filters;
- stronger embedding and reranking models;
- SharePoint/Confluence/Office ingestion jobs;
- prompt-injection and document-poisoning controls;
- OpenTelemetry/Langfuse traces, metrics and SLOs;
- domain-expert evaluation beyond the deterministic goldset;
- enterprise SSO, RBAC, approver identity and audit retention;
- rate limiting and managed secrets;
- typed MCP or enterprise-system integrations.

---

## Interview / CV / LinkedIn guide

For the design rationale, likely interview questions and ready-to-use portfolio wording, see:

### [`docs/interview-guide.md`](docs/interview-guide.md)

A concise CV version:

> **Built and deployed an enterprise Agentic RAG platform with LangGraph HITL governance, hybrid retrieval, FastAPI/Next.js, 60-case evaluation and externally verified production smoke tests.**

---

## Documentation

- [`VERIFICATION.md`](VERIFICATION.md) — checked claims and quality gates
- [`docs/architecture.md`](docs/architecture.md) — architecture and components
- [`docs/evaluation.md`](docs/evaluation.md) — evaluation methodology
- [`docs/deployment-modes.md`](docs/deployment-modes.md) — live vs. connected trust boundary
- [`docs/security.md`](docs/security.md) — security and responsible-AI boundaries
- [`docs/business-case.md`](docs/business-case.md) — business framing
- [`docs/interview-guide.md`](docs/interview-guide.md) — interview, CV and LinkedIn positioning

---

## Links

**Live app:** https://knowledgeops-ai-enterprise-agentic-six.vercel.app/  
**Source:** https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag  
**GitHub profile:** https://github.com/Samadritaacharya

MIT licensed.
