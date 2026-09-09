# Deployment modes and trust boundary

KnowledgeOps AI deliberately supports two web runtime modes so the portfolio remains usable without paid infrastructure while the repository can still prove a real stateful LangGraph approval flow.

## 1. Deterministic public-demo mode

This is the default when `KNOWLEDGEOPS_API_URL` is not set.

The Next.js server executes the checked-in deterministic TypeScript retrieval/workflow engine. It requires no model key, hosted vector database or Python service. The public web API still enforces strict request validation and a separate explicit human-decision endpoint.

This mode is intended for a permanently accessible portfolio demo. It is not presented as a durable enterprise approval service.

```text
Browser
  -> Next.js /api/query
  -> deterministic TypeScript retrieval/workflow
  -> evidence + citations + draft decision brief
  -> Next.js /api/approve
  -> explicit approve / edit / reject action
```

## 2. Connected FastAPI + LangGraph mode

Set `KNOWLEDGEOPS_API_URL` to the base URL of the Python service, for example:

```bash
export KNOWLEDGEOPS_API_URL=http://127.0.0.1:8000
```

In connected mode, the Next.js routes become a server-side bridge to FastAPI. `/api/query` starts the real LangGraph state machine and returns its thread ID and retrieved evidence. A decision brief stops at the LangGraph `interrupt()` node. The web review endpoint then resumes that exact thread with one of three explicit human outcomes: `approve`, `edit`, or `reject`.

```text
Browser
  -> Next.js /api/query
  -> FastAPI /v1/graph/query
  -> LangGraph classify -> retrieve -> synthesize -> interrupt
  -> thread_id + backend evidence returned to UI
  -> reviewer approve / edit / reject
  -> Next.js /api/approve
  -> FastAPI /v1/graph/resume
  -> same LangGraph thread resumes
```

The UI exposes `runtime_mode` in responses and visibly labels the connected mode so a reviewer can tell which execution path is active.

## Why both modes exist

A free public portfolio deployment should remain available even when no long-running Python service is hosted. At the same time, the repository should not blur a deterministic browser-facing simulation with the stronger claim of a stateful human-in-the-loop graph.

The split therefore follows three rules:

1. **Public availability is not evidence of backend statefulness.** The default demo is explicitly labeled as deterministic.
2. **Stateful approval claims are backed by the Python LangGraph implementation and CI.** Connected E2E tests start FastAPI and Next.js together, create a decision brief, retain the thread ID, and verify approve/edit/reject resume paths.
3. **Evidence remains inspectable in both modes.** Connected graph state includes the actual retrieved source objects used by the Python workflow so the UI does not silently substitute a second evidence set.

## Production deployment considerations

The connected mode is still a reference deployment, not a production enterprise control plane. A production implementation should replace the in-memory LangGraph checkpointer with durable storage, add authenticated reviewer identity, RBAC/ACL-aware retrieval, audit retention, managed vector storage, observability/SLOs, rate limits, secrets management and tenant isolation.

The environment variable only controls server-to-server routing. It does not turn the current portfolio implementation into an authenticated production system.
