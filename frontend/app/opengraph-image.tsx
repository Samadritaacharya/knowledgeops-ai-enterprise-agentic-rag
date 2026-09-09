import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'KnowledgeOps AI — Enterprise Agentic RAG Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(135deg,#071019 0%,#0d1b2a 55%,#16142a 100%)',
          color: '#edf5ff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 32, fontWeight: 800 }}>KnowledgeOps AI</div>
          <div style={{ fontSize: 20, color: '#4fe1c1' }}>Enterprise Agentic RAG</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 980 }}>
          <div style={{ fontSize: 70, lineHeight: 1.02, fontWeight: 800, letterSpacing: '-0.04em' }}>
            Evidence-backed decisions. Human authority by design.
          </div>
          <div style={{ fontSize: 28, color: '#a9bdd2' }}>
            LangChain · LangGraph · Hybrid Retrieval · FastAPI · Qdrant · Next.js · 60-case evaluation
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, color: '#91a4ba' }}>
          <span>Samadrita Acharya</span>
          <span>Live verified portfolio project</span>
        </div>
      </div>
    ),
    size,
  );
}
