import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import json
from src.knowledgeops.workflow import run

gold=json.loads(Path('evaluation/goldset.json').read_text())
passed=0; intent_ok=0; recall=[]
for c in gold:
    r=run(c['question'])
    intent_ok += r.intent==c['expected_intent']
    got={s.id for s in r.sources[:6]}; exp=set(c['expected_docs'])
    recall.append(len(got&exp)/len(exp))
    if r.intent==c['expected_intent'] and len(got&exp)>=1: passed+=1
print(json.dumps({'cases':len(gold),'intent_accuracy':intent_ok/len(gold),'mean_expected_doc_recall_at_6':sum(recall)/len(recall),'scenario_gate_passed':passed},indent=2))
if intent_ok!=len(gold) or min(recall)==0: raise SystemExit(1)
