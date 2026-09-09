import { NextResponse } from 'next/server';
import {
  BackendRequestError,
  executeDecision,
  runtimeMode,
  type HumanDecision,
} from '../../../lib/backend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const len = Number(req.headers.get('content-length') || 0);
  if (len > 32768) return NextResponse.json({ error: 'payload too large' }, { status: 413 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'malformed JSON' }, { status: 400 });
  }

  if (!body || Array.isArray(body) || typeof body !== 'object') {
    return NextResponse.json({ error: 'JSON object required' }, { status: 422 });
  }
  const allowed = new Set(['question', 'thread_id', 'decision', 'edited_text']);
  const bad = Object.keys(body).filter((k) => !allowed.has(k));
  if (bad.length) {
    return NextResponse.json({ error: `Unknown fields: ${bad.join(', ')}` }, { status: 422 });
  }
  if (
    typeof body.question !== 'string' ||
    body.question.trim().length < 5 ||
    body.question.length > 2000
  ) {
    return NextResponse.json(
      { error: 'question must be a string between 5 and 2000 characters' },
      { status: 422 },
    );
  }

  const decision = (body.decision || 'approve') as HumanDecision;
  if (!['approve', 'reject', 'edit'].includes(decision)) {
    return NextResponse.json({ error: 'decision must be approve, reject or edit' }, { status: 422 });
  }
  if (body.thread_id != null && (typeof body.thread_id !== 'string' || body.thread_id.length < 5)) {
    return NextResponse.json({ error: 'thread_id must be a valid string' }, { status: 422 });
  }
  if (body.edited_text != null && (typeof body.edited_text !== 'string' || body.edited_text.length > 5000)) {
    return NextResponse.json({ error: 'edited_text must be a string up to 5000 characters' }, { status: 422 });
  }

  try {
    const result = await executeDecision({
      question: body.question.trim(),
      threadId: body.thread_id || null,
      decision,
      editedText: body.edited_text,
    });
    return NextResponse.json(result, {
      headers: {
        'cache-control': 'no-store',
        'x-knowledgeops-mode': runtimeMode(),
        'x-knowledgeops-approval': 'explicit-human-action',
      },
    });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'connected backend unavailable' }, { status: 502 });
  }
}
