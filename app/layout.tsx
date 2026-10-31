import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Brightloop — Subscription Management & Recurring Billing',
  description: 'Unified platform for plans, quotations, subscriptions, automated invoices, and recurring billing.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
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
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-[100dvh] bg-ground text-text antialiased flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
        <footer className="border-t border-border bg-ground py-6 text-xs text-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>Brightloop Software — Recurring Billing & Plan Management</div>
            <div className="flex items-center gap-4 text-[12px]">
              <span>Plans &amp; Variants</span>
              <span>•</span>
              <span>Automated Invoicing</span>
              <span>•</span>
              <span>Payment Matching</span>
              <span>•</span>
              <span>Revenue Reporting</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
