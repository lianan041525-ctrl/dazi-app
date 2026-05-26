'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { useCityStore } from '@/lib/store';
import { CATEGORIES } from '@/lib/constants';
import PostCard, { PostCardData } from '@/components/PostCard';
import InstallPrompt from '@/components/InstallPrompt';
import CitySheet from '@/components/CitySheet';
import TabBar from '@/components/TabBar';

export default function Home() {
  const router = useRouter();
  const { city } = useCityStore();
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [search, setSearch] = useState('');
  const [adBanner, setAdBanner] = useState<{title:string,subtitle:string,url:string}|null>(null);
  const [citySheet, setCitySheet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [catCounts, setCatCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // 注册推送通知
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
      if (Notification.permission === 'default') {
        setTimeout(() => Notification.requestPermission(), 3000);
      }
    }
  }, []);

  useEffect(() => {
    // 更新用户活跃时间
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        await sb.from('profiles').update({ last_active_at: new Date().toISOString() }).eq('user_id', user.id);
      }
      // 今日活跃用户数
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count } = await sb.from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_active_at', todayStart.toISOString());
      setOnlineCount(count || 0);

      // 拉自定义广告
      const { data: ads } = await sb.from('ad_banners').select('title,subtitle,url').eq('enabled', true).order('sort_order').limit(1);
      if (ads && ads.length > 0) setAdBanner(ads[0]);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const sb = supabaseBrowser();
      const { data: postData } = await sb
        .from('posts')
        .select('post_id,category,title,content,city,district,created_at,user_id')
        .eq('status', 1)
        .order('created_at', { ascending: false });

      const rawPosts = postData ?? [];
      const userIds = [...new Set(rawPosts.map((p: any) => p.user_id))];
      let profileMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await sb.from('profiles')
          .select('user_id,nickname,gender,age,wechat_id,city,avatar_url')
          .in('user_id', userIds);
        (profiles ?? []).forEach((p: any) => { profileMap[p.user_id] = p; });
      }
      const merged = rawPosts.map((p: any) => ({ ...p, profiles: profileMap[p.user_id] || null }));
      setPosts(merged as any);

      // 统计每个类目的帖子数
      const { data: allCats } = await sb
        .from('posts')
        .select('category')
        .eq('status', 1);
      const counts: Record<string, number> = {};
      (allCats ?? []).forEach((p: any) => {
        counts[p.category] = (counts[p.category] || 0) + 1;
      });
      setCatCounts(counts);

      setLoading(false);
    })();
  }, [city]);

  const [onlineCount, setOnlineCount] = useState(0);

  return (
    <div className="pb-24">
      <header className="pt-3 px-5 flex items-center justify-between">
        <button onClick={() => setCitySheet(true)} className="flex items-center gap-2 text-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green inline-block" />
          <span className="text-white/80">{city} · 在线 {onlineCount + 3842}</span>
          <span className="text-white/40 text-xs">▾</span>
        </button>
        <button onClick={() => router.push('/mine')} className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-xs text-white/70">
          我
        </button>
      </header>

      <div className="px-5 mt-4">
        <div className="flex items-center gap-2 bg-white/8 border border-white/12 rounded-2xl px-4 py-2.5">
          <span className="text-white/40 text-base">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索搭子、活动、地点..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-white/40 text-xs px-1">✕</button>
          )}
        </div>
      </div>

      <section className="px-5 pt-5">
        <div className="text-[10px] text-white/40 font-semibold tracking-[3px] uppercase mb-2">
          CITY · {city} · 同城社交
        </div>
        <h1 className="gradient-text text-3xl font-semibold leading-tight tracking-tight">今晚,和谁一起?</h1>
        <p className="gradient-text-sub text-sm font-medium mt-1.5">找到你的城市搭子,马上出发 🔥</p>
        <div className="inline-flex items-center gap-2 mt-3 bg-white/6 border border-white/10 rounded-full px-3.5 py-1.5">
          <div className="live-dot w-1.5 h-1.5 rounded-full bg-accent-green shrink-0" />
          <span className="text-xs text-white/70 font-medium">
            今日 <span className="text-white font-bold">{(onlineCount || 0) + 3842}</span> 人在线找搭子
          </span>
        </div>
      </section>

      <section className="mt-5">
        <div className="flex gap-3 px-5 overflow-x-auto scrollbar-hide pb-2">
          {CATEGORIES.map((c) => {
            const count = catCounts[c.key] || (((c.key.charCodeAt(0) + c.key.charCodeAt(1)) % 30) + 10);
            return (
              <button
                key={c.key}
                onClick={() => router.push(`/list?category=${c.key}`)}
                className={`${c.cls} min-w-[100px] h-32 rounded-2xl p-3 flex flex-col justify-between shadow-lg active:scale-95 transition shrink-0`}
              >
                <div className="text-2xl text-left">{c.icon}</div>
                <div className="text-left">
                  <div className="text-sm font-medium leading-tight">{c.name}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{count} 人在找</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white text-base font-medium">最新需求</h2>
          <button onClick={() => router.push('/list')} className="text-white/50 text-xs">
            查看全部 ›
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-white/40 text-sm py-12">加载中...</div>
          ) : posts.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-white/60 text-sm">还没有人发布需求</p>
              <p className="text-white/40 text-xs mt-1">来做第一个吧</p>
              <button onClick={() => router.push('/post')} className="btn-gradient mt-4 px-6 py-2 rounded-full text-sm font-medium">
                发布需求
              </button>
            </div>
          ) : (
            (search ? posts.filter(p =>
              (p.title?.includes(search)) ||
              (p.content?.includes(search)) ||
              (p.profiles?.nickname?.includes(search)) ||
              (p.district?.includes(search))
            ) : posts).flatMap((p, i) => {
              const card = <PostCard key={p.post_id} post={p} />;
              if ((i + 1) % 10 === 0) {
                const ads = [card,
                  <div key="vip-ad" onClick={() => router.push('/vip')}
                    className="glass-card p-4 mt-3 cursor-pointer active:scale-[0.98] transition-transform"
                    style={{ background: 'linear-gradient(135deg, rgba(255,94,120,0.15), rgba(108,92,231,0.15))', borderColor: 'rgba(255,94,120,0.3)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold text-sm">🎁 限时特惠 · 年费会员仅需 1 折</div>
                        <div className="text-white/50 text-xs mt-1">解锁无限联系 · 查看所有访客 · 专属 AI 推荐</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded text-white/40 border border-white/20 ml-2 shrink-0">广告</span>
                    </div>
                    <button className="btn-gradient mt-3 px-4 py-1.5 rounded-full text-xs font-medium">
                      立即了解 →
                    </button>
                  </div>
                ];
                if (adBanner) ads.push(
                  <div key="custom-ad" onClick={() => adBanner.url && window.open(adBanner.url, '_blank')}
                    className="glass-card p-4 mt-3 cursor-pointer active:scale-[0.98] transition-transform"
                    style={{ background: 'linear-gradient(135deg, rgba(6,214,160,0.12), rgba(59,130,246,0.12))', borderColor: 'rgba(6,214,160,0.25)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold text-sm">{adBanner.title}</div>
                        <div className="text-white/50 text-xs mt-1">{adBanner.subtitle}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded text-white/40 border border-white/20 ml-2 shrink-0">广告</span>
                    </div>
                    <button className="mt-3 px-4 py-1.5 rounded-full text-xs font-medium text-white"
                      style={{ background: 'linear-gradient(135deg, #06D6A0, #3B82F6)' }}>
                      立即查看 →
                    </button>
                  </div>
                );
                return ads;
              }
              return [card];
            })
          )}
        </div>
      </section>

      <CitySheet open={citySheet} onClose={() => setCitySheet(false)} />
      <InstallPrompt />
      <TabBar />
    </div>
  );
}
