import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ClientProviders from '@/components/providers';
import SiteHeader from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteHeader';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ShopBridge — Proxy Ordering from Daraz & AliExpress',
  description: 'Browse and order products from Daraz and AliExpress with our convenient proxy ordering system. 5% markup, $5 delivery, cash on delivery.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <ClientProviders>
          {/* Show header on non-admin pages */}
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ClientProviders>
      </body>
    </html>
  );
}
