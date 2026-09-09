"""LangChain adapters used by KnowledgeOps AI.

The public demo requires no paid model. LangChain is still used for typed Runnable composition,
and an optional Ollama endpoint can provide local/open-weight generation without changing the
retrieval or citation authority path.
"""
from __future__ import annotations
import os, json, urllib.request


def build_rewrite_chain():
    from langchain_core.runnables import RunnableLambda
    normalize=RunnableLambda(lambda x: {'question':' '.join(str(x['question']).split()), **{k:v for k,v in x.items() if k!='question'}})
    return normalize


def optional_ollama_rewrite(prompt:str)->str|None:
    base=os.getenv('OLLAMA_BASE_URL','').rstrip('/')
    model=os.getenv('OLLAMA_MODEL','qwen2.5:3b')
    if not base: return None
    payload=json.dumps({'model':model,'prompt':prompt,'stream':False}).encode()
    req=urllib.request.Request(base+'/api/generate',data=payload,headers={'content-type':'application/json'})
    try:
        with urllib.request.urlopen(req,timeout=20) as r:
            return json.load(r).get('response')
    except Exception:
        return None
