'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavConfig } from '@/lib/useNavConfig';

type IconProps = { active: boolean };

const HomeIcon = ({ active }: IconProps) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9.5z"
      stroke={active ? 'url(#homeGrad)' : 'rgba(255,255,255,0.5)'}
      strokeWidth="1.8" strokeLinejoin="round"
      fill={active ? 'url(#homeGrad)' : 'none'} fillOpacity={active ? 0.15 : 0} />
    <defs><linearGradient id="homeGrad" x1="0" y1="0" x2="24" y2="24">
      <stop offset="0%" stopColor="#FF6B9D" /><stop offset="100%" stopColor="#C026D3" />
    </linearGradient></defs>
  </svg>
);

const MessageIcon = ({ active }: IconProps) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H9l-4 4v-4H6a2 2 0 01-2-2V6z"
      stroke={active ? 'url(#msgGrad)' : 'rgba(255,255,255,0.5)'}
      strokeWidth="1.8" strokeLinejoin="round"
      fill={active ? 'url(#msgGrad)' : 'none'} fillOpacity={active ? 0.15 : 0} />
    <defs><linearGradient id="msgGrad" x1="0" y1="0" x2="24" y2="24">
      <stop offset="0%" stopColor="#FF6B9D" /><stop offset="100%" stopColor="#C026D3" />
    </linearGradient></defs>
  </svg>
);

const MatchIcon = ({ active }: IconProps) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"
      stroke={active ? 'url(#matchGrad)' : 'rgba(255,255,255,0.5)'}
      strokeWidth="1.8" strokeLinejoin="round"
      fill={active ? 'url(#matchGrad)' : 'none'} fillOpacity={active ? 0.2 : 0} />
    <circle cx="18" cy="6" r="1.5" fill={active ? '#FFD700' : 'rgba(255,215,0,0.5)'} />
    <defs><linearGradient id="matchGrad" x1="0" y1="0" x2="24" y2="24">
      <stop offset="0%" stopColor="#FF6B9D" /><stop offset="100%" stopColor="#C026D3" />
    </linearGradient></defs>
  </svg>
);

const MineIcon = ({ active }: IconProps) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4"
      stroke={active ? 'url(#mineGrad)' : 'rgba(255,255,255,0.5)'}
      strokeWidth="1.8" fill={active ? 'url(#mineGrad)' : 'none'} fillOpacity={active ? 0.15 : 0} />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"
      stroke={active ? 'url(#mineGrad)' : 'rgba(255,255,255,0.5)'}
      strokeWidth="1.8" strokeLinecap="round" />
    <defs><linearGradient id="mineGrad" x1="0" y1="0" x2="24" y2="24">
      <stop offset="0%" stopColor="#FF6B9D" /><stop offset="100%" stopColor="#C026D3" />
    </linearGradient></defs>
  </svg>
);

const ICON_MAP: Record<string, (active: boolean) => React.ReactNode> = {
  home: (a) => <HomeIcon active={a} />,
  messages: (a) => <MessageIcon active={a} />,
  match: (a) => <MatchIcon active={a} />,
  mine: (a) => <MineIcon active={a} />,
};

const DEFAULT_NAV = [
  { key: 'home', label: '发现', href: '/', sort_order: 1, enabled: true },
  { key: 'messages', label: '消息', href: '/messages', sort_order: 2, enabled: true },
  { key: 'match', label: '匹配', href: '/match', sort_order: 3, enabled: true },
  { key: 'mine', label: '我的', href: '/mine', sort_order: 4, enabled: true },
];

export default function TabBar() {
  const pathname = usePathname();
  const navItems = useNavConfig();
  const items = navItems.length > 0 ? navItems : DEFAULT_NAV;

  const left = items.filter((_, i) => i < 2);
  const right = items.filter((_, i) => i >= 2);

  const TabItem = ({ href, label, icon, active }: {
    href: string; label: string; icon: React.ReactNode; active: boolean;
  }) => (
    <Link href={href} className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full active:opacity-60 transition-opacity">
      <div className="h-[22px] flex items-center">{icon}</div>
      <span className="text-[10px] font-medium leading-none transition-colors"
        style={{ color: active ? '#fff' : 'rgba(255,255,255,0.55)', textShadow: active ? '0 0 8px rgba(255,107,157,0.5)' : 'none' }}>
        {label}
      </span>
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', background: 'rgba(10, 10, 24, 0.88)',
        backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
        borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
      <div className="relative h-[58px] flex items-center">
        <div className="flex-1 flex h-full">
          {left.map(item => {
            const active = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
            return <TabItem key={item.key} href={item.href} label={item.label}
              icon={ICON_MAP[item.key]?.(!!active) ?? <HomeIcon active={!!active} />} active={!!active} />;
          })}
        </div>
        <div className="w-[68px] shrink-0" />
        <div className="flex-1 flex h-full">
          {right.map(item => {
            const active = pathname?.startsWith(item.href);
            return <TabItem key={item.key} href={item.href} label={item.label}
              icon={ICON_MAP[item.key]?.(!!active) ?? <HomeIcon active={!!active} />} active={!!active} />;
          })}
        </div>
        <Link href="/post" className="absolute left-1/2 -translate-x-1/2 -top-4 active:scale-95 transition-transform" aria-label="发布">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #C026D3 50%, #FF8C35 100%)',
              boxShadow: '0 6px 20px rgba(255, 107, 157, 0.5), 0 0 0 3px rgba(10, 10, 24, 0.88)' }}>
            <span className="text-white text-[22px] font-light leading-none select-none">+</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
