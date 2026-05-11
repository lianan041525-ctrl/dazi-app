'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const ADMIN_UID = '025c3bf4-1e7c-41ce-8bf8-3a956cf40498';

const MENU = [
  { label: '数据面板', href: '/admin', icon: '📊' },
  { label: '用户管理', href: '/admin/users', icon: '👥' },
  { label: '导航配置', href: '/admin/nav', icon: '🔧' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabaseBrowser().auth.getUser().then(({ data: { user } }) => {
      if (!user || user.id !== ADMIN_UID) { router.push('/'); return; }
      setAuth(true);
    });
  }, []);

  if (!auth) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A18' }}>
      <div className="text-white/30 text-sm">验证中...</div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A18' }}>
      {/* 侧边栏 - 桌面 */}
      <aside className="hidden md:flex flex-col w-52 shrink-0 sticky top-0 h-screen"
        style={{ background: 'rgba(255,255,255,0.03)', borderRight: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="text-white font-bold text-base">搭子后台</div>
          <div className="text-white/30 text-xs mt-0.5">管理控制台</div>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {MENU.map(item => (
            <a key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
              style={{
                background: pathname === item.href ? 'linear-gradient(135deg,rgba(255,107,157,0.15),rgba(192,38,211,0.15))' : 'transparent',
                color: pathname === item.href ? '#fff' : 'rgba(255,255,255,0.5)',
                border: pathname === item.href ? '1px solid rgba(255,107,157,0.2)' : '1px solid transparent',
              }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="px-5 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <a href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">← 返回前台</a>
        </div>
      </aside>

      {/* 移动端顶部导航 */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 flex items-center px-4 h-12"
        style={{ background: 'rgba(10,10,24,0.95)', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-white/60 mr-3 text-lg">☰</button>
        <span className="text-white font-medium text-sm flex-1">
          {MENU.find(m => m.href === pathname)?.label || '后台管理'}
        </span>
        <a href="/" className="text-white/30 text-xs">前台</a>
      </div>

      {/* 移动端抽屉菜单 */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-30" onClick={() => setMenuOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-52 flex flex-col"
            style={{ background: '#0F0F20', borderRight: '0.5px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}>
            <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="text-white font-bold">搭子后台</div>
            </div>
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              {MENU.map(item => (
                <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm"
                  style={{
                    background: pathname === item.href ? 'linear-gradient(135deg,rgba(255,107,157,0.15),rgba(192,38,211,0.15))' : 'transparent',
                    color: pathname === item.href ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}>
                  <span>{item.icon}</span><span>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <main className="flex-1 md:pt-0 pt-12 overflow-auto">
        {children}
      </main>
    </div>
  );
}
