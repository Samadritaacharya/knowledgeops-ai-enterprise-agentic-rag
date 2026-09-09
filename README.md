# KnowledgeOps AI — Enterprise Agentic RAG Platform

[![Python AI CI](https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag/actions/workflows/python-ci.yml/badge.svg)](https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag/actions/workflows/python-ci.yml)
[![Interactive Web CI](https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag/actions/workflows/web-ci.yml/badge.svg)](https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag/actions/workflows/web-ci.yml)

> **From enterprise knowledge to evidence-backed decisions.**

KnowledgeOps AI is an end-to-end **Agentic RAG and decision-intelligence platform** built around a synthetic industrial engineering and procurement scenario. It demonstrates how enterprise documents can be ingested, retrieved, compared, traced and converted into human-approved decision briefs without turning an LLM into the source of truth.

The project combines **LangChain, LangGraph, hybrid retrieval, Qdrant local mode, FastAPI, Pydantic, Next.js, React, TypeScript, Motion, React Three Fiber, Docker and GitHub Actions**. The default path requires **no paid model API**.

> All public data is synthetic. This repository demonstrates architecture, engineering practice and evaluation methodology; it does not claim deployment inside a real employer or customer environment.

## The business problem

Enterprise teams often have the information they need, but it is fragmented across specifications, supplier submissions, commercial terms, policies, manuals, risk notes and revision-controlled documents. A normal chatbot can summarize text, but it does not automatically provide the controls required for a business decision.

KnowledgeOps AI is designed around a stricter question:

**Can an AI system retrieve the right evidence, expose gaps, preserve citations, show its reasoning path and stop for accountable human approval before a recommendation becomes a decision?**

The demo scenario evaluates two synthetic industrial gateway suppliers against engineering, commercial, cybersecurity, sustainability and sourcing-governance requirements.

## What the platform can do

- Answer grounded questions across enterprise documents.
- Compare supplier Alpha and supplier Beta across technical fit, price, lead time, warranty and resilience.
- Identify cybersecurity, sourcing and evidence risks.
- Detect missing evidence instead of silently inventing support.
- Compare revision A and revision B of a controlled technical specification.
- Generate a structured sourcing decision brief.
- Interrupt that decision flow for explicit human approval.
- Resume the stateful LangGraph execution after approval or rejection.
- Return citations, retrieved sources, scores, unsupported claims and an execution trace.
- Run through both a Python/FastAPI reference backend and an interactive Next.js decision workspace.
- Use local Qdrant and deterministic embeddings without a hosted vector database.
- Optionally add local Ollama generation without changing evidence or approval authority.

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
        ├── TF-IDF-style similarity baseline
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
        │                                  └── human approve / reject / edit
        ▼
Evidence-backed result
        ├── answer
        ├── citations
        ├── source scores
        ├── unsupported claims / gaps
        └── execution trace
        │
        ▼
Human-approved decision pack
```

The design deliberately separates **retrieval authority** from **language generation**. Optional model generation can improve phrasing, but it cannot mint source IDs, bypass retrieval or approve a sourcing recommendation.

## Agentic workflow

The real LangGraph reference implementation uses a stateful `StateGraph` with four main nodes:

1. **classify** — routes the request to QA, comparison, risk, evidence-gap, revision or decision-brief behavior.
2. **retrieve** — performs deterministic hybrid search across the enterprise corpus.
3. **synthesize** — creates an evidence-backed response from retrieved sources.
4. **approval** — uses a real LangGraph `interrupt()` for decision briefs and waits for a human resume command.

The graph is compiled with a checkpoint saver so the approval path is not a simulated button layered over a stateless request. The FastAPI service exposes dedicated graph query and resume endpoints for this flow.

## Retrieval design

The mandatory public baseline is deterministic and reproducible:

- lexical tokenization and metadata-aware indexing
- TF-IDF-style cosine similarity
- BM25 sparse scoring
- supplier/revision/tag boosts
- deterministic ordering and retrieval fingerprints

A local Qdrant adapter is included as a vector-store integration path. It uses deterministic hash embeddings for reproducible testing and can be replaced with another LangChain `Embeddings` implementation for experiments.

## Enterprise corpus

The checked-in synthetic corpus includes:

- supplier Alpha specification
- supplier Beta specification
- commercial terms for both suppliers
- 2026 gateway engineering requirements
- cybersecurity policy
- sustainability guidance
- supply-risk material
- sourcing decision governance
- gateway operating manual
- revision A and revision B of the controlled technical specification

This makes the project suitable for testing cross-document retrieval, contradictions, revision changes, evidence completeness and sourcing decisions rather than only single-document Q&A.

## Human-in-the-loop governance

Decision briefs are intentionally treated differently from normal questions.

A sourcing brief enters the LangGraph approval node and returns an **approval-required** state. The user must explicitly resume the same thread with an approval or rejection decision before the workflow completes.

This enforces the project rule:

> **LLM language may advise; retrieval evidence and accountable humans retain authority.**

## API surface

### Python / FastAPI reference backend

- `GET /health` — service status and policy metadata
- `POST /v1/query` — deterministic evidence-backed query
- `POST /v1/graph/query` — start a real stateful LangGraph execution
- `POST /v1/graph/resume` — resume an interrupted graph after human approval/rejection

### Next.js public application

- `GET /api/health`
- `GET /api/evaluation`
- `POST /api/query`
- `POST /api/approve`

The web API rejects malformed JSON, unknown fields and oversized request bodies in the production smoke suite.

## Interactive web experience

The Next.js command center is not only a landing page. It provides:

- preset business questions
- live supplier comparison and risk analysis
- retrieved-source cards with scores
- citations and evidence-gap visibility
- decision-brief approval controls
- orchestration trace inspection
- session run history
- an animated evidence network built with React Three Fiber
- Motion-based interaction and scroll transitions

The frontend includes reduced-motion/WebGL fallback behavior so the core decision workflow remains usable without the 3D layer.

## Evaluation and verified quality gates

The repository contains a **60-case synthetic goldset** across six intent families:

`QA` · `compare` · `risk` · `evidence gap` · `revision` · `decision brief`

The clean GitHub runner has verified:

- **8/8 Python unit/governance tests**
- **60/60 intent-routing cases**
- **60/60 cases retrieving at least one expected source in top-6**
- **0.9514 mean expected-document recall@6**
- LangChain Runnable retrieval smoke
- LangChain document splitting smoke
- deterministic embedding smoke
- local Qdrant construction smoke
- real LangGraph interrupt and resume smoke
- FastAPI production startup and query smoke
- Docker production image build
- strict TypeScript validation
- **5/5 TypeScript engine tests**
- Next.js production build
- production HTTP smoke for the homepage and application APIs
- malformed JSON rejection
- unknown-field rejection
- oversized-request rejection

These are synthetic regression/evaluation results for this repository, not claims of real-world procurement accuracy.

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
│   ├── app/                       # Next.js routes and UI
│   ├── components/                # command center + evidence scene
│   ├── lib/                       # deterministic web retrieval/workflow
│   └── tests/                     # TypeScript regression tests
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
├── docs/                          # architecture, evaluation, business/security docs
├── Dockerfile
├── docker-compose.yml
└── .github/workflows/             # Python AI CI + Interactive Web CI
```

