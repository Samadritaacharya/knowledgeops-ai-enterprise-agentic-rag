'use client';

import { motion, useScroll, useSpring } from 'motion/react';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

const EvidenceScene = dynamic(() => import('./evidence-scene'), { ssr: false });
const presets = [
  'Which supplier meets all mandatory gateway requirements at the lower unit cost?',
  'Compare Alpha and Beta on technical fit, price, lead time and warranty.',
  'Which requirements are unsupported by evidence for Supplier Alpha?',
  'What changed from Project Orion revision A to revision B?',
  'Create a sourcing decision brief for Alpha versus Beta.',
];

type Result = any;
type Decision = 'approve' | 'reject' | 'edit';

export default function CommandCenter() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 110, damping: 30 });
  const [q, setQ] = useState(presets[0]);
  const [r, setR] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  function record(result: Result) {
    setR(result);
    setHistory((h) => [
      {
        question: q,
        intent: result.intent,
        status: result.status,
        runtime: result.runtime_mode,
        ts: new Date().toISOString(),
      },
      ...h,
    ].slice(0, 6));
  }

  async function post(path: string, body: Record<string, unknown>) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
    return json;
  }

  async function run() {
    setBusy(true);
    setError('');
    try {
      const result = await post('/api/query', { question: q });
      setEditText(result.answer || '');
      record(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Query failed');
    } finally {
      setBusy(false);
    }
  }

  async function decide(decision: Decision) {
    setBusy(true);
    setError('');
    try {
      const result = await post('/api/approve', {
        question: q,
        thread_id: r?.thread_id || undefined,
        decision,
        edited_text: decision === 'edit' ? editText : undefined,
      });
      record(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Decision action failed');
    } finally {
      setBusy(false);
    }
  }

  const metrics = useMemo(
    () => r
      ? [
          [r.intent, 'Intent'],
          [r.sources?.length ?? 0, 'Sources'],
          [r.citations?.length ?? 0, 'Citations'],
          [r.status, 'State'],
        ]
      : [
          ['60', 'Gold cases'],
          ['Hybrid', 'Retrieval'],
          ['HITL', 'Decision gate'],
          ['0 €', 'Required API'],
        ],
    [r],
  );

  const runtimeLabel = r?.runtime_mode === 'langgraph-fastapi'
    ? 'connected LangGraph'
    : 'zero-key public mode';

  return (
    <main>
      <motion.div className="scrollbar" style={{ scaleX }} />
      <div className="aurora a1" />
      <div className="aurora a2" />
      <nav>
        <a href="#top" className="brand">KnowledgeOps<span>AI</span></a>
        <div><a href="#workspace">Workspace</a><a href="#evidence">Evidence</a><a href="#architecture">Architecture</a></div>
      </nav>

      <section id="top" className="hero">
        <div className="heroCopy">
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="eyebrow">ENTERPRISE AGENTIC RAG · LANGCHAIN · LANGGRAPH</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>Turn enterprise knowledge into <em>evidence-backed decisions.</em></motion.h1>
          <p className="lede">A production-style RAG and decision-intelligence lab for engineering and procurement teams: hybrid retrieval, citations, evidence gaps, revision analysis, human approval, evaluation and an optional local LLM path.</p>
          <div className="chips"><span>LangChain</span><span>LangGraph</span><span>Qdrant-ready</span><span>FastAPI</span><span>Human-in-the-loop</span><span>60-case eval</span></div>
        </div>
        <EvidenceScene />
      </section>

      <section className="ticker"><div>INGEST → CHUNK → EMBED → HYBRID RETRIEVE → RERANK → LANGGRAPH → EVIDENCE → HUMAN GATE → DECISION PACK</div></section>

      <section id="workspace" className="workspace">
        <motion.div className="panel query" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="panelHead"><div><span>01</span><h2>Decision workspace</h2></div><b>{runtimeLabel}</b></div>
          <label>Business question</label>
          <textarea value={q} onChange={(e) => setQ(e.target.value)} rows={4} />
          <div className="presets">{presets.map((p) => <button key={p} onClick={() => setQ(p)}>{p}</button>)}</div>
          <button className="run" disabled={busy} onClick={run}>{busy ? 'Orchestrating…' : 'Run agentic RAG →'}</button>
          {error && <p className="requestError">{error}</p>}
        </motion.div>

        <div className="metrics">{metrics.map(([v, l]: any) => <motion.div key={String(l)} layout className="metric"><strong>{String(v)}</strong><span>{l}</span></motion.div>)}</div>

        {r && <motion.div className="panel result" initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="panelHead"><div><span>02</span><h2>Evidence-backed result</h2></div><b className={r.approval_required || r.status === 'rejected' ? 'warn' : 'ok'}>{r.status}</b></div>
          <p className="answer">{r.answer}</p>
          {r.approval_required && <div className="approval">
            <div className="approvalCopy">
              <b>Human review required</b>
              <p>This LangGraph decision brief remains a draft until a reviewer approves, edits or rejects it.</p>
              <textarea aria-label="Edited recommendation" value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} />
            </div>
            <div className="approvalActions">
              <button disabled={busy} onClick={() => decide('approve')}>Approve</button>
              <button disabled={busy} onClick={() => decide('edit')}>Approve edit</button>
              <button className="rejectAction" disabled={busy} onClick={() => decide('reject')}>Reject</button>
            </div>
          </div>}
          <div className="trace">{r.trace?.map((t: any, i: number) => <div key={i}><span>{String(i + 1).padStart(2, '0')}</span><b>{t.node}</b><small>{t.detail}</small></div>)}</div>
        </motion.div>}
      </section>

      <section id="evidence" className="evidence">
        <div className="sectionTitle"><span>Evidence layer</span><h2>Every answer should show where it came from.</h2><p>The public demo deliberately keeps retrieval and citations deterministic. When a FastAPI backend is configured, the same UI uses the real stateful LangGraph execution and its retrieved evidence; optional LLM generation still cannot invent sources or bypass human authority.</p></div>
        <div className="sourceGrid">{(r?.sources || []).map((s: any) => <motion.article key={s.id} whileHover={{ y: -5 }}><div><b>{s.id}</b><span>{Number(s.score).toFixed(3)}</span></div><h3>{s.title}</h3><p>{s.snippet}</p><small>{s.type} · rev {s.revision}</small></motion.article>)}{!r && <article className="empty">Run a query to inspect retrieval evidence, ranking scores and citations.</article>}</div>
        {r?.unsupported_claims?.length > 0 && <div className="gaps"><h3>Evidence gaps</h3>{r.unsupported_claims.map((x: string) => <p key={x}>◇ {x}</p>)}</div>}
      </section>

      <section id="architecture" className="architecture">
        <div className="sectionTitle"><span>Architecture</span><h2>Business-facing UX, engineering-grade internals.</h2></div>
        <div className="archflow">{['Documents', 'LangChain ingestion', 'Qdrant-ready vectors', 'BM25 + dense hybrid', 'Reranker', 'LangGraph state machine', 'Evidence analyst', 'HITL approval', 'Decision pack'].map((x, i) => <div key={x}><span>{String(i + 1).padStart(2, '0')}</span><b>{x}</b></div>)}</div>
        <div className="principles"><article><b>Model ≠ authority</b><p>LLMs can improve wording. Retrieval evidence and human approval remain authoritative.</p></article><article><b>Evaluation before claims</b><p>60 checked-in scenarios test intent routing and expected-source retrieval.</p></article><article><b>Free by default</b><p>No paid API is required. Optional Ollama and local Qdrant adapters are included.</p></article></div>
      </section>

      <section className="history">
        <div className="sectionTitle"><span>Session trail</span><h2>Recent runs</h2></div>
        {history.map((h, i) => <div key={i}><b>{h.intent}</b><span>{h.question}</span><small>{h.status} · {h.runtime === 'langgraph-fastapi' ? 'LangGraph' : 'demo'}</small></div>)}
      </section>

      <footer><b>KnowledgeOps AI</b><span>Synthetic enterprise data · portfolio-safe · no confidential information</span></footer>
    </main>
  );
}
