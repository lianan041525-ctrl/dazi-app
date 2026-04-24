'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TabBar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isMessages = pathname?.startsWith('/messages');
  const isMine = pathname?.startsWith('/mine');

  const TabItem = ({
    href, label, icon, active,
  }: { href: string; label: string; icon: string; active: boolean }) => (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full active:opacity-60 transition"
    >
      <span
        className="text-[20px] leading-none transition"
        style={{
          filter: active ? 'none' : 'grayscale(0.4)',
          opacity: active ? 1 : 0.55,
        }}
      >
        {icon}
      </span>
      <span
        className="text-[10px] font-medium transition"
        style={{
          color: active ? '#fff' : 'rgba(255,255,255,0.5)',
        }}
      >
        {label}
      </span>
    </Link>
  );

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(10, 10, 24, 0.85)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderTop: '0.5px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* 相对定位容器,让中间 CTA 可以绝对居中 */}
      <div className="relative h-[58px] flex items-center">
        {/* 左半区:发现 + 消息 */}
        <div className="flex-1 flex h-full pr-[32px]">
          <TabItem href="/" label="发现" icon="🏠" active={!!isHome} />
          <TabItem href="/messages" label="消息" icon="💬" active={!!isMessages} />
        </div>

        {/* 右半区:我的(左侧留给另一个 tab 占位,保持对称) */}
        <div className="flex-1 flex h-full pl-[32px]">
          <div className="flex-1" />
          <TabItem href="/mine" label="我的" icon="👤" active={!!isMine} />
        </div>

        {/* 中间发布按钮(绝对居中) */}
        <Link
          href="/post"
          className="absolute left-1/2 -translate-x-1/2 -top-5 active:scale-95 transition"
          aria-label="发布"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FF6B9D 0%, #C026D3 50%, #FF8C35 100%)',
              boxShadow: '0 6px 18px rgba(255, 107, 157, 0.45), 0 0 0 3px rgba(10, 10, 24, 0.85)',
            }}
          >
            <span className="text-white text-xl font-light leading-none select-none">+</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
