from __future__ import annotations
import os

def trace_metadata(question:str,intent:str):
    return {'question_chars':len(question),'intent':intent,'environment':os.getenv('KNOWLEDGEOPS_ENV','local')}

def langfuse_enabled()->bool:
    return bool(os.getenv('LANGFUSE_PUBLIC_KEY') and os.getenv('LANGFUSE_SECRET_KEY'))
