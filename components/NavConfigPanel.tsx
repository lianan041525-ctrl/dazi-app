'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type NavItem = { id: number; key: string; label: string; href: string; sort_order: number; enabled: boolean };

export default function NavConfigPanel() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabaseBrowser().from('nav_config').select('*').order('sort_order').then(({ data }) => {
      if (data) setItems(data);
    });
  }, []);

  const update = async (id: number, key: string, field: string, value: string | boolean) => {
    setSaving(id + field);
    const { error } = await supabaseBrowser().from('nav_config').update({ [field]: value }).eq('id', id);
    setSaving(null);
    if (error) { setMsg('❌ 保存失败: ' + error.message); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    setMsg('✅ 已保存');
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <section>
      <h2 className="text-xs font-medium text-white/50 mb-3 uppercase tracking-wider">导航栏配置</h2>
      {msg && <div className="text-xs text-center mb-2" style={{ color: msg.startsWith('✅') ? '#4ade80' : '#f87171' }}>{msg}</div>}
      <div className="glass-card divide-y divide-white/5">
        {items.map(item => (
          <div key={item.id} className="p-3 flex items-center gap-3">
            <div className="w-6 text-white/30 text-xs text-center">{item.sort_order}</div>
            <div className="flex-1 flex flex-col gap-1.5">
              <input
                className="bg-white/5 rounded px-2 py-1 text-sm text-white w-full outline-none border border-white/10 focus:border-white/30"
                value={item.label}
                onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, label: e.target.value } : i))}
                onBlur={e => update(item.id, item.key, 'label', e.target.value)}
                placeholder="名称"
              />
              <input
                className="bg-white/5 rounded px-2 py-1 text-xs text-white/60 w-full outline-none border border-white/10 focus:border-white/30"
                value={item.href}
                onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, href: e.target.value } : i))}
                onBlur={e => update(item.id, item.key, 'href', e.target.value)}
                placeholder="路径"
              />
            </div>
            <button
              onClick={() => update(item.id, item.key, 'enabled', !item.enabled)}
              className="shrink-0 px-2 py-1 rounded text-xs font-medium transition-all"
              style={{
                background: item.enabled ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
                color: item.enabled ? '#4ade80' : 'rgba(255,255,255,0.3)',
                border: item.enabled ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {saving === item.id + 'enabled' ? '...' : item.enabled ? '显示' : '隐藏'}
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/20 mt-2 text-center">修改名称后点击其他区域自动保存</p>
    </section>
  );
}
