# KnowledgeOps AI — Enterprise Agentic RAG Platform

[![Python AI CI](https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag/actions/workflows/python-ci.yml/badge.svg)](https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag/actions/workflows/python-ci.yml)
[![Interactive Web CI](https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag/actions/workflows/web-ci.yml/badge.svg)](https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag/actions/workflows/web-ci.yml)

> **From enterprise knowledge to evidence-backed decisions — with citations, explicit uncertainty and accountable human approval.**

KnowledgeOps AI is an end-to-end **Agentic RAG and decision-intelligence reference platform** built around a synthetic industrial engineering and procurement scenario. It demonstrates how enterprise documents can be ingested, retrieved, compared, traced and converted into human-reviewed decision briefs without treating an LLM as the source of truth or decision authority.

The project combines **LangChain, LangGraph, hybrid retrieval, Qdrant local mode, FastAPI, Pydantic, Next.js, React, TypeScript, Docker and GitHub Actions**. The mandatory path requires **no paid model API**.

> All checked-in business data is synthetic. This repository demonstrates architecture, engineering practice, evaluation and governance patterns; it does not claim deployment inside a real employer or customer environment.

## Why this project exists

Enterprise teams rarely lack information. They lack a reliable way to turn fragmented specifications, supplier submissions, commercial terms, policies, manuals, risk notes and revision-controlled documents into a decision that is both fast **and inspectable**.

A normal “chat with PDFs” demo can summarize documents, but a business decision needs stronger controls:

- Was the right evidence retrieved?
- Which sources support the answer?
- What evidence is missing?
- Did a controlled revision change the answer?
- Can a model invent a citation or approve its own recommendation?
- Can a reviewer inspect and explicitly approve, edit or reject the result?

KnowledgeOps AI is built around those questions.

The demo scenario evaluates two synthetic industrial gateway suppliers against engineering, commercial, cybersecurity, sustainability and sourcing-governance requirements.

## What the platform demonstrates

- Grounded enterprise Q&A with source IDs and retrieval scores.
- Supplier comparison across technical fit, price, lead time, warranty and resilience.
- Cybersecurity, sourcing and evidence-risk review.
- Evidence-gap detection instead of silent unsupported completion.
- Revision A vs. revision B change analysis.
- Structured sourcing decision briefs.
- A real stateful LangGraph `interrupt()` before a decision brief can complete.
- Same-thread human **approve / edit / reject** resume semantics.
- Retrieved evidence, citations, unsupported claims and orchestration trace returned to the UI.
- A deterministic zero-key public-demo path and an optional connected FastAPI/LangGraph path.
- Local Qdrant vector search with deterministic embeddings for reproducible testing.
- Optional local Ollama generation that cannot replace retrieval or approval authority.
- Reproducible CI across Python, TypeScript, FastAPI, Next.js, LangGraph, Qdrant and Docker.

## Two explicit runtime modes

The web application intentionally supports two modes rather than pretending a free static/public demo has the same trust properties as a stateful backend.

| Mode | Execution path | Human decision behavior | Purpose |
|---|---|---|---|
| **Deterministic public demo** | Next.js → checked-in TypeScript retrieval/workflow | Explicit approve/edit/reject interaction; stateless portfolio boundary | Always-usable zero-key demo |
| **Connected LangGraph** | Next.js → FastAPI → real LangGraph graph | Resumes the exact interrupted `thread_id` for approve/edit/reject | Stateful HITL reference path |

Set `KNOWLEDGEOPS_API_URL` on the Next.js server to activate connected mode. The UI labels the active runtime, and connected responses display the **actual evidence returned by the Python graph state** rather than silently substituting a second frontend retrieval set.

See [`docs/deployment-modes.md`](docs/deployment-modes.md) for the trust boundary and deployment model.

### Public deployment status

The frontend is deployment-ready, but this repository does **not** currently assert a public production URL that has not been independently verified. A verified deployment URL should be added here only after the hosted app and its API routes pass an external smoke test.

## End-to-end architecture

