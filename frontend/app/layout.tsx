import type { Metadata } from 'next';
import './globals.css';
import './professional.css';

const siteUrl = 'https://knowledgeops-ai-enterprise-agentic-six.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'KnowledgeOps AI — Enterprise Agentic RAG Platform',
  description: 'Evidence-backed enterprise RAG with hybrid retrieval, LangGraph human approval, reproducible evaluation and a live zero-key demo.',
  keywords: [
    'Agentic RAG',
    'LangGraph',
    'LangChain',
    'FastAPI',
    'Qdrant',
    'human in the loop',
    'enterprise AI',
    'RAG evaluation',
    'AI governance',
  ],
  authors: [{ name: 'Samadrita Acharya', url: 'https://github.com/Samadritaacharya' }],
  creator: 'Samadrita Acharya',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'KnowledgeOps AI — Enterprise Agentic RAG Platform',
    description: 'From enterprise knowledge to evidence-backed decisions with citations, evaluation and accountable human approval.',
    siteName: 'KnowledgeOps AI',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KnowledgeOps AI — Enterprise Agentic RAG Platform',
    description: 'Live enterprise RAG portfolio project with hybrid retrieval, LangGraph HITL and reproducible evaluation.',
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
