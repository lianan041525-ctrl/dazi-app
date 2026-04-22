'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TabBar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isMine = pathname?.startsWith('/mine');

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] safe-bottom z-30"
      style={{ background: 'rgba(15, 11, 30, 0.85)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
      <div className="h-16 flex justify-around items-center px-5">
        <Link href="/" className="text-center flex-1">
          <div className={`w-1.5 h-1.5 rounded-full mx-auto mb-1 ${isHome ? '' : 'bg-white/30'}`}
            style={isHome ? { background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)' } : undefined} />
          <div className={`text-[10px] ${isHome ? 'text-white' : 'text-white/50'}`}>发现</div>
        </Link>

        <Link href="/post" className="flex-shrink-0">
          <div className="btn-gradient w-14 h-14 rounded-full flex items-center justify-center -mt-6"
            style={{ boxShadow: '0 8px 24px rgba(255, 94, 120, 0.5)' }}>
            <span className="text-white text-2xl font-light leading-none">+</span>
          </div>
        </Link>

        <Link href="/mine" className="text-center flex-1">
          <div className={`w-1.5 h-1.5 rounded-full mx-auto mb-1 ${isMine ? '' : 'bg-white/30'}`}
            style={isMine ? { background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)' } : undefined} />
          <div className={`text-[10px] ${isMine ? 'text-white' : 'text-white/50'}`}>我的</div>
        </Link>
      </div>
    </nav>
  );
}