```text
Synthetic enterprise documents
        │
        ▼
LangChain ingestion / normalization
        │
        ├── Documents + metadata
        ├── recursive chunking
        └── deterministic embeddings adapter
        │
        ▼
Hybrid retrieval
        ├── TF-IDF-style cosine similarity baseline
        ├── BM25 sparse retrieval
        ├── metadata/tag boosts
        └── optional Qdrant local vector index
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
        ├── retrieved source objects + scores
        ├── unsupported claims / gaps
        └── thread identity
        │
        ▼
Human-reviewed decision pack
```

The design deliberately separates **retrieval authority** from **language generation**. Optional model generation can improve phrasing, but it cannot mint source IDs, bypass retrieval or authorize a sourcing recommendation.

## Agentic workflow

The Python reference implementation uses a stateful LangGraph `StateGraph` with four main nodes:

1. **classify** — routes the request to QA, comparison, risk, evidence-gap, revision or decision-brief behavior.
2. **retrieve** — performs deterministic hybrid search and stores both source IDs and serialized evidence in graph state.
3. **synthesize** — creates an evidence-backed response from retrieved sources.
4. **approval** — uses a real LangGraph `interrupt()` for decision briefs and waits for a human resume command.

The graph is compiled with a checkpoint saver. A decision brief therefore pauses in graph execution; the connected web path preserves its `thread_id` and resumes that same graph for `approve`, `edit` or `reject`.

The current reference checkpointer is in-memory and intentionally documented as a production gap. Persistent approval state belongs in Postgres/Redis or another durable checkpoint store before real enterprise use.

## Retrieval design

The mandatory baseline is deterministic and reproducible:

- lexical tokenization and metadata-aware indexing
- TF-IDF-style cosine similarity
- BM25 sparse scoring
- supplier/revision/tag boosts
- deterministic ordering and retrieval fingerprints

A local Qdrant adapter provides a real vector-store integration path. It uses deterministic hash embeddings so CI can execute actual vector queries without an external embedding provider. The adapter can be replaced with another LangChain `Embeddings` implementation for experiments.

## Synthetic enterprise corpus

The checked-in corpus includes:

- supplier Alpha specification
- supplier Beta specification
- commercial terms for both suppliers
- 2026 gateway engineering requirements
- cybersecurity policy
- sustainability guidance
- supply-risk material
- sourcing decision governance
- gateway operating manual
- revision A and revision B of a controlled technical specification

This supports cross-document retrieval, contradiction/revision analysis, evidence completeness and sourcing decisions rather than only single-document Q&A.

## Human-in-the-loop governance

Decision briefs are treated differently from ordinary questions.

A connected sourcing brief reaches LangGraph's approval node and returns `approval_required`. The UI cannot complete it by sending an `approved=true` field through the normal query route. The reviewer must explicitly resume the same graph thread with one of three outcomes:

- **approve** — accept the evidence-backed draft;
- **edit** — replace the draft recommendation with human-edited text and complete the thread;
- **reject** — terminate the decision path with explicit `rejected` status.

This enforces the project rule:

> **Language generation may advise; retrieved evidence and accountable humans retain authority.**

## API surface

### Python / FastAPI reference backend

- `GET /health` — service status and policy metadata
- `POST /v1/query` — deterministic evidence-backed query
- `POST /v1/graph/query` — start a real stateful LangGraph execution
- `POST /v1/graph/resume` — resume an interrupted graph after approve/edit/reject

### Next.js application

- `GET /api/health`
- `GET /api/evaluation`
- `POST /api/query`
- `POST /api/approve`

The Next.js routes reject malformed JSON, unknown fields and oversized requests. In connected mode they act as a server-side bridge to FastAPI and preserve graph thread identity.

## Interactive web experience

The Next.js command center is an application rather than only a landing page. It includes:

- preset business questions
- supplier comparison and risk analysis
- retrieved-source cards with scores
- citations and evidence-gap visibility
- runtime-mode visibility
- decision-brief approve/edit/reject controls
- orchestration trace inspection
- session run history
- an animated evidence network built with React Three Fiber
- Motion-based interactions and reduced-motion/WebGL fallback behavior

