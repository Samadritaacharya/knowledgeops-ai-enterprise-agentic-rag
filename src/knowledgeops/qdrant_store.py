"""Optional local Qdrant adapter.

Qdrant local mode stores vectors in memory or on disk and requires no hosted service. This adapter
uses deterministic hash embeddings for reproducible portfolio testing; swap in any LangChain
Embeddings implementation for production experiments.
"""
from __future__ import annotations
import hashlib, math
from .retrieval import load_corpus, tokens

DIM=128

def embed(text:str)->list[float]:
    v=[0.0]*DIM
    for t in tokens(text):
        h=int(hashlib.sha256(t.encode()).hexdigest()[:8],16)
        idx=h%DIM; v[idx]+=1.0 if (h>>8)%2 else -1.0
    n=math.sqrt(sum(x*x for x in v)) or 1
    return [x/n for x in v]

def build_local_qdrant(path=':memory:'):
    from qdrant_client import QdrantClient, models
    client=QdrantClient(':memory:') if path==':memory:' else QdrantClient(path=path)
    client.create_collection('knowledgeops',vectors_config=models.VectorParams(size=DIM,distance=models.Distance.COSINE))
    docs=load_corpus()
    client.upsert('knowledgeops',[models.PointStruct(id=i,vector=embed(d.title+' '+d.content),payload={'doc_id':d.id,'title':d.title}) for i,d in enumerate(docs)])
    return client

def search_local_qdrant(client,text:str,limit:int=3)->list[dict]:
    """Run an actual local vector query and return compact, inspectable results."""
    response=client.query_points(collection_name='knowledgeops',query=embed(text),limit=limit,with_payload=True)
    points=getattr(response,'points',response)
    return [
        {
            'doc_id':(p.payload or {}).get('doc_id'),
            'title':(p.payload or {}).get('title'),
            'score':float(p.score),
        }
        for p in points
    ]
