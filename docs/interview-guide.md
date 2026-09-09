# KnowledgeOps AI — Interview Guide

Use this document to explain the project accurately in interviews, CVs and LinkedIn without overstating production maturity.

## 30-second summary

KnowledgeOps AI is an enterprise Agentic RAG reference platform for turning fragmented engineering and procurement evidence into inspectable decisions. It combines deterministic hybrid retrieval, citations, evidence-gap detection, revision analysis and a governed human approval boundary. The public Vercel app runs a zero-key deterministic mode, while CI also verifies a real FastAPI + LangGraph `interrupt()`/resume path with same-thread approve/edit/reject semantics.

## What problem does it solve?

Enterprise decisions often depend on evidence spread across specifications, commercial terms, security policies, sustainability requirements, revision-controlled documents and risk notes. A normal "chat with PDFs" flow can summarize, but it does not prove that the right evidence was retrieved, expose unsupported claims or prevent the model from becoming its own decision authority.

KnowledgeOps AI is designed around five controls:

1. **retrieval before generation** — answers are anchored to an evidence set;
2. **visible provenance** — source IDs, scores and citations stay inspectable;
3. **explicit uncertainty** — missing evidence is surfaced rather than silently completed;
4. **human authority** — decision briefs require approve/edit/reject;
5. **evaluation before claims** — retrieval and routing are regression-tested against a checked-in goldset.

## Architecture to explain on a whiteboard

```text
Enterprise documents
      ↓
LangChain ingestion / normalization
      ↓
Hybrid retrieval
(BM25 + TF-IDF-style similarity + metadata boosts + optional Qdrant)
      ↓
Evidence set + reranking
      ↓
LangGraph state machine
classify → retrieve → synthesize → human interrupt → complete
      ↓
Decision pack
(answer + citations + evidence gaps + approval state + trace)
```

The most important design decision is the separation of **retrieval authority**, **language generation** and **human decision authority**.

## Why LangGraph instead of a simulated approval button?

The Python reference path uses a real LangGraph `StateGraph` and `interrupt()`. A decision brief pauses graph execution, receives a `thread_id`, and the connected web path must resume that exact thread for approve/edit/reject. CI tests the same-thread behavior end to end through Next.js → FastAPI → LangGraph.

That is materially different from changing a frontend label from "pending" to "approved".

## Why deterministic retrieval first?

The project deliberately keeps the mandatory baseline reproducible and free of external model dependencies. That makes failures attributable and keeps the 60-case evaluation stable. Qdrant and optional local model paths are included as adapters, but the baseline does not need a paid embedding or LLM API to prove routing, retrieval, evidence and governance behavior.

## What is live versus CI-only?

### Live and externally smoke-tested

- Next.js production app on Vercel
- deterministic hybrid retrieval
- evidence cards and citations
- compare / risk / gap / revision / decision-brief flows
- explicit approve / edit / reject boundary
- malformed JSON, unknown-field and self-approval rejection
- 60-case evaluation endpoint

### Verified in CI but not claimed as a durable hosted backend

- FastAPI backend
- real LangGraph `interrupt()`
- same-thread resume with `thread_id`
- local Qdrant vector queries
- Docker production image

The current Python reference checkpointer uses `InMemorySaver`. That is appropriate for deterministic CI and local architecture demonstration, but not for a horizontally scaled serverless production approval workflow. A durable hosted version should move checkpoint state to Postgres/Redis or another production-grade persistence layer before claiming persistent enterprise state.

## Evaluation evidence

- 8/8 Python governance/unit tests
- 60/60 intent-routing cases
- 60/60 cases retrieve at least one expected source in top-6
- 0.9514 mean expected-document recall@6
- 8/8 TypeScript engine/bridge tests
- FastAPI HTTP smoke
- real LangGraph approve/edit/reject E2E
- Qdrant local vector query
- Docker build
- external Vercel production smoke

These are synthetic regression results for this repository, not real procurement accuracy or legal/compliance claims.

## Likely interviewer questions

### "Why not embeddings-only?"
The deterministic baseline makes evaluation cheap, transparent and reproducible. Hybrid retrieval also reflects enterprise reality: exact identifiers, policy terms, revisions and supplier names often benefit from sparse/lexical retrieval. A production version can add stronger embeddings and learned reranking without discarding sparse retrieval.

### "Why is human approval separate from the model?"
Because a model can propose wording or synthesize evidence, but it should not be able to authorize its own sourcing recommendation. The architecture treats approval as a distinct authority boundary.

### "What would you change for production?"
Add SSO/RBAC, document ACL filtering, tenant isolation, authenticated approver identity, persistent LangGraph checkpointing, managed Qdrant/pgvector, prompt-injection/document-poisoning controls, rate limiting, secrets management, durable audit retention, OpenTelemetry/Langfuse and domain-expert evaluation.

### "What trade-off did you intentionally accept?"
The live public demo prioritizes zero-cost repeatability and transparency over pretending to be a fully persistent enterprise backend. The real stateful LangGraph path is tested separately until durable hosted state is available.

## CV-ready project entry

**KnowledgeOps AI — Enterprise Agentic RAG Platform**  
Built a governed enterprise RAG platform using LangChain/LangGraph, hybrid retrieval, FastAPI, Qdrant-ready vector search, Next.js and TypeScript; implemented evidence-backed decision briefs with human approve/edit/reject gates and same-thread LangGraph resume semantics. Established reproducible quality gates across a 60-case synthetic goldset (60/60 expected-source retrieval; 0.9514 mean recall@6), Python/TypeScript CI, Docker and external Vercel production smoke testing.

Shorter one-line version:

**Built and deployed an enterprise Agentic RAG platform with LangGraph HITL governance, hybrid retrieval, FastAPI/Next.js, 60-case evaluation and externally verified production smoke tests.**

## LinkedIn-ready project description

**KnowledgeOps AI — Enterprise Agentic RAG Platform**

Designed and built a portfolio-safe enterprise RAG system for engineering/procurement decisions. The platform combines hybrid retrieval, evidence provenance, evidence-gap detection, revision analysis and explicit human approval. The public Vercel app is zero-key and externally smoke-tested; a separate FastAPI + LangGraph path is verified in CI with real `interrupt()` and same-thread approve/edit/reject resume behavior.

**Stack:** Python, LangChain, LangGraph, FastAPI, Qdrant, BM25, Next.js, React, TypeScript, Docker, GitHub Actions, Vercel.

**Verification:** 60/60 expected-source retrieval cases, 0.9514 mean recall@6, Python/Web CI, Qdrant smoke, LangGraph HITL E2E, Docker build and production HTTP smoke.

## Links

- Live app: https://knowledgeops-ai-enterprise-agentic-six.vercel.app/
- Source: https://github.com/Samadritaacharya/knowledgeops-ai-enterprise-agentic-rag
- Verification: ../VERIFICATION.md
- Architecture: architecture.md
- Deployment trust boundary: deployment-modes.md
