# KnowledgeOps AI — Enterprise Agentic RAG Platform

**From enterprise knowledge to evidence-backed decisions.**

KnowledgeOps AI is a portfolio-safe, end-to-end Agentic RAG and decision-intelligence platform for an industrial engineering/procurement scenario. It demonstrates **LangChain Documents/Runnables/Embeddings, LangGraph with real interrupt/resume HITL, hybrid retrieval, Qdrant-ready vectors, FastAPI, human-in-the-loop governance, evaluation, Next.js/React, Docker and CI/CD** without requiring a paid model API.

> Public demo data is fully synthetic. This project demonstrates architecture and engineering practice; it does not claim production deployment inside an employer or customer environment.

## Why this project exists

German AI roles increasingly expect more than prompting: stateful agents, RAG, vector retrieval, FastAPI, structured outputs, evaluation, observability, deployment and human oversight. KnowledgeOps AI packages those capabilities around a business problem that is easy to understand and hard to fake: **compare suppliers and engineering requirements while preserving evidence and decision authority**.

## Product workflow

```text
Documents → LangChain ingestion → hybrid retrieval → Qdrant-ready vectors
         → reranking → LangGraph orchestration → evidence analysis
         → human approval → structured decision pack + citations
```

## What you can do

- Compare two synthetic industrial suppliers against mandatory requirements.
- Ask grounded questions across specifications, commercial terms, policies and manuals.
- Detect missing supplier evidence rather than silently filling gaps.
- Compare revision A versus revision B of a controlled specification.
- Generate a sourcing decision brief that **stops at a human approval gate**.
- Inspect retrieved sources, scores, citations and orchestration trace.
- Run the deterministic public API plus a **real LangGraph interrupt/resume endpoint** through FastAPI.
- Inspect LangChain document splitting, embedding adapters and Runnable retrieval composition in the reference backend.
- Optionally experiment with a local Ollama model and local Qdrant without changing source authority.

## Stack

`Python` · `LangChain` · `LangGraph` · `FastAPI` · `Pydantic` · `Qdrant local` · `Hybrid RAG` · `BM25` · `Next.js` · `React` · `TypeScript` · `Motion` · `React Three Fiber` · `Docker` · `GitHub Actions`

## Evaluation

The repository includes a **60-case synthetic goldset** across six intents: QA, compare, risk, evidence gap, revision analysis and decision brief. CI checks intent routing, expected-source retrieval, human approval behavior, framework imports, API startup, production web build and HTTP contracts.

See [`docs/evaluation.md`](docs/evaluation.md) for the exact gates.

## Responsible AI boundary

**Retrieval evidence and humans own authority.** Optional LLM generation may rewrite an answer, but it cannot create source IDs, bypass the retrieval layer, or approve a final sourcing recommendation. Decision briefs remain drafts until a human category owner approves them.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m unittest discover -s tests -p 'test_*.py' -v
python scripts/evaluate.py
uvicorn api:app --reload
```

Frontend:

```bash
npm install
npm run typecheck
npm run test:web
npm run build
npm run start
```

Optional local LLM:

```bash
ollama pull qwen2.5:3b
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=qwen2.5:3b
```

No external API key is required by the default project.

## Documentation

- [`docs/architecture.md`](docs/architecture.md)
- [`docs/evaluation.md`](docs/evaluation.md)
- [`docs/business-case.md`](docs/business-case.md)
- [`docs/security.md`](docs/security.md)
- [`docs/market-alignment.md`](docs/market-alignment.md)

## Portfolio proof, not a toy chatbot

The repository is intentionally designed to make engineering evidence inspectable: synthetic enterprise corpus, deterministic retrieval, a real LangGraph HITL graph, optional local Qdrant, 60 labeled scenarios, Python + TypeScript tests, production HTTP smoke tests, Docker build and Vercel-ready frontend.