## Evaluation and verified quality gates

The repository contains a **60-case synthetic goldset** across six intent families:

`QA` · `compare` · `risk` · `evidence gap` · `revision` · `decision brief`

Clean GitHub runners verify:

### Python / backend

- **8/8 Python unit/governance tests**
- **60/60 intent-routing cases**
- **60/60 cases retrieving at least one expected source in top-6**
- **0.9514 mean expected-document recall@6**
- LangChain Runnable retrieval and document-splitting smoke
- deterministic embedding smoke
- actual local Qdrant vector query
- real LangGraph interrupt + same-thread approve/edit/reject
- backend evidence hydration in graph state
- FastAPI production startup and HTTP contracts
- self-approval bypass rejection
- Docker production image build

### Web / cross-stack

- strict TypeScript validation
- **8/8 TypeScript tests**: 5 deterministic engine tests + 3 connected-backend bridge tests
- Next.js production build
- public zero-key HTTP smoke including approve/edit/reject
- connected **Next.js → FastAPI → LangGraph** HTTP E2E
- same-thread connected approve/edit/reject verification
- malformed JSON rejection
- unknown-field rejection
- oversized-request rejection

These are synthetic regression/evaluation results for this repository, not claims of real-world procurement accuracy, legal compliance or production model quality.

See [`VERIFICATION.md`](VERIFICATION.md) and [`docs/evaluation.md`](docs/evaluation.md).

## Repository structure

```text
.
├── api.py                         # FastAPI reference service
├── data/
│   ├── corpus.json                # normalized synthetic corpus
│   └── documents/                 # source-controlled enterprise documents
├── evaluation/
│   ├── goldset.json               # 60 synthetic evaluation cases
│   └── ragas_optional.py          # optional evaluation extension
├── frontend/
│   ├── app/                       # Next.js routes + UI
│   ├── components/                # command center + evidence scene
│   ├── lib/
│   │   ├── engine.ts              # deterministic public workflow
│   │   └── backend.ts             # optional FastAPI/LangGraph bridge
│   └── tests/                     # engine + bridge regression tests
├── src/knowledgeops/
│   ├── retrieval.py               # hybrid retrieval baseline
│   ├── workflow.py                # deterministic decision workflow
│   ├── langchain_components.py    # LangChain Runnable composition
│   ├── langchain_pipeline.py      # Documents/chunking/embeddings
│   ├── langgraph_runtime.py       # real interrupt/resume state graph
│   ├── graph_service.py           # stateful graph service wrapper
│   ├── qdrant_store.py            # local Qdrant adapter
│   └── observability.py           # optional observability hooks
├── tests/                         # Python tests
├── docs/                          # architecture/evaluation/security/deployment docs
├── .github/
│   ├── workflows/                 # protection-ready Python + Web CI
│   └── dependabot.yml             # weekly dependency maintenance
├── Dockerfile
├── docker-compose.yml
└── LICENSE                        # MIT
```

## Technology stack

**AI / retrieval**  
`LangChain` · `LangGraph` · `Qdrant` · `BM25` · `hybrid retrieval` · `deterministic embeddings` · `optional Ollama`

**Backend**  
`Python 3.13` · `FastAPI` · `Pydantic` · `Uvicorn`

**Frontend**  
`Next.js 16` · `React 19` · `TypeScript` · `Motion` · `React Three Fiber` · `Three.js`

**Engineering**  
`Docker` · `GitHub Actions` · `CI/CD` · `Dependabot` · `synthetic evaluation` · `HTTP E2E testing`

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

### Frontend — zero-key mode

```bash
npm install
npm run typecheck
npm run test:web
npm run build
npm run start
```

The web app runs at `http://localhost:3000` and uses the deterministic public-demo workflow when no backend URL is configured.

### Frontend — connected LangGraph mode

Run FastAPI first, then start Next.js with:

```bash
export KNOWLEDGEOPS_API_URL=http://127.0.0.1:8000
npm run start
```

On Windows PowerShell:

