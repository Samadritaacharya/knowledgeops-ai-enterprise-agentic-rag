from __future__ import annotations
import json, math, re, hashlib
from collections import Counter
from pathlib import Path
from .types import Document, SourceHit

TOKEN_RE=re.compile(r"[A-Za-z0-9€%-]+")

def tokens(text:str)->list[str]:
    return [t.lower() for t in TOKEN_RE.findall(text)]

def load_corpus(path: str|Path='data/corpus.json')->list[Document]:
    raw=json.loads(Path(path).read_text(encoding='utf-8'))
    return [Document(**d) for d in raw]

def _idf(corpus:list[Document]):
    n=len(corpus); df=Counter()
    for d in corpus:
        df.update(set(tokens(d.title+' '+d.content+' '+' '.join(d.tags))))
    return {t: math.log((n+1)/(v+1))+1 for t,v in df.items()}

def _cos(a:dict[str,float], b:dict[str,float])->float:
    dot=sum(v*b.get(k,0.0) for k,v in a.items())
    na=math.sqrt(sum(v*v for v in a.values())); nb=math.sqrt(sum(v*v for v in b.values()))
    return 0.0 if not na or not nb else dot/(na*nb)

def _tfidf(ts:list[str], idf:dict[str,float])->dict[str,float]:
    c=Counter(ts); n=max(1,len(ts))
    return {t:(v/n)*idf.get(t,1.0) for t,v in c.items()}

def _bm25(query:list[str], doc:list[str], corpus:list[list[str]], k1=1.5,b=0.75):
    N=len(corpus); avg=sum(map(len,corpus))/max(1,N); freq=Counter(doc); score=0.0
    for t in query:
        df=sum(1 for d in corpus if t in set(d))
        idf=math.log(1+(N-df+0.5)/(df+0.5))
        f=freq[t]
        if f:
            score += idf*(f*(k1+1))/(f+k1*(1-b+b*len(doc)/max(avg,1)))
    return score

def hybrid_search(query:str, corpus:list[Document], k:int=5)->list[SourceHit]:
    q=tokens(query); idf=_idf(corpus)
    texts=[tokens(d.title+' '+d.content+' '+' '.join(d.tags)) for d in corpus]
    qv=_tfidf(q,idf)
    dense=[]; sparse=[]
    for d,dt in zip(corpus,texts):
        dense.append(_cos(qv,_tfidf(dt,idf)))
        sparse.append(_bm25(q,dt,texts))
    mx=max(sparse) if sparse else 1
    out=[]
    qset=set(q)
    for i,d in enumerate(corpus):
        tag_bonus=len(qset.intersection(set(tokens(' '.join(d.tags)))))*0.03
        score=0.46*dense[i]+0.46*(sparse[i]/mx if mx else 0)+tag_bonus
        if 'revision' in qset and d.type=='revision': score+=0.15
        if ('supplier' in qset or 'alpha' in qset or 'beta' in qset) and d.type in {'supplier_spec','commercial'}: score+=0.06
        snippet=d.content[:280].strip()+('…' if len(d.content)>280 else '')
        out.append(SourceHit(d.id,d.title,round(score,6),snippet,d.type,d.revision))
    return sorted(out,key=lambda x:(-x.score,x.id))[:k]

def fingerprint(hits:list[SourceHit])->str:
    s='|'.join(f'{h.id}:{h.score:.6f}' for h in hits)
    return hashlib.sha256(s.encode()).hexdigest()[:16]
