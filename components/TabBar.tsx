'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const tabs = [
  { href: '/',     label: '首页',   icon: '🏠' },
  { href: '/post', label: '发布',   icon: '➕', primary: true },
  { href: '/mine', label: '我的',   icon: '👤' },
];

export default function TabBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <div className="h-16" />
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px]
                      bg-white border-t border-gray-100 flex safe-bottom z-40">
        {tabs.map((t) => {
          const active = pathname === t.href;
          if (t.primary) {
            return (
              <button
                key={t.href}
                onClick={() => router.push(t.href)}
                className="flex-1 flex flex-col items-center justify-center py-2"
              >
                <span className="w-11 h-11 rounded-full bg-brand text-white flex items-center
                                 justify-center text-2xl -mt-6 shadow-lg shadow-brand/40">
                  {t.icon}
                </span>
                <span className="text-xs mt-1 text-gray-500">{t.label}</span>
              </button>
            );
          }
          return (
            <Link key={t.href} href={t.href}
              className={`flex-1 flex flex-col items-center justify-center py-2
                          ${active ? 'text-brand' : 'text-gray-500'}`}>
              <span className="text-xl">{t.icon}</span>
              <span className="text-xs mt-0.5">{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
