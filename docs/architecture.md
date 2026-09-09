# Architecture

```text
Synthetic enterprise documents
        │
        ├─ LangChain normalization / ingestion adapter
        ├─ deterministic chunk + metadata model
        ▼
Hybrid retrieval
  ├─ TF-IDF-like dense similarity (public reproducible baseline)
  ├─ BM25 sparse retrieval
  ├─ metadata/tag boosts
  └─ optional Qdrant local vector index
        ▼
Reranked evidence set
        ▼
LangGraph state machine
  classify → retrieve → synthesize → approval interrupt → complete
        ▼
Evidence-backed answer + citations + gaps + trace
        ▼
Human-approved decision pack
```

The repository separates **retrieval authority** from **language generation**. Optional Ollama generation may improve wording, but the model cannot create source IDs, bypass retrieval, or approve a sourcing recommendation.
