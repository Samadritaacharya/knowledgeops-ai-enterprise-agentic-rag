# Verification snapshot

KnowledgeOps AI is verified through two clean GitHub Actions pipelines: **Python AI CI** and **Interactive Web CI**. The mandatory path is designed to run without a paid model API.

## Clean GitHub verification

The current end-to-end suite validates the deterministic retrieval/workflow layer, the real LangGraph stateful approval path, local Qdrant vector queries, FastAPI contracts, the production Next.js application and Docker packaging.

### Python / AI backend

- Python compile: **passed**
- Python unit/governance suite: **8/8 passed**
- Synthetic goldset: **60/60 intent routes passed**
- Retrieval gate: **60/60 cases retrieved at least one expected source in top-6**
- Mean expected-document recall@6: **0.951388888888889**
- LangChain Runnable rewrite/retrieval smoke: **passed**
- LangChain document splitting: **passed**
- Deterministic embeddings: **passed**
- LangGraph graph construction: **passed**
- Real LangGraph decision-brief interrupt: **passed**
- LangGraph approve/resume path: **passed**
- LangGraph human-edit path: **passed**
- LangGraph explicit rejection path: **passed**
- Qdrant local-mode construction: **passed**
- Actual local Qdrant vector query: **passed**
- FastAPI production startup: **passed**
- FastAPI `/health`: **passed**
- FastAPI deterministic comparison query: **passed**
- FastAPI decision brief remains `approval_required`: **passed**
- FastAPI self-approval bypass attempt (`approved=true`) rejected: **passed**
- FastAPI real `/v1/graph/query` → `/v1/graph/resume` approve flow: **passed**
- FastAPI human-edit flow: **passed**
- FastAPI reject flow returns `rejected`: **passed**
- FastAPI unknown-field rejection: **passed**
- FastAPI invalid decision rejection: **passed**
- FastAPI edit-without-text rejection: **passed**
- FastAPI malformed JSON rejection: **passed**
- Docker production image build: **passed**

The verified dependency path includes LangChain, LangGraph, Qdrant Client, FastAPI, Pydantic and Uvicorn on Python 3.13.

### Interactive web application

- Node.js 22 workspace install: **passed**
- strict TypeScript typecheck: **passed**
- TypeScript engine tests: **5/5 passed**
- 60-case frontend intent routing: **passed**
- 60-case expected-source retrieval gate: **passed**
- decision brief requires approval: **passed**
- explicit `/api/approve` action completes a pending brief: **passed**
- `/api/query` self-approval bypass attempt rejected: **passed**
- `/api/approve` refuses non-brief questions: **passed**
- approval-route unknown-field rejection: **passed**
- query-route unknown-field rejection: **passed**
- revision response cites both controlled revisions: **passed**
- retrieval determinism: **passed**
- Next.js 16.3.4 production build: **passed**
- production Next.js server boot: **passed**
- homepage HTTP smoke: **passed**
- `/api/health`: **passed**
- `/api/evaluation`: **passed**
- `/api/query`: **passed**
- `/api/approve`: **passed**
- malformed JSON rejection: **passed**
- oversized query rejection: **passed**
- oversized approval rejection: **passed**

## What these results mean

The repository has repeatable evidence that its checked-in deterministic workflow, retrieval baseline, LangChain adapters, local vector-store path, real stateful approval flow, APIs, production web build and Docker image operate together in a clean GitHub runner.

The **60-case evaluation is a synthetic regression fixture**, not a claim of real-world procurement accuracy, legal compliance or production-grade model quality. The corpus is intentionally synthetic and small enough to make the evaluation inspectable.

## Authority boundary tested by the project

The architecture preserves the rule:

> **Language generation may advise; retrieval evidence and accountable humans retain authority.**

A decision brief does not complete autonomously. The Python LangGraph reference path raises a real interrupt, preserves thread state and requires an explicit resume command. The CI verifies three human outcomes: approve, edit and reject. The deterministic FastAPI query route cannot be used to self-assert approval.

The public Next.js demo intentionally has no authentication or durable approval database. It therefore treats `/api/approve` as an explicit user interaction rather than a production identity control, while still preventing approval from being smuggled through `/api/query`. Production deployment would add authenticated approvers and durable audit state.

## Reproducible commands

Backend:

```bash
python -m compileall -q api.py src
python -m unittest discover -s tests -p 'test_*.py' -v
python scripts/evaluate.py
uvicorn api:app --host 127.0.0.1 --port 8000
```

Frontend:

```bash
npm install --no-audit --no-fund
npm run typecheck
npm run test:web
npm run build
cd frontend && npm start -- --hostname 127.0.0.1 --port 3000
```

Docker:

```bash
docker build -t knowledgeops-ai .
```

## Known non-blocking CI warning

GitHub currently emits a warning that some pinned marketplace actions target a deprecated Node runtime and are being forced onto a newer runtime by GitHub Actions. This is an Actions-runtime maintenance warning, not a failure in the KnowledgeOps application. Future maintenance can update the action major versions when appropriate.
