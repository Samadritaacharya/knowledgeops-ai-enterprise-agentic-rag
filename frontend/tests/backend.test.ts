import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { executeDecision, executeQuery, runtimeMode } from '../lib/backend.ts';

const originalFetch = globalThis.fetch;
const originalUrl = process.env.KNOWLEDGEOPS_API_URL;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalUrl === undefined) delete process.env.KNOWLEDGEOPS_API_URL;
  else process.env.KNOWLEDGEOPS_API_URL = originalUrl;
});

test('zero-key mode stays deterministic and requires no backend', async () => {
  delete process.env.KNOWLEDGEOPS_API_URL;
  assert.equal(runtimeMode(), 'deterministic-public-demo');
  const result = await executeQuery('Compare Alpha and Beta on price and warranty.');
  assert.equal(result.runtime_mode, 'deterministic-public-demo');
  assert.equal(result.intent, 'compare');
  assert.equal(result.thread_id, null);
  assert.ok(result.sources.length > 0);
});

test('connected mode maps LangGraph state and preserves thread identity', async () => {
  process.env.KNOWLEDGEOPS_API_URL = 'http://backend.example/';
  let seenUrl = '';
  globalThis.fetch = (async (url: string | URL | Request) => {
    seenUrl = String(url);
    return new Response(JSON.stringify({
      thread_id: 'thread-12345',
      status: 'approval_required',
      state: {
        question: 'Create a sourcing decision brief for Alpha versus Beta.',
        intent: 'brief',
        source_ids: ['SUP-ALPHA', 'SUP-BETA'],
        sources: [{ id: 'SUP-ALPHA', title: 'Alpha', type: 'supplier_spec', revision: '1', score: 0.91, snippet: 'evidence' }],
        answer: 'Draft recommendation',
        citations: ['SUP-ALPHA'],
        unsupported_claims: [],
      },
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;

  const result = await executeQuery('Create a sourcing decision brief for Alpha versus Beta.');
  assert.equal(seenUrl, 'http://backend.example/v1/graph/query');
  assert.equal(result.runtime_mode, 'langgraph-fastapi');
  assert.equal(result.thread_id, 'thread-12345');
  assert.equal(result.approval_required, true);
  assert.equal(result.sources[0].id, 'SUP-ALPHA');
});

test('connected decision resumes the same LangGraph thread', async () => {
  process.env.KNOWLEDGEOPS_API_URL = 'http://backend.example';
  let payload: any;
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    payload = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({
      thread_id: 'thread-12345',
      status: 'completed',
      state: {
        question: 'Create a sourcing decision brief for Alpha versus Beta.',
        intent: 'brief',
        source_ids: ['SUP-ALPHA'],
        sources: [],
        answer: 'Human-edited recommendation',
        citations: ['SUP-ALPHA'],
        unsupported_claims: [],
        approval: { decision: 'edit', edited_text: 'Human-edited recommendation' },
      },
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;

  const result = await executeDecision({
    question: 'Create a sourcing decision brief for Alpha versus Beta.',
    threadId: 'thread-12345',
    decision: 'edit',
    editedText: 'Human-edited recommendation',
  });
  assert.deepEqual(payload, {
    thread_id: 'thread-12345',
    decision: 'edit',
    edited_text: 'Human-edited recommendation',
  });
  assert.equal(result.thread_id, 'thread-12345');
  assert.equal(result.decision_pack?.approval, 'edited');
  assert.equal(result.answer, 'Human-edited recommendation');
});
