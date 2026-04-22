'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { CATEGORIES } from '@/lib/constants';
import { useCityStore } from '@/lib/store';
import PostCard, { PostCardData } from '@/components/PostCard';

function ListInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { city } = useCityStore();
  const [category, setCategory] = useState(params.get('category') || '');
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const sb = supabaseBrowser();
      let q = sb.from('posts')
        .select('post_id,category,title,content,city,district,created_at,profiles(nickname,avatar,gender,age)')
        .eq('city', city).eq('status', 1)
        .order('created_at', { ascending: false }).limit(50);
      if (category) q = q.eq('category', category);
      const { data } = await q;
      setPosts((data as any) ?? []);
      setLoading(false);
    })();
  }, [city, category]);

  return (
    <div className="min-h-screen pb-8">
      <header className="h-12 flex items-center px-4 sticky top-0 z-20"
        style={{ background: 'rgba(15,11,30,0.85)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => router.back()} className="text-white/60 w-8 text-left text-lg">←</button>
        <h1 className="flex-1 text-center text-white font-medium">{city} · 附近搭子</h1>
        <div className="w-8" />
      </header>

      <div className="px-3 py-2.5 flex gap-2 overflow-x-auto no-scrollbar sticky top-12 z-10"
        style={{ background: 'rgba(15,11,30,0.85)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => setCategory('')}
          className="px-4 py-1.5 rounded-full text-xs shrink-0 transition"
          style={!category ? {
            background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)',
            color: '#fff',
          } : {
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          全部
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className="px-4 py-1.5 rounded-full text-xs shrink-0 transition"
            style={category === c.key ? {
              background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)',
              color: '#fff',
            } : {
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <div className="px-5 pt-4">
        <div className="text-xs text-white/40 mb-3">为你找到 {posts.length} 个附近搭子</div>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-white/40 py-12 text-sm">加载中...</div>
          ) : posts.length === 0 ? (
            <div className="glass-card text-center py-14">
              <div className="text-5xl mb-3">✨</div>
              <div className="text-white/60 text-sm mb-4">当前还没有合适的搭子</div>
              <button
                onClick={() => router.push('/post')}
                className="btn-gradient px-6 h-10 rounded-full text-sm font-medium"
              >
                去发布需求
              </button>
            </div>
          ) : (
            posts.map((p) => <PostCard key={p.post_id} post={p} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default function ListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white/40 text-sm">加载中...</div>}>
      <ListInner />
    </Suspense>
  );
}
