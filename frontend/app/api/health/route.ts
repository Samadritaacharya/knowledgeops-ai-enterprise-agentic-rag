import { NextResponse } from 'next/server';
import { backendConfigured, runtimeMode } from '../../../lib/backend';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'knowledgeops-ai',
      paid_api_required: false,
      public_demo: 'deterministic-hybrid-rag',
      langgraph_reference_backend: true,
      backend_configured: backendConfigured(),
      runtime_mode: runtimeMode(),
      evaluation_cases: 60,
      deployment_sha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      deployment_url: process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || null,
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}
