"""Production-style LangGraph orchestration.

This module is intentionally separate from the zero-dependency deterministic core so CI can
regression-test retrieval and policy semantics independently. When LangGraph is installed,
`build_graph()` creates a stateful graph with an actual human interrupt for decision briefs.
"""
from __future__ import annotations
from typing import TypedDict, Any
from .retrieval import load_corpus, hybrid_search
from .workflow import classify, _answer

class AgentState(TypedDict, total=False):
    question: str
    intent: str
    source_ids: list[str]
    answer: str
    citations: list[str]
    unsupported_claims: list[str]
    approval: dict[str, Any]


def build_graph():
    from langgraph.graph import StateGraph, START, END
    from langgraph.types import interrupt
    from langgraph.checkpoint.memory import InMemorySaver
    corpus=load_corpus()

    def classify_node(state:AgentState):
        return {'intent': classify(state['question'])}

    def retrieve_node(state:AgentState):
        hits=hybrid_search(state['question'],corpus,k=6)
        return {'source_ids':[h.id for h in hits]}

    def synthesize_node(state:AgentState):
        hits=hybrid_search(state['question'],corpus,k=6)
        answer,citations,gaps=_answer(state['question'],state['intent'],hits)
        return {'answer':answer,'citations':citations,'unsupported_claims':gaps}

    def approval_node(state:AgentState):
        if state.get('intent')!='brief': return {}
        raw=interrupt({'type':'decision_brief_approval','answer':state['answer'],'citations':state['citations'],'allowed':['approve','edit','reject']})
        decision=raw if isinstance(raw,dict) else {'decision':raw}
        update={'approval':decision}
        if decision.get('decision')=='edit' and decision.get('edited_text'):
            update['answer']=decision['edited_text']
        return update

    graph=StateGraph(AgentState)
    graph.add_node('classify',classify_node)
    graph.add_node('retrieve',retrieve_node)
    graph.add_node('synthesize',synthesize_node)
    graph.add_node('approval',approval_node)
    graph.add_edge(START,'classify'); graph.add_edge('classify','retrieve'); graph.add_edge('retrieve','synthesize'); graph.add_edge('synthesize','approval'); graph.add_edge('approval',END)
    return graph.compile(checkpointer=InMemorySaver())
