export type Intent = 'qa' | 'compare' | 'risk' | 'gap' | 'revision' | 'brief';
export type RuntimeMode = 'deterministic-public-demo' | 'langgraph-fastapi';
export type HumanDecision = 'approve' | 'reject' | 'edit';
export type ApprovalState = 'pending' | 'approved' | 'edited' | 'rejected' | 'completed';

export interface EvidenceSource {
  id: string;
  title: string;
  type: string;
  revision: string;
  score: number;
  snippet: string;
}

export interface TraceStep {
  node: string;
  detail: string;
}

export interface DecisionPack {
  recommendation: string;
  citations: string[];
  approval: ApprovalState;
}

export interface CoreQueryResult {
  question: string;
  intent: Intent;
  status: string;
  answer: string;
  citations: string[];
  sources: EvidenceSource[];
  unsupported_claims: string[];
  approval_required: boolean;
  decision_pack: DecisionPack | null;
  trace: TraceStep[];
}

export interface QueryResult extends CoreQueryResult {
  thread_id: string | null;
  runtime_mode: RuntimeMode;
}

export interface GraphApproval {
  decision?: HumanDecision;
  edited_text?: string;
}

export interface GraphState {
  question?: string;
  intent?: Intent;
  source_ids?: string[];
  sources?: EvidenceSource[];
  answer?: string;
  citations?: string[];
  unsupported_claims?: string[];
  approval?: GraphApproval;
}

export interface GraphEnvelope {
  state?: GraphState;
  status?: string;
  thread_id?: string | null;
}

export interface SessionHistoryEntry {
  question: string;
  intent: Intent;
  status: string;
  runtime: RuntimeMode;
  ts: string;
}
