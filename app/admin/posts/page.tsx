'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const CATEGORY_MAP: Record<string, string> = {
  food: '🍜 饭搭子', sport: '🏸 运动搭子', photo: '📸 约拍搭子',
  movie: '🎬 电影搭子', drink: '🍻 酒搭子', game: '🎮 游戏搭子',
  weekend: '🌴 周末出游', meal: '🍽️ 饭搭子',
};

type Post = {
  post_id: number; title: string; category: string; city: string;
  status: number; created_at: string; user_id: string; content: string;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [msg, setMsg] = useState('');

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    setLoading(true);
    const { data } = await supabaseBrowser().from('posts')
      .select('post_id,title,category,city,status,created_at,user_id,content')
      .order('created_at', { ascending: false }).limit(200);
    if (data) setPosts(data);
    setLoading(false);
  };

  const toggleStatus = async (id: number, status: number) => {
    const newStatus = status === 1 ? 0 : 1;
    const { error } = await supabaseBrowser().from('posts').update({ status: newStatus }).eq('post_id', id);
    if (error) { setMsg('❌ 操作失败'); return; }
    setPosts(prev => prev.map(p => p.post_id === id ? { ...p, status: newStatus } : p));
    setMsg(newStatus === 1 ? '✅ 已上架' : '✅ 已下架');
    setTimeout(() => setMsg(''), 2000);
  };

  const deletePost = async (id: number) => {
    if (!confirm('确认删除这个帖子？')) return;
    const { error } = await supabaseBrowser().from('posts').delete().eq('post_id', id);
    if (error) { setMsg('❌ 删除失败'); return; }
    setPosts(prev => prev.filter(p => p.post_id !== id));
    setMsg('✅ 已删除');
    setTimeout(() => setMsg(''), 2000);
  };

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title.includes(search) || (p.city || '').includes(search);
    const matchFilter = filter === 'all' || (filter === 'active' && p.status === 1) || (filter === 'inactive' && p.status !== 1);
    return matchSearch && matchFilter;
  });

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white font-medium text-lg">帖子管理</h1>
        <span className="text-white/30 text-xs">{filtered.length} 条</span>
      </div>
      {msg && <div className="text-center text-sm mb-3" style={{ color: msg.startsWith('✅') ? '#4ade80' : '#f87171' }}>{msg}</div>}

      <input className="w-full rounded-xl px-4 py-2.5 text-sm text-white mb-3 outline-none"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
        placeholder="搜索标题 / 城市" value={search} onChange={e => setSearch(e.target.value)} />

      <div className="flex gap-2 mb-4">
        {[['all','全部'],['active','上架中'],['inactive','已下架']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={{ background: filter === val ? 'linear-gradient(135deg,#FF6B9D,#C026D3)' : 'rgba(255,255,255,0.07)', color: filter === val ? '#fff' : 'rgba(255,255,255,0.5)' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center text-white/30 py-10">加载中...</div> : (
        <div className="flex flex-col gap-2">
          {filtered.map(p => (
            <div key={p.post_id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,107,157,0.1)', color: '#FF6B9D' }}>
                      {CATEGORY_MAP[p.category] || p.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: p.status === 1 ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', color: p.status === 1 ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
                      {p.status === 1 ? '上架中' : '已下架'}
                    </span>
                  </div>
                  <div className="text-sm text-white font-medium truncate">{p.title}</div>
                  <div className="text-xs text-white/40 mt-0.5 line-clamp-1">{p.content}</div>
                  <div className="text-xs text-white/25 mt-1">{p.city} · {new Date(p.created_at).toLocaleDateString('zh-CN')}</div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => toggleStatus(p.post_id, p.status)}
                    className="text-xs px-2.5 py-1 rounded-lg"
                    style={{ background: p.status === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(74,222,128,0.1)', color: p.status === 1 ? 'rgba(255,255,255,0.4)' : '#4ade80', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {p.status === 1 ? '下架' : '上架'}
                  </button>
                  <button onClick={() => deletePost(p.post_id)}
                    className="text-xs px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center text-white/30 py-10">没有找到帖子</div>}
        </div>
      )}
    </div>
  );
}
