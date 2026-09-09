from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from src.knowledgeops.workflow import run

app=FastAPI(title='KnowledgeOps AI API',version='1.0.0')

class QueryIn(BaseModel):
    question:str=Field(min_length=5,max_length=2000)
    approved:bool=False

@app.get('/health')
def health():
    return {'ok':True,'service':'knowledgeops-ai','paid_api_required':False,'langgraph_reference':True,'policy':'citations-first-human-authority'}

@app.post('/v1/query')
def query(body:QueryIn):
    try: return run(body.question,approved=body.approved).to_dict()
    except Exception as e: raise HTTPException(400,str(e))


class GraphQueryIn(BaseModel):
    question:str=Field(min_length=5,max_length=2000)
    thread_id:str|None=None

class GraphResumeIn(BaseModel):
    thread_id:str=Field(min_length=5,max_length=200)
    decision:str=Field(pattern="^(approve|reject)$")
    edited_text:str|None=None

@app.post('/v1/graph/query')
def graph_query(body:GraphQueryIn):
    from src.knowledgeops.graph_service import start_graph
    return start_graph(body.question,body.thread_id)

@app.post('/v1/graph/resume')
def graph_resume(body:GraphResumeIn):
    from src.knowledgeops.graph_service import resume_graph
    payload={'decision':body.decision}
    if body.edited_text: payload['edited_text']=body.edited_text
    return resume_graph(body.thread_id,payload)
