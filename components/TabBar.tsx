'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TabBar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isMessages = pathname?.startsWith('/messages');
  const isMine = pathname?.startsWith('/mine');

  const tabDot = (active: boolean) => (
    <div className={`w-1.5 h-1.5 rounded-full mx-auto mb-1 ${active ? '' : 'bg-white/30'}`}
      style={active ? { background: 'linear-gradient(135deg, #FF6B9D, #C026D3)' } : undefined} />
  );

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] safe-bottom z-30"
      style={{
        background: 'rgba(10, 10, 24, 0.85)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderTop: '0.5px solid rgba(255,255,255,0.08)',
      }}>
      <div className="h-16 flex items-center px-3">
        {/* 发现 */}
        <Link href="/" className="text-center flex-1">
          {tabDot(!!isHome)}
          <div className={`text-[10px] ${isHome ? 'text-white' : 'text-white/50'}`}>发现</div>
        </Link>

        {/* 消息 */}
        <Link href="/messages" className="text-center flex-1">
          {tabDot(!!isMessages)}
          <div className={`text-[10px] ${isMessages ? 'text-white' : 'text-white/50'}`}>消息</div>
        </Link>

        {/* 发布(中间 CTA) */}
        <Link href="/post" className="flex-shrink-0 px-2">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center -mt-6"
            style={{
              background: 'linear-gradient(135deg, #FF6B9D, #C026D3, #FF8C35)',
              boxShadow: '0 8px 24px rgba(255, 107, 157, 0.5)',
            }}
          >
            <span className="text-white text-2xl font-light leading-none">+</span>
          </div>
        </Link>

        {/* 我的 */}
        <Link href="/mine" className="text-center flex-1">
          {tabDot(!!isMine)}
          <div className={`text-[10px] ${isMine ? 'text-white' : 'text-white/50'}`}>我的</div>
        </Link>

        {/* 占位,保持中间按钮居中 */}
        <div className="flex-1" />
      </div>
    </nav>
  );
}