```powershell
$env:KNOWLEDGEOPS_API_URL="http://127.0.0.1:8000"
npm run start
```

The Next.js API now forwards graph queries and human decisions to the real FastAPI/LangGraph runtime.

### Docker

```bash
docker build -t knowledgeops-ai .
docker run --rm -p 8000:8000 knowledgeops-ai
```

Or:

```bash
docker compose up --build
```

## Optional local LLM

The mandatory project path does not require any external model API.

```bash
ollama pull qwen2.5:3b
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=qwen2.5:3b
```

The local model remains advisory and does not replace retrieval or human approval.

## Security and responsible-AI boundaries

- public corpus is synthetic only
- `.env` and local runtime artifacts are ignored
- no paid/external LLM is required
- request schemas use bounded fields and reject unknown fields
- decision briefs require explicit human action
- connected web approval preserves LangGraph thread identity
- model generation cannot create authoritative citations or authorize a final decision
- CI exercises query validation and approve/edit/reject boundaries

See [`docs/security.md`](docs/security.md).

## Current limitations

This is a portfolio-scale enterprise reference implementation, not a claim of production completeness.

- the default corpus is synthetic and small
- retrieval quality is measured on a synthetic regression fixture, not domain-expert production traffic
- the mandatory retrieval baseline is deterministic rather than a production embedding/reranking stack
- Qdrant is local rather than managed multi-tenant infrastructure
- LangGraph checkpointing is in-memory
- the default public web mode is deliberately stateless
- no SSO/RBAC, authenticated approver identity, document ACL filtering or tenant isolation
- no managed secrets store, production rate limiting or durable audit retention
- prompt-injection/document-poisoning defenses are not yet implemented
- no real procurement, ERP, SharePoint or supplier system is connected
- no verified public deployment URL is currently asserted in this README

Those boundaries are explicit so the project remains technically credible.

## Production-hardening path

A production evolution would add:

- authenticated ingestion and ACL-aware retrieval
- persistent Postgres/Redis LangGraph checkpointing
- managed Qdrant/pgvector with metadata filters
- stronger embedding and reranking models
- ingestion jobs for PDF/Office/SharePoint/Confluence sources
- prompt-injection/document-poisoning controls
- OpenTelemetry/Langfuse traces, metrics and SLOs
- RAGAS plus domain-expert evaluation beyond the deterministic goldset
- enterprise SSO, RBAC, approver identity, audit retention and tenant isolation
- rate limiting, secrets management and security review
- MCP or typed tool integrations for downstream enterprise systems

## Repository governance

The CI jobs use stable protection-ready check names:

- **Python verification**
- **Web verification**

Recommended `main` protection settings are documented in [`docs/branch-protection.md`](docs/branch-protection.md). Weekly Dependabot updates cover Python, npm and GitHub Actions dependencies.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — system architecture
- [`docs/evaluation.md`](docs/evaluation.md) — evaluation design and gates
- [`docs/business-case.md`](docs/business-case.md) — business framing
- [`docs/security.md`](docs/security.md) — security/responsible-AI boundaries
- [`docs/deployment-modes.md`](docs/deployment-modes.md) — public vs connected execution/trust model
- [`docs/branch-protection.md`](docs/branch-protection.md) — recommended protected-main policy
- [`docs/market-alignment.md`](docs/market-alignment.md) — skills/market mapping
- [`VERIFICATION.md`](VERIFICATION.md) — concrete verification snapshot

## Why this is more than “chat with PDFs”

The engineering evidence is inspectable: controlled synthetic enterprise documents, deterministic hybrid retrieval, explicit source IDs, evidence-gap handling, revision analysis, a real stateful LangGraph approval interrupt, actual Qdrant vector queries, structured APIs, 60 labeled scenarios, backend and frontend tests, cross-stack E2E, Docker packaging and documented trust boundaries.

The goal is not to make a chatbot look intelligent. The goal is to demonstrate a **traceable enterprise AI workflow in which evidence is inspectable, uncertainty is visible and decision authority remains explicit**.

## License

MIT — see [`LICENSE`](LICENSE).
