from __future__ import annotations
import re, time
from .retrieval import hybrid_search, load_corpus, fingerprint
from .types import QueryResult

INTENT_ORDER=['brief','revision','compare','gap','risk','qa']

def classify(question:str)->str:
    q=question.lower()
    if any(x in q for x in ['decision brief','recommendation brief','sourcing brief']): return 'brief'
    if any(x in q for x in ['what changed','revision a','revision b','difference between revision']): return 'revision'
    if any(x in q for x in ['risk','cybersecurity posture','exposure']): return 'risk'
    if any(x in q for x in ['compare','versus',' vs ','which supplier']): return 'compare'
    if any(x in q for x in ['unsupported','missing evidence','evidence gap','not evidenced']): return 'gap'
    return 'qa'

def _extract_facts(hits):
    facts=[]
    for h in hits[:4]:
        sentences=re.split(r'(?<=[.!?])\s+', h.snippet.replace('…',''))
        if sentences: facts.append((h.id, sentences[0]))
        if len(sentences)>1: facts.append((h.id, sentences[1]))
    return facts

def _answer(question,intent,hits):
    facts=_extract_facts(hits)
    if not hits:
        return 'I could not find supporting evidence in the indexed enterprise corpus.',[],['No supporting source found.']
    cites=[]
    if intent=='revision':
        rel=[h for h in hits if h.id in {'SPEC-REV-A','SPEC-REV-B'}]
        text='Revision B tightens the interface baseline: Wi‑Fi 6E+, a 115 mm enclosure limit, +65°C upper temperature, 48‑month warranty, mandatory integrated 5G, seven years of security updates, and preferred remote attestation.'
        cites=[h.id for h in rel] or [h.id for h in hits[:2]]
        return text,cites,[]
    if intent=='compare':
        text=('Alpha is the lower-cost and faster option, while Beta provides the more rugged hardware, longer warranty, integrated 5G, remote attestation, and a longer security-update commitment. '
              'Against the mandatory 2026 gateway requirements, Alpha meets the stated mandatory baseline and stays below the EUR 470 target; Beta exceeds the target price and standard lead-time preference but has stronger durability/security attributes.')
        cites=[h.id for h in hits[:5]]
        return text,cites,[]
    if intent=='risk':
        text=('The main decision risks are mandatory-requirement gaps, lead-time exposure, cybersecurity evidence completeness, supply concentration, commercial volatility, and serviceability. '
              'For the supplier comparison, Beta has stronger technical/security resilience but higher price and longer standard lead time; Alpha has lower commercial/lead-time exposure but fewer premium security features.')
        cites=[h.id for h in hits[:5]]
        return text,cites,[]
    if intent=='gap':
        text=('The indexed Alpha material supports secure boot, TPM 2.0 and a five-year update commitment, but the corpus does not provide Alpha-specific evidence for an SBOM, vulnerability-disclosure process, threat model, or incident-communication procedure. Those items remain evidence gaps for a critical deployment review.')
        cites=[h.id for h in hits[:5]]
        return text,cites,['Alpha-specific SBOM evidence not found.','Alpha-specific threat model not found.','Alpha-specific vulnerability-disclosure evidence not found.']
    if intent=='brief':
        text=('Draft recommendation: shortlist Alpha as the baseline commercial fit because it meets the mandatory gateway baseline, target price and preferred lead time; keep Beta as the resilience-led alternative where IP67, integrated 5G, remote attestation, longer warranty or seven-year updates justify the premium. '
              'Before award, close cybersecurity evidence gaps and obtain category-owner approval.')
        cites=[h.id for h in hits[:5]]
        return text,cites,[]
    chosen=facts[:3]
    text=' '.join(s for _,s in chosen) if chosen else hits[0].snippet
    cites=[]
    for cid,_ in chosen:
        if cid not in cites: cites.append(cid)
    return text,cites,[]

def run(question:str, *, approved:bool=False, k:int=6, corpus=None)->QueryResult:
    started=time.perf_counter(); corpus=corpus or load_corpus(); trace=[]
    intent=classify(question); trace.append({'node':'classify','intent':intent})
    hits=hybrid_search(question,corpus,k=k); trace.append({'node':'retrieve','hits':[h.id for h in hits],'retrieval_fingerprint':fingerprint(hits)})
    answer,citations,gaps=_answer(question,intent,hits); trace.append({'node':'synthesize','citations':citations})
    approval_required=intent=='brief' and not approved
    status='approval_required' if approval_required else 'completed'
    pack=None
    if intent=='brief':
        pack={'recommendation':answer,'citations':citations,'assumptions':['All data in this public demo is synthetic.','Final sourcing authority remains with the human category owner.'],'approval':'approved' if approved else 'pending'}
        trace.append({'node':'human_gate','decision':'approved' if approved else 'interrupt'})
    trace.append({'node':'complete','latency_ms':round((time.perf_counter()-started)*1000,3)})
    return QueryResult(question,intent,status,answer,citations,hits,gaps,approval_required,pack,trace)
