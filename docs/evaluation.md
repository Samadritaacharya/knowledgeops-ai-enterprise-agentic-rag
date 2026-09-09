# Evaluation design

The checked-in goldset contains 60 synthetic business questions spanning QA, supplier comparison, risk review, evidence-gap analysis, revision analysis and decision-brief generation.

CI gates:
- 60/60 intent routing
- at least one expected source retrieved in top-6 for every scenario
- deterministic retrieval fingerprints
- citation/source ID integrity
- human-approval requirement for decision briefs
- Python framework smoke for LangChain, LangGraph and local Qdrant
- FastAPI startup + HTTP query
- TypeScript engine tests, production Next.js build and HTTP smoke

Optional LLM-based RAGAS/Langfuse experiments are deliberately outside the mandatory CI path because the public project requires no external account or paid API.

- real LangGraph decision-brief interrupt followed by resume/approval in the framework smoke test
