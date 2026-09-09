import type { QueryResult } from './contracts.ts';

export type Operation = 'query' | 'approve';

export function logOperation(input: {
  operation: Operation;
  startedAt: number;
  httpStatus: number;
  result?: QueryResult;
  error?: string;
}) {
  const payload = {
    event: 'knowledgeops.request',
    operation: input.operation,
    runtime: input.result?.runtime_mode ?? null,
    intent: input.result?.intent ?? null,
    result_status: input.result?.status ?? 'error',
    source_count: input.result?.sources.length ?? 0,
    approval_required: input.result?.approval_required ?? false,
    http_status: input.httpStatus,
    duration_ms: Date.now() - input.startedAt,
    deployment_sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || null,
    error: input.error || null,
  };

  console.info(JSON.stringify(payload));
}
