from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from src.knowledgeops.workflow import run

app=FastAPI(title='KnowledgeOps AI API',version='1.1.0')

class StrictModel(BaseModel):
    model_config=ConfigDict(extra='forbid')

class QueryIn(StrictModel):
    question:str=Field(min_length=5,max_length=2000)

@app.get('/health')
def health():
    return {'ok':True,'service':'knowledgeops-ai','paid_api_required':False,'langgraph_reference':True,'policy':'citations-first-human-authority'}

@app.post('/v1/query')
def query(body:QueryIn):
    """Run the deterministic evidence-backed path.

    External callers cannot self-assert approval. Decision briefs returned here remain pending;
    stateful approval is only completed through the LangGraph resume endpoint.
    """
    try: return run(body.question,approved=False).to_dict()
    except Exception as e: raise HTTPException(400,str(e))

class GraphQueryIn(StrictModel):
    question:str=Field(min_length=5,max_length=2000)
    thread_id:str|None=Field(default=None,min_length=5,max_length=200)

class GraphResumeIn(StrictModel):
    thread_id:str=Field(min_length=5,max_length=200)
    decision:str=Field(pattern='^(approve|reject|edit)$')
    edited_text:str|None=Field(default=None,min_length=1,max_length=5000)

@app.post('/v1/graph/query')
def graph_query(body:GraphQueryIn):
    from src.knowledgeops.graph_service import start_graph
    return start_graph(body.question,body.thread_id)

@app.post('/v1/graph/resume')
def graph_resume(body:GraphResumeIn):
    from src.knowledgeops.graph_service import resume_graph
    if body.decision=='edit' and not body.edited_text:
        raise HTTPException(422,'edited_text is required when decision=edit')
    payload={'decision':body.decision}
    if body.edited_text is not None: payload['edited_text']=body.edited_text
    return resume_graph(body.thread_id,payload)
