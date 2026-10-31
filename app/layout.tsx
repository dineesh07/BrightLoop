import './globals.css';
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Brightloop — Subscription Management & Billing',
  description: 'Unified software platform that runs the full life of a subscription business.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ground text-text antialiased flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-5 sm:px-6 py-6">
          {children}
        </main>
        <footer className="border-t border-border bg-ground py-4 text-xs text-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>Brightloop Software — Recurring Billing & Plan Management</div>
            <div className="flex items-center gap-4">
              <span>Sub-2s Query Engine</span>
              <span>Idempotent Billing</span>
              <span>Role-Based Access Control</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
