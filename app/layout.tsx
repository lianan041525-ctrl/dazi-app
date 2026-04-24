import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '附近搭子 · 今晚和谁一起',
  description: '同城找搭子,马上约起来',
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
        <div className="max-w-[480px] mx-auto min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  );
}
