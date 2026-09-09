import { NextResponse } from 'next/server';
import { BackendRequestError, executeQuery, runtimeMode } from '../../../lib/backend';
import { logOperation } from '../../../lib/observability';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const startedAt = Date.now();
  const len = Number(req.headers.get('content-length') || 0);
  if (len > 32768) {
    logOperation({ operation: 'query', startedAt, httpStatus: 413, error: 'payload too large' });
    return NextResponse.json({ error: 'payload too large' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    logOperation({ operation: 'query', startedAt, httpStatus: 400, error: 'malformed JSON' });
    return NextResponse.json({ error: 'malformed JSON' }, { status: 400 });
  }

  if (!body || Array.isArray(body) || typeof body !== 'object') {
    logOperation({ operation: 'query', startedAt, httpStatus: 422, error: 'JSON object required' });
    return NextResponse.json({ error: 'JSON object required' }, { status: 422 });
  }

  const data = body as Record<string, unknown>;
  const allowed = new Set(['question']);
  const bad = Object.keys(data).filter((k) => !allowed.has(k));
  if (bad.length) {
    const error = `Unknown fields: ${bad.join(', ')}`;
    logOperation({ operation: 'query', startedAt, httpStatus: 422, error });
    return NextResponse.json({ error }, { status: 422 });
  }

  if (
    typeof data.question !== 'string' ||
    data.question.trim().length < 5 ||
    data.question.length > 2000
  ) {
    const error = 'question must be a string between 5 and 2000 characters';
    logOperation({ operation: 'query', startedAt, httpStatus: 422, error });
    return NextResponse.json({ error }, { status: 422 });
  }

  try {
    const result = await executeQuery(data.question.trim());
    logOperation({ operation: 'query', startedAt, httpStatus: 200, result });
    return NextResponse.json(result, {
      headers: {
        'cache-control': 'no-store',
        'x-knowledgeops-mode': runtimeMode(),
      },
    });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      logOperation({ operation: 'query', startedAt, httpStatus: error.status, error: error.message });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logOperation({ operation: 'query', startedAt, httpStatus: 502, error: 'connected backend unavailable' });
    return NextResponse.json({ error: 'connected backend unavailable' }, { status: 502 });
  }
}
