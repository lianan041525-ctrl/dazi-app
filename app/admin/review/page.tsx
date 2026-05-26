'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

const ADMIN_UID = '025c3bf4-1e7c-41ce-8bf8-3a956cf40498';

export default function ReviewPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user || user.id !== ADMIN_UID) { router.push('/'); return; }
      const { data } = await sb.from('posts')
        .select('post_id, title, content, category, city, created_at, user_id')
        .eq('status', 0)
        .order('created_at', { ascending: true });
      setPosts(data || []);
      setLoading(false);
    })();
  }, []);

  const approve = async (id: number) => {
    const sb = supabaseBrowser();
    await sb.from('posts').update({ status: 1 }).eq('post_id', id);
    setPosts(prev => prev.filter(p => p.post_id !== id));
    setMsg('✅ 已通过');
    setTimeout(() => setMsg(''), 2000);
  };

  const reject = async (id: number) => {
    const sb = supabaseBrowser();
    await sb.from('posts').update({ status: 2 }).eq('post_id', id);
    setPosts(prev => prev.filter(p => p.post_id !== id));
    setMsg('🚫 已拒绝');
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <div className="min-h-screen p-5" style={{ background: '#0a0a18', color: '#fff' }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin')} className="text-white/60 text-sm">← 返回</button>
        <h1 className="text-lg font-bold">帖子审核</h1>
        <span className="text-sm text-white/40">待审核 {posts.length} 篇</span>
        {msg && <span className="text-sm text-green-400">{msg}</span>}
      </div>

      {loading && <div className="text-white/40 text-center py-10">加载中...</div>}

      {!loading && posts.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">✅</div>
          <div className="text-white/50">暂无待审核帖子</div>
        </div>
      )}

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.post_id} className="glass-card p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="text-white font-medium text-sm">{post.title}</div>
                <div className="text-white/50 text-xs mt-1">{post.city} · {post.category}</div>
              </div>
              <div className="text-white/30 text-xs ml-2">{new Date(post.created_at).toLocaleDateString()}</div>
            </div>
            <div className="text-white/60 text-xs mb-4 leading-relaxed">{post.content}</div>
            <div className="flex gap-2">
              <button onClick={() => approve(post.post_id)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #06D6A0, #3B82F6)' }}>
                ✅ 通过
              </button>
              <button onClick={() => reject(post.post_id)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-white bg-red-500/20 text-red-400">
                🚫 拒绝
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
