'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { useCityStore } from '@/lib/store';
import CategoryGrid from '@/components/CategoryGrid';
import PostCard, { PostCardData } from '@/components/PostCard';
import CitySheet from '@/components/CitySheet';
import TabBar from '@/components/TabBar';

export default function Home() {
  const router = useRouter();
  const { city } = useCityStore();
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [citySheet, setCitySheet] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const sb = supabaseBrowser();
      const { data } = await sb
        .from('posts')
        .select(
          'post_id,category,title,content,city,district,created_at,profiles(nickname,avatar,gender,age)'
        )
        .eq('city', city)
        .eq('status', 1)
        .order('created_at', { ascending: false })
        .limit(20);
      setPosts((data as any) ?? []);
      setLoading(false);
    })();
  }, [city]);

  return (
    <div className="pb-20">
      <header className="px-4 pt-4 pb-3 bg-gradient-to-b from-brand-50 to-transparent flex items-center">
        <button
          onClick={() => setCitySheet(true)}
          className="flex items-center gap-1 text-sm"
        >
          📍 <span className="font-medium">{city}</span>
          <span className="text-gray-400">▾</span>
        </button>
        <div className="ml-auto text-xs text-gray-500">附近搭子</div>
      </header>

      <section className="px-4 pt-2">
        <h1 className="text-2xl font-bold leading-tight">
          同城找搭子
          <br />
          马上约起来
        </h1>
        <p className="text-sm text-gray-500 mt-1">吃饭 · 运动 · 电影 · 游戏</p>
      </section>

      <CategoryGrid />

      <button
        onClick={() => router.push('/post')}
        className="mx-4 mt-4 h-12 w-[calc(100%-2rem)] bg-brand text-white rounded-xl font-medium shadow-lg shadow-brand/30 active:scale-[0.98] transition"
      >
        发布我的需求
      </button>

      <section className="px-4 mt-5">
        <div className="flex items-center mb-3">
          <h2 className="text-base font-semibold">附近最新</h2>
          <button
            onClick={() => router.push('/list')}
            className="ml-auto text-xs text-gray-500"
          >
            查看全部 ›
          </button>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-gray-400 text-sm py-12">加载中...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-12">
              暂无数据，来发第一条吧
            </div>
          ) : (
            posts.map((p) => <PostCard key={p.post_id} post={p} />)
          )}
        </div>
      </section>

      <CitySheet open={citySheet} onClose={() => setCitySheet(false)} />
      <TabBar />
    </div>
  );
}
