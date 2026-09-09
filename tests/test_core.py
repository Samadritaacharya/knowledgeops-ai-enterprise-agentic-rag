import json, unittest
from pathlib import Path
from src.knowledgeops.retrieval import load_corpus, hybrid_search, fingerprint
from src.knowledgeops.workflow import run, classify

class KnowledgeOpsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.corpus=load_corpus(); cls.gold=json.loads(Path('evaluation/goldset.json').read_text())
    def test_60_gold_intents(self):
        self.assertEqual(len(self.gold),60)
        for c in self.gold: self.assertEqual(classify(c['question']),c['expected_intent'],c['id'])
    def test_60_gold_retrieval_has_expected_source(self):
        for c in self.gold:
            hits=hybrid_search(c['question'],self.corpus,6); got={h.id for h in hits}; self.assertTrue(got.intersection(c['expected_docs']),c['id'])
    def test_compare_is_grounded(self):
        r=run('Compare Alpha and Beta on technical fit, price, lead time and warranty.')
        self.assertEqual(r.intent,'compare'); self.assertIn('SUP-ALPHA-SPEC',r.citations); self.assertGreaterEqual(len(r.sources),4)
    def test_brief_requires_human_approval(self):
        r=run('Create a sourcing decision brief for Alpha versus Beta.')
        self.assertTrue(r.approval_required); self.assertEqual(r.status,'approval_required'); self.assertEqual(r.decision_pack['approval'],'pending')
        a=run('Create a sourcing decision brief for Alpha versus Beta.',approved=True)
        self.assertFalse(a.approval_required); self.assertEqual(a.decision_pack['approval'],'approved')
    def test_revision_path(self):
        r=run('What changed from Project Orion revision A to revision B?')
        self.assertEqual(r.intent,'revision'); self.assertIn('SPEC-REV-A',r.citations); self.assertIn('SPEC-REV-B',r.citations)
    def test_gap_path_records_unsupported(self):
        r=run('Which requirements are unsupported by evidence for Supplier Alpha?')
        self.assertGreaterEqual(len(r.unsupported_claims),2)
    def test_high_retrieval_is_deterministic(self):
        a=hybrid_search('Supplier Alpha security update warranty',self.corpus,5); b=hybrid_search('Supplier Alpha security update warranty',self.corpus,5)
        self.assertEqual(fingerprint(a),fingerprint(b)); self.assertEqual([x.id for x in a],[x.id for x in b])
    def test_off_domain_does_not_fabricate_external_data(self):
        r=run('What was the weather in Berlin yesterday?')
        valid={d.id for d in self.corpus}; self.assertTrue(set(r.citations).issubset(valid))

if __name__=='__main__': unittest.main()
