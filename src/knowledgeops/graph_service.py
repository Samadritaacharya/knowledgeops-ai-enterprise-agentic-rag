"""Stateful LangGraph service wrapper with a real interrupt/resume path."""
from __future__ import annotations
import uuid
from .langgraph_runtime import build_graph

_GRAPH=None

def graph():
    global _GRAPH
    if _GRAPH is None: _GRAPH=build_graph()
    return _GRAPH

def _serialise_interrupts(raw):
    out=[]
    for x in raw or []:
        out.append(getattr(x,'value',x))
    return out

def start_graph(question:str,thread_id:str|None=None):
    tid=thread_id or str(uuid.uuid4())
    config={'configurable':{'thread_id':tid}}
    result=graph().invoke({'question':question},config=config)
    ints=result.get('__interrupt__',[]) if isinstance(result,dict) else []
    if ints:
        return {'thread_id':tid,'status':'approval_required','interrupts':_serialise_interrupts(ints),'state':{k:v for k,v in result.items() if k!='__interrupt__'}}
    return {'thread_id':tid,'status':'completed','state':result}

def resume_graph(thread_id:str,decision:dict):
    from langgraph.types import Command
    config={'configurable':{'thread_id':thread_id}}
    result=graph().invoke(Command(resume=decision),config=config)
    approval=result.get('approval',{}) if isinstance(result,dict) else {}
    status='rejected' if approval.get('decision')=='reject' else 'completed'
    return {'thread_id':thread_id,'status':status,'state':result}
