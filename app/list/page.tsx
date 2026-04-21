'use client';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
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
      let q = sb
        .from('posts')
        .select(
          'post_id,category,title,content,city,district,created_at,profiles(nickname,avatar,gender,age)'
        )
        .eq('city', city)
        .eq('status', 1)
        .order('created_at', { ascending: false })
        .limit(50);
      if (category) q = q.eq('category', category);
      const { data } = await q;
      setPosts((data as any) ?? []);
      setLoading(false);
    })();
  }, [city, category]);

  return (
    <div className="min-h-screen pb-8">
      <header className="h-12 flex items-center px-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-500 w-6 text-left">
          ←
        </button>
        <h1 className="flex-1 text-center font-medium">
          {city} · 附近搭子
        </h1>
        <div className="w-6" />
      </header>

      {/* 筛选栏 */}
      <div className="bg-white px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar sticky top-12 z-10 border-b border-gray-100">
        <button
          onClick={() => setCategory('')}
          className={`px-3 py-1.5 rounded-full text-sm shrink-0 transition
            ${!category ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          全部
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-3 py-1.5 rounded-full text-sm shrink-0 transition
              ${category === c.key ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4">
        <div className="text-xs text-gray-500 mb-3">
          为你找到 {posts.length} 个附近搭子
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-gray-400 py-12 text-sm">加载中...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🍃</div>
              <div className="text-gray-400 text-sm mb-4">当前还没有合适的搭子</div>
              <button
                onClick={() => router.push('/post')}
                className="px-6 h-10 bg-brand text-white rounded-full text-sm"
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

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">加载中...</div>}>
      <ListInner />
    </Suspense>
  );
}
