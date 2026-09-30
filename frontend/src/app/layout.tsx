import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { QueryProvider } from '../lib/query-provider';
import { AuthProvider } from '../lib/auth-context';
import { CurrencyProvider } from '../lib/currency-context';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  title: 'PlannerTravel - Autonomous AI Travel Planner & Intelligence Assistant',
  description:
    'Experience next-generation autonomous travel planning powered by LangGraph workflows, vector RAG citations, real-time multi-currency intelligence, and verified partner rates.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: ['/favicon.png'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'PlannerTravel - Autonomous AI Travel Planner',
    description: 'Next-generation AI travel planning with real-time SSE streaming and RAG memory.',
    images: [{ url: '/logo.png', width: 1024, height: 1024, alt: 'PlannerTravel Logo' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {adsenseClientId && (
          <Script
            id="adsbygoogle-init"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <Script
          id="travelpayouts-drive-script"
          async
          src="https://tpembars.com/NTc5NjI5.js?t=579629"
          strategy="afterInteractive"
          data-cmp-ab="2"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-slate-950 text-slate-100 selection:bg-teal-500/30 selection:text-teal-200 overflow-x-hidden">
        <QueryProvider>
          <AuthProvider>
            <CurrencyProvider>
              <Navbar />
              <main className="flex-1 max-w-7xl 3xl:max-w-[1600px] 4k:max-w-[2000px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
                {children}
              </main>
              <Footer />
            </CurrencyProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

