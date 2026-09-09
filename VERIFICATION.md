# Verification snapshot

Local verification completed before GitHub upload:

- Python stdlib/unit suite: **8/8 passed**
- Synthetic goldset: **60/60 intent routes passed**
- Retrieval gate: **60/60 cases retrieved at least one expected source in top-6**
- Mean expected-document recall@6: **0.9514**
- TypeScript engine suite via Node 22 built-in type stripping: **5/5 passed**
- FastAPI local smoke: `/health` and `/v1/query` passed
- Python compileall: passed

The repository also contains GitHub Actions that will perform the network-dependent framework gates after upload:

- install LangChain / LangGraph / Qdrant
- concrete LangChain Documents / splitter / Embeddings / Runnable smoke
- LangGraph real interrupt + resume approval smoke
- Qdrant local-mode smoke
- FastAPI production startup + HTTP query
- Docker build
- npm install
- strict TypeScript
- TypeScript engine tests
- Next.js 16.3.4 production build
- production web boot + health/evaluation/query/approval/error-contract HTTP smoke

The local container does not have LangGraph/Qdrant installed and cannot reach npm/PyPI reliably, so those dependency-backed checks are intentionally delegated to the checked-in clean GitHub runners rather than claimed as already complete.
