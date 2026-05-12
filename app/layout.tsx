import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PostHogProvider } from './providers/posthog';

export const metadata: Metadata = {
  title: '心遇 · 同城找搭子',
  description: '同城找搭子，马上约起来',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '心遇',
  },
  icons: {
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0A18',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <PostHogProvider>
          <div className="max-w-[480px] mx-auto min-h-screen relative">
            {children}
          </div>
        </PostHogProvider>
      </body>
    </html>
  );
}
