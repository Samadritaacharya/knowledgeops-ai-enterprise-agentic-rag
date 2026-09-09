"""Concrete LangChain RAG composition used by the reference backend.

This module demonstrates LangChain Documents, text splitting, Embeddings and Runnable composition
without making a paid model API part of the required runtime. The deterministic embedding is a
reproducible baseline; users can substitute any hosted or local embedding model behind the same
Embeddings interface.
"""
from __future__ import annotations
import hashlib, math
from typing import Iterable
from langchain_core.documents import Document as LCDocument
from langchain_core.embeddings import Embeddings
from langchain_core.runnables import RunnableLambda
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .retrieval import load_corpus, hybrid_search, tokens

class DeterministicHashEmbeddings(Embeddings):
    """Small reproducible embedding adapter for no-key tests and demos."""
    def __init__(self, dimensions:int=192): self.dimensions=dimensions
    def _embed(self,text:str)->list[float]:
        vec=[0.0]*self.dimensions
        for t in tokens(text):
            h=int(hashlib.sha256(t.encode()).hexdigest()[:16],16)
            vec[h%self.dimensions]+=1.0 if ((h>>10)&1) else -1.0
        n=math.sqrt(sum(v*v for v in vec)) or 1.0
        return [v/n for v in vec]
    def embed_documents(self,texts:list[str])->list[list[float]]: return [self._embed(t) for t in texts]
    def embed_query(self,text:str)->list[float]: return self._embed(text)

def enterprise_documents()->list[LCDocument]:
    return [LCDocument(page_content=d.content,metadata={'doc_id':d.id,'title':d.title,'type':d.type,'revision':d.revision,'tags':d.tags}) for d in load_corpus()]

def chunk_documents(chunk_size:int=420,chunk_overlap:int=60)->list[LCDocument]:
    splitter=RecursiveCharacterTextSplitter(chunk_size=chunk_size,chunk_overlap=chunk_overlap,separators=['\n\n','. ',' ',''])
    return splitter.split_documents(enterprise_documents())

def build_retrieval_runnable(k:int=6):
    """Return a LangChain Runnable that emits ranked source metadata for a question."""
    def retrieve(payload:dict):
        q=str(payload['question'])
        hits=hybrid_search(q,load_corpus(),k=k)
        return {'question':q,'hits':[{'id':h.id,'title':h.title,'score':h.score,'snippet':h.snippet} for h in hits]}
    return RunnableLambda(lambda x:{'question':' '.join(str(x['question']).split())}) | RunnableLambda(retrieve)
