import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '附近搭子 - 同城找搭子',
  description: '吃饭、运动、看电影、打游戏，快速找到附近合拍的人',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF6B35',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="mx-auto min-h-screen max-w-[480px] bg-[#F7F7F8] relative">
          {children}
        </div>
      </body>
    </html>
  );
}