## Technology stack

**AI / retrieval**

`LangChain` · `LangGraph` · `Qdrant` · `BM25` · `hybrid retrieval` · `deterministic embeddings` · `optional Ollama`

**Backend**

`Python 3.13` · `FastAPI` · `Pydantic` · `Uvicorn`

**Frontend**

`Next.js 16` · `React 19` · `TypeScript` · `Motion` · `React Three Fiber` · `Three.js`

**Engineering**

`Docker` · `GitHub Actions` · `CI/CD` · `synthetic evaluation` · `HTTP smoke testing`

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

Open FastAPI at `http://127.0.0.1:8000`.

### Frontend

```bash
npm install
npm run typecheck
npm run test:web
npm run build
npm run start
```

The default web app runs at `http://localhost:3000`.

### Docker

```bash
docker build -t knowledgeops-ai .
docker run --rm -p 8000:8000 knowledgeops-ai
```

Or use:

```bash
docker compose up --build
```

## Optional local LLM

The default project does not require any external model API.

To experiment with local generation:

```bash
ollama pull qwen2.5:3b
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=qwen2.5:3b
```

The local model remains advisory and does not replace retrieval or human approval.

## Security and responsible-AI boundaries

- public corpus is synthetic only
- `.env` and local database artifacts are ignored
- no paid or external LLM is required
- request schemas use bounded fields
- the public web API rejects unknown fields and oversized payloads
- decision briefs require explicit approval
- model generation cannot create citations or authorize a final decision
- CI tests the approval gate and API validation paths

See [`docs/security.md`](docs/security.md).

## Current limitations

This repository is deliberately a portfolio-scale enterprise reference implementation, not a claim of production completeness. Current limitations include:

- the default corpus is synthetic and small
- the mandatory retrieval baseline is deterministic rather than a production embedding/reranking stack
- Qdrant is demonstrated in local mode rather than managed multi-tenant infrastructure
- LangGraph checkpointing uses in-memory persistence in the reference runtime
- no enterprise SSO/RBAC, document ACL filtering or tenant isolation is implemented
- no production secrets manager or managed observability backend is required
- no real procurement, ERP or supplier system is connected

Those boundaries are intentional and documented so the project remains technically credible.

## Production-hardening path

A production evolution would add:

- authenticated document ingestion and ACL-aware retrieval
- persistent Postgres/Redis checkpointing for LangGraph
- managed Qdrant/pgvector with metadata filters
- stronger embedding and reranking models
- ingestion jobs for PDF/Office/SharePoint/Confluence sources
- prompt-injection/document-poisoning controls
- OpenTelemetry/Langfuse traces and SLOs
- RAGAS/domain-expert evaluation beyond the deterministic goldset
- enterprise SSO, RBAC, audit retention and tenant isolation
- MCP or typed tool integrations for downstream enterprise systems

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — system architecture
- [`docs/evaluation.md`](docs/evaluation.md) — evaluation design and gates
- [`docs/business-case.md`](docs/business-case.md) — business framing
- [`docs/security.md`](docs/security.md) — security/responsible-AI boundaries
- [`docs/market-alignment.md`](docs/market-alignment.md) — skills/market mapping
- [`VERIFICATION.md`](VERIFICATION.md) — concrete verification snapshot

## Why this is more than “chat with PDFs”

The project makes the engineering evidence inspectable: controlled synthetic enterprise documents, deterministic hybrid retrieval, explicit source IDs, evidence-gap handling, revision analysis, a real stateful LangGraph approval interrupt, optional local vector search, structured APIs, 60 labeled scenarios, Python and TypeScript tests, Docker packaging and production HTTP smoke tests.

The goal is not to make a chatbot look intelligent. The goal is to demonstrate a **traceable enterprise AI workflow in which evidence is inspectable and decision authority remains explicit**.
