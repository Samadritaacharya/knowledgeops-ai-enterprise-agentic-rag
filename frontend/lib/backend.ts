import { runQuery } from './engine.ts';

export type HumanDecision = 'approve' | 'reject' | 'edit';
export type RuntimeMode = 'deterministic-public-demo' | 'langgraph-fastapi';

export class BackendRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'BackendRequestError';
    this.status = status;
  }
}

function backendUrl() {
  return (process.env.KNOWLEDGEOPS_API_URL || '').trim().replace(/\/+$/, '');
}

export function runtimeMode(): RuntimeMode {
  return backendUrl() ? 'langgraph-fastapi' : 'deterministic-public-demo';
}

async function readJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new BackendRequestError(502, 'backend returned malformed JSON');
  }
}

function traceFromGraph(state: any, status: string) {
  const trace = [
    { node: 'classify', detail: state.intent || 'unknown' },
    { node: 'retrieve', detail: (state.source_ids || []).join(', ') },
    { node: 'synthesize', detail: (state.citations || []).join(', ') },
  ];
  if (state.intent === 'brief') {
    const decision = state.approval?.decision;
    trace.push({
      node: 'human_gate',
      detail: status === 'approval_required' ? 'approval required' : decision || status,
    });
  }
  trace.push({ node: 'complete', detail: status });
  return trace;
}

function normalizeGraphResponse(graph: any, question: string) {
  const state = graph?.state || {};
  const status = graph?.status || 'completed';
  const approval = state.approval?.decision;
  const decisionApproval =
    status === 'approval_required'
      ? 'pending'
      : approval === 'approve'
        ? 'approved'
        : approval === 'edit'
          ? 'edited'
          : approval === 'reject'
            ? 'rejected'
            : 'completed';

  return {
    question: state.question || question,
    intent: state.intent || 'qa',
    status,
    answer: state.answer || '',
    citations: state.citations || [],
    sources: state.sources || [],
    unsupported_claims: state.unsupported_claims || [],
    approval_required: status === 'approval_required',
    decision_pack:
      state.intent === 'brief'
        ? {
            recommendation: state.answer || '',
            citations: state.citations || [],
            approval: decisionApproval,
          }
        : null,
    trace: traceFromGraph(state, status),
    thread_id: graph?.thread_id || null,
    runtime_mode: 'langgraph-fastapi' as const,
  };
}

function localDecision(question: string, decision: HumanDecision, editedText?: string) {
  const pending = runQuery(question, false);
  if (!pending.approval_required) {
    throw new BackendRequestError(409, 'only pending decision briefs can be reviewed');
  }

  if (decision === 'reject') {
    return {
      ...pending,
      status: 'rejected',
      approval_required: false,
      decision_pack: pending.decision_pack
        ? { ...pending.decision_pack, approval: 'rejected' }
        : null,
      trace: [
        ...pending.trace.filter((x) => x.node !== 'complete'),
        { node: 'human_gate', detail: 'reject' },
        { node: 'complete', detail: 'rejected' },
      ],
      thread_id: null,
      runtime_mode: 'deterministic-public-demo' as const,
    };
  }

  const completed = runQuery(question, true);
  if (decision === 'edit') {
    if (!editedText?.trim()) {
      throw new BackendRequestError(422, 'edited_text is required when decision=edit');
    }
    const answer = editedText.trim();
    return {
      ...completed,
      answer,
      decision_pack: completed.decision_pack
        ? { ...completed.decision_pack, recommendation: answer, approval: 'edited' }
        : null,
      trace: completed.trace.map((x) =>
        x.node === 'human_gate' ? { ...x, detail: 'edit' } : x,
      ),
      thread_id: null,
      runtime_mode: 'deterministic-public-demo' as const,
    };
  }

  return {
    ...completed,
    thread_id: null,
    runtime_mode: 'deterministic-public-demo' as const,
  };
}

export async function executeQuery(question: string) {
  const base = backendUrl();
  if (!base) {
    return {
      ...runQuery(question, false),
      thread_id: null,
      runtime_mode: 'deterministic-public-demo' as const,
    };
  }

  const res = await fetch(`${base}/v1/graph/query`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question }),
    cache: 'no-store',
  });
  const json = await readJson(res);
  if (!res.ok) {
    throw new BackendRequestError(res.status, json?.detail || json?.error || 'backend query failed');
  }
  return normalizeGraphResponse(json, question);
}

export async function executeDecision(input: {
  question: string;
  threadId?: string | null;
  decision: HumanDecision;
  editedText?: string;
}) {
  const base = backendUrl();
  if (!base) {
    return localDecision(input.question, input.decision, input.editedText);
  }
  if (!input.threadId) {
    throw new BackendRequestError(422, 'thread_id is required in connected LangGraph mode');
  }

  const payload: Record<string, string> = {
    thread_id: input.threadId,
    decision: input.decision,
  };
  if (input.decision === 'edit') {
    if (!input.editedText?.trim()) {
      throw new BackendRequestError(422, 'edited_text is required when decision=edit');
    }
    payload.edited_text = input.editedText.trim();
  }

  const res = await fetch(`${base}/v1/graph/resume`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const json = await readJson(res);
  if (!res.ok) {
    throw new BackendRequestError(res.status, json?.detail || json?.error || 'backend decision failed');
  }
  return normalizeGraphResponse(json, input.question);
}
