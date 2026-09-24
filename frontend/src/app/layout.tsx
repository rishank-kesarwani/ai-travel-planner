import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '../lib/query-provider';
import { AuthProvider } from '../lib/auth-context';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const metadata: Metadata = {
  title: 'NomadAI - Production AI Travel Planner & Agentic Orchestrator',
  description:
    'Experience next-generation autonomous travel planning powered by LangGraph workflows, vector RAG citations, and real-time streaming intelligence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col antialiased bg-slate-950 text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
