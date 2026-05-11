'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Banner = {
  id: number; title: string; image_url: string; link_url: string;
  position: string; sort_order: number; enabled: boolean;
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', image_url: '', link_url: '', position: 'home_top', sort_order: 0 });

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    setLoading(true);
    const { data } = await supabaseBrowser().from('banners').select('*').order('sort_order');
    if (data) setBanners(data);
    setLoading(false);
  };

  const addBanner = async () => {
    if (!form.title || !form.image_url) { setMsg('❌ 请填写标题和图片链接'); return; }
    const { error } = await supabaseBrowser().from('banners').insert(form);
    if (error) { setMsg('❌ 添加失败: ' + error.message); return; }
    setMsg('✅ 添加成功');
    setForm({ title: '', image_url: '', link_url: '', position: 'home_top', sort_order: 0 });
    setAdding(false);
    loadBanners();
    setTimeout(() => setMsg(''), 2000);
  };

  const toggleEnabled = async (id: number, enabled: boolean) => {
    const { error } = await supabaseBrowser().from('banners').update({ enabled: !enabled }).eq('id', id);
    if (error) return;
    setBanners(prev => prev.map(b => b.id === id ? { ...b, enabled: !enabled } : b));
  };

  const deleteBanner = async (id: number) => {
    if (!confirm('确认删除？')) return;
    await supabaseBrowser().from('banners').delete().eq('id', id);
    setBanners(prev => prev.filter(b => b.id !== id));
    setMsg('✅ 已删除');
    setTimeout(() => setMsg(''), 2000);
  };

  const POSITION_MAP: Record<string, string> = {
    home_top: '首页顶部Banner',
    list_mid: '列表中部插屏',
    detail_bottom: '详情页底部',
  };

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white font-medium text-lg">广告位管理</h1>
        <button onClick={() => setAdding(!adding)}
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ background: 'linear-gradient(135deg,#FF6B9D,#C026D3)', color: '#fff' }}>
          + 新增广告
        </button>
      </div>

      {msg && <div className="text-center text-sm mb-3" style={{ color: msg.startsWith('✅') ? '#4ade80' : '#f87171' }}>{msg}</div>}

      {adding && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,107,157,0.05)', border: '1px solid rgba(255,107,157,0.2)' }}>
          <div className="text-sm text-white font-medium mb-3">新增广告</div>
          <div className="flex flex-col gap-2">
            <input className="rounded-xl px-3 py-2 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="广告标题" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <input className="rounded-xl px-3 py-2 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="图片链接 (https://...)" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
            <input className="rounded-xl px-3 py-2 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="跳转链接 (可选)" value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} />
            <select className="rounded-xl px-3 py-2 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
              <option value="home_top">首页顶部Banner</option>
              <option value="list_mid">列表中部插屏</option>
              <option value="detail_bottom">详情页底部</option>
            </select>
            <input type="number" className="rounded-xl px-3 py-2 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="排序（数字越小越靠前）" value={form.sort_order}
              onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
            <div className="flex gap-2 mt-1">
              <button onClick={addBanner} className="flex-1 py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg,#FF6B9D,#C026D3)' }}>确认添加</button>
              <button onClick={() => setAdding(false)} className="flex-1 py-2 rounded-xl text-sm text-white/50"
                style={{ background: 'rgba(255,255,255,0.05)' }}>取消</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="text-center text-white/30 py-10">加载中...</div> : (
        <div className="flex flex-col gap-3">
          {banners.length === 0 && <div className="text-center text-white/30 py-10">暂无广告，点击右上角新增</div>}
          {banners.map(b => (
            <div key={b.id} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {b.image_url && <img src={b.image_url} alt={b.title} className="w-full h-32 object-cover" onError={e => (e.currentTarget.style.display='none')} />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm text-white font-medium">{b.title}</div>
                    <div className="text-xs text-white/40 mt-0.5">{POSITION_MAP[b.position] || b.position}</div>
                    {b.link_url && <div className="text-xs text-white/25 mt-0.5 truncate">{b.link_url}</div>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => toggleEnabled(b.id, b.enabled)}
                      className="text-xs px-2.5 py-1 rounded-lg"
                      style={{ background: b.enabled ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', color: b.enabled ? '#4ade80' : 'rgba(255,255,255,0.3)', border: b.enabled ? '1px solid rgba(74,222,128,0.2)' : '1px solid rgba(255,255,255,0.1)' }}>
                      {b.enabled ? '显示中' : '已隐藏'}
                    </button>
                    <button onClick={() => deleteBanner(b.id)}
                      className="text-xs px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
