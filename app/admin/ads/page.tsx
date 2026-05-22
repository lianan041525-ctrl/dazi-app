'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

const ADMIN_UID = '025c3bf4-1e7c-41ce-8bf8-3a956cf40498';

export default function AdsPage() {
  const router = useRouter();
  const [ads, setAds] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ title: '', subtitle: '', url: '' });

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user || user.id !== ADMIN_UID) { router.push('/'); return; }
      const { data } = await sb.from('ad_banners').select('*').order('sort_order');
      setAds(data || []);
    })();
  }, []);

  const save = async (id: number, updates: any) => {
    const sb = supabaseBrowser();
    await sb.from('ad_banners').update(updates).eq('id', id);
    setAds(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    setMsg('✅ 已保存');
    setTimeout(() => setMsg(''), 2000);
  };

  const add = async () => {
    if (!form.title) return setMsg('请填写标题');
    const sb = supabaseBrowser();
    const { data } = await sb.from('ad_banners').insert(form).select().single();
    if (data) setAds(prev => [...prev, data]);
    setForm({ title: '', subtitle: '', url: '' });
    setMsg('✅ 添加成功');
    setTimeout(() => setMsg(''), 2000);
  };

  const del = async (id: number) => {
    if (!confirm('确认删除？')) return;
    const sb = supabaseBrowser();
    await sb.from('ad_banners').delete().eq('id', id);
    setAds(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen p-5" style={{ background: '#0a0a18', color: '#fff' }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin')} className="text-white/60 text-sm">← 返回</button>
        <h1 className="text-lg font-bold">广告位管理</h1>
        {msg && <span className="text-sm text-green-400">{msg}</span>}
      </div>

      <div className="glass-card p-4 mb-6">
        <div className="text-sm font-medium mb-3">添加新广告</div>
        <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}
          placeholder="广告标题（如：💕 一个月见四次面）"
          className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mb-2 outline-none" />
        <input value={form.subtitle} onChange={e => setForm(p => ({...p, subtitle: e.target.value}))}
          placeholder="副标题（如：找到真实的线下搭子）"
          className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mb-2 outline-none" />
        <input value={form.url} onChange={e => setForm(p => ({...p, url: e.target.value}))}
          placeholder="跳转链接（如：https://citydz.cc）"
          className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mb-3 outline-none" />
        <button onClick={add} className="btn-gradient px-6 py-2 rounded-xl text-sm font-medium">添加广告</button>
      </div>

      <div className="space-y-3">
        {ads.map(ad => (
          <div key={ad.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium">{ad.title}</div>
              <div className="flex gap-2">
                <button onClick={() => save(ad.id, { enabled: !ad.enabled })}
                  className={`text-xs px-3 py-1 rounded-full ${ad.enabled ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                  {ad.enabled ? '展示中' : '已隐藏'}
                </button>
                <button onClick={() => del(ad.id)} className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400">删除</button>
              </div>
            </div>
            <input defaultValue={ad.subtitle} onChange={e => {
                const v = e.target.value;
                setAds(prev => prev.map(a => a.id === ad.id ? {...a, subtitle: v} : a));
              }} onBlur={e => save(ad.id, { subtitle: e.target.value })}
              placeholder="副标题"
              className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mb-2 outline-none" />
            <input defaultValue={ad.url} onChange={e => {
                const v = e.target.value;
                setAds(prev => prev.map(a => a.id === ad.id ? {...a, url: v} : a));
              }} onBlur={e => save(ad.id, { url: e.target.value })}
              placeholder="跳转链接（如：https://citydz.cc）"
              className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
