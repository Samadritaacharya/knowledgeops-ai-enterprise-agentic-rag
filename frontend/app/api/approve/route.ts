import { NextResponse } from 'next/server';
import {
  BackendRequestError,
  executeDecision,
  runtimeMode,
  type HumanDecision,
} from '../../../lib/backend';
import { logOperation } from '../../../lib/observability';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const startedAt = Date.now();
  const len = Number(req.headers.get('content-length') || 0);
  if (len > 32768) {
    logOperation({ operation: 'approve', startedAt, httpStatus: 413, error: 'payload too large' });
    return NextResponse.json({ error: 'payload too large' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    logOperation({ operation: 'approve', startedAt, httpStatus: 400, error: 'malformed JSON' });
    return NextResponse.json({ error: 'malformed JSON' }, { status: 400 });
  }

  if (!body || Array.isArray(body) || typeof body !== 'object') {
    logOperation({ operation: 'approve', startedAt, httpStatus: 422, error: 'JSON object required' });
    return NextResponse.json({ error: 'JSON object required' }, { status: 422 });
  }

  const data = body as Record<string, unknown>;
  const allowed = new Set(['question', 'thread_id', 'decision', 'edited_text']);
  const bad = Object.keys(data).filter((k) => !allowed.has(k));
  if (bad.length) {
    const error = `Unknown fields: ${bad.join(', ')}`;
    logOperation({ operation: 'approve', startedAt, httpStatus: 422, error });
    return NextResponse.json({ error }, { status: 422 });
  }

  if (
    typeof data.question !== 'string' ||
    data.question.trim().length < 5 ||
    data.question.length > 2000
  ) {
    const error = 'question must be a string between 5 and 2000 characters';
    logOperation({ operation: 'approve', startedAt, httpStatus: 422, error });
    return NextResponse.json({ error }, { status: 422 });
  }

  const decision = (data.decision || 'approve') as HumanDecision;
  if (!['approve', 'reject', 'edit'].includes(decision)) {
    const error = 'decision must be approve, reject or edit';
    logOperation({ operation: 'approve', startedAt, httpStatus: 422, error });
    return NextResponse.json({ error }, { status: 422 });
  }

  if (data.thread_id != null && (typeof data.thread_id !== 'string' || data.thread_id.length < 5)) {
    const error = 'thread_id must be a valid string';
    logOperation({ operation: 'approve', startedAt, httpStatus: 422, error });
    return NextResponse.json({ error }, { status: 422 });
  }

  if (data.edited_text != null && (typeof data.edited_text !== 'string' || data.edited_text.length > 5000)) {
    const error = 'edited_text must be a string up to 5000 characters';
    logOperation({ operation: 'approve', startedAt, httpStatus: 422, error });
    return NextResponse.json({ error }, { status: 422 });
  }

  try {
    const result = await executeDecision({
      question: data.question.trim(),
      threadId: typeof data.thread_id === 'string' ? data.thread_id : null,
      decision,
      editedText: typeof data.edited_text === 'string' ? data.edited_text : undefined,
    });
    logOperation({ operation: 'approve', startedAt, httpStatus: 200, result });
    return NextResponse.json(result, {
      headers: {
        'cache-control': 'no-store',
        'x-knowledgeops-mode': runtimeMode(),
        'x-knowledgeops-approval': 'explicit-human-action',
      },
    });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      logOperation({ operation: 'approve', startedAt, httpStatus: error.status, error: error.message });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logOperation({ operation: 'approve', startedAt, httpStatus: 502, error: 'connected backend unavailable' });
    return NextResponse.json({ error: 'connected backend unavailable' }, { status: 502 });
  }
}
