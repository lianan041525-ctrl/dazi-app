'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { CATEGORY_MAP, timeAgo } from '@/lib/constants';
import TabBar from '@/components/TabBar';

const FILTER_CATEGORIES = [
  { key: 'all', label: '全部', icon: '✨' },
  { key: 'food', label: '饭搭子', icon: '🍜' },
  { key: 'sport', label: '运动搭子', icon: '🏸' },
  { key: 'photo', label: '约拍搭子', icon: '📸' },
  { key: 'movie', label: '电影搭子', icon: '🎬' },
  { key: 'drink', label: '酒搭子', icon: '🍻' },
  { key: 'game', label: '游戏搭子', icon: '🎮' },
  { key: 'weekend', label: '周末出游', icon: '🌴' },
];

function getOnlineStatus(lastActiveAt: string | null) {
  if (!lastActiveAt) return null;
  const diffMin = (Date.now() - new Date(lastActiveAt).getTime()) / 60000;
  if (diffMin < 5) return { label: '在线', color: '#22C55E', dot: true };
  if (diffMin < 60) return { label: `${Math.floor(diffMin)}分钟前活跃`, color: '#FBBF24', dot: false };
  if (diffMin < 1440) return { label: '今日活跃', color: '#FB923C', dot: false };
  return null;
}

function calcMatchScore(me: any, them: any, theirPost: any) {
  let score = 50;
  if (me?.city && them.city === me.city) score += 20;
  if (them.last_active_at) {
    const days = (Date.now() - new Date(them.last_active_at).getTime()) / 86400000;
    if (days < 7) score += 15;
    if (days < 1) score += 10;
  }
  if (them.is_verified) score += 5;
  score += Math.min(10, them.total_contacts || 0);
  if (theirPost) score += 10;
  if (!them.avatar_url && !them.avatar) score -= 15;
  return Math.max(65, Math.min(95, score));
}

function buildReason(me: any, them: any, theirPost: any, score: number) {
  const reasons: string[] = [];
  if (me?.city && them.city === me.city) reasons.push(`同在${me.city}`);
  if (them.last_active_at) {
    const mins = (Date.now() - new Date(them.last_active_at).getTime()) / 60000;
    if (mins < 60) reasons.push('刚刚活跃');
    else if (mins < 1440) reasons.push('今日活跃');
  }
  if (theirPost) {
    const cat = CATEGORY_MAP[theirPost.category];
    if (cat) reasons.push(`都在找${cat.name}`);
  }
  if (them.is_verified) reasons.push('已认证用户');
  if (reasons.length === 0) reasons.push('系统为你精选');
  return reasons.slice(0, 3).join(' · ');
}

export default function MatchPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.replace('/login?redirect=/match'); return; }

      const { data: myProfile } = await sb
        .from('profiles')
        .select('user_id, city, gender, age, avatar_url, avatar')
        .eq('user_id', user.id)
        .maybeSingle();
      setMe(myProfile);

      const { data: posts } = await sb
        .from('posts')
        .select('post_id, user_id, title, category, content, city, created_at, status')
        .eq('status', 1)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(60);

      const posterIds = [...new Set((posts ?? []).map((p: any) => p.user_id))];
      const { data: profilesData } = posterIds.length > 0
        ? await sb
            .from('profiles')
            .select('user_id, nickname, gender, age, city, avatar_url, avatar, last_active_at, is_verified, total_contacts')
            .in('user_id', posterIds)
            .eq('blocked', false)
        : { data: [] };

      const profileMap = Object.fromEntries((profilesData ?? []).map((p: any) => [p.user_id, p]));

      const userLatestPost: Record<string, any> = {};
      for (const p of (posts ?? [])) {
        if (!userLatestPost[p.user_id]) userLatestPost[p.user_id] = p;
      }

      const matchList = Object.entries(userLatestPost)
        .map(([uid, post]: [string, any]) => {
          const profile = profileMap[uid];
          if (!profile) return null;
          const score = calcMatchScore(myProfile, profile, post);
          const reason = buildReason(myProfile, profile, post, score);
          return { profile, post, score, reason };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.score - a.score);

      setMatches(matchList);
      setLoading(false);
    })();
  }, [router]);

  const filteredMatches = useMemo(() => {
    if (activeCategory === 'all') return matches;
    return matches.filter((m: any) => m.post?.category === activeCategory);
  }, [matches, activeCategory]);

  const displayCity = me?.city || '深圳';

  return (
    <div className="min-h-screen pb-24">
      <header className="px-5 pt-14 pb-3 relative">
        <div className="absolute inset-0 -z-10" style={{
          background: 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(255,107,157,0.22) 0%, transparent 70%)',
        }} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[15px]">📍</span>
            <h1 className="text-[20px] font-bold text-white leading-none">{displayCity}</h1>
            <span className="text-white/40 text-xs">·</span>
            <span className="text-white/70 text-xs">AI 为你精选 {filteredMatches.length} 位</span>
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M6 12h12M10 18h4" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,157,0.12), rgba(192,38,211,0.08))',
            border: '0.5px solid rgba(255,107,157,0.2)',
          }}>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF6B9D, #C026D3)' }}>
            <span className="text-[10px]">✨</span>
            <span className="text-[10px] font-semibold text-white">AI 推荐</span>
          </div>
          <span className="text-[11px] text-white/70 leading-snug">
            根据你的兴趣与位置,为你推荐附近合适的人
          </span>
        </div>
      </header>

      <section className="mt-4">
        <div className="flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
          {FILTER_CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className="shrink-0 px-3.5 h-8 rounded-full text-[12px] font-medium flex items-center gap-1 transition"
              style={activeCategory === c.key ? {
                background: 'linear-gradient(135deg, #FF6B9D, #C026D3)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(255,107,157,0.35)',
              } : {
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.7)',
                border: '0.5px solid rgba(255,255,255,0.08)',
              }}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 mt-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/10 rounded w-1/3" />
                    <div className="h-3 bg-white/10 rounded w-2/3" />
                    <div className="h-3 bg-white/10 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="glass-card p-10 text-center mt-4">
            <div className="text-5xl mb-3">🌸</div>
            <div className="text-white/80 text-sm font-medium">暂时没有合适对象</div>
            <div className="text-white/40 text-xs mt-1.5 leading-relaxed">
              去发布需求,系统将为你匹配<br/>
              也可以去发现页看看最新搭子
            </div>
            <div className="flex gap-2 mt-4 justify-center">
              <button
                onClick={() => router.push('/post')}
                className="btn-gradient px-5 h-9 rounded-full text-xs font-medium"
              >
                去发布
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-5 h-9 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.8)',
                  border: '0.5px solid rgba(255,255,255,0.12)',
                }}
              >
                去发现
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMatches.map(({ profile, post, score, reason }: any) => {
              const cat = CATEGORY_MAP[post?.category] ?? { name: '其他', icon: '📌' };
              const online = getOnlineStatus(profile.last_active_at);
              const nickname = profile.nickname ?? '搭子';
              const firstChar = nickname[0] ?? '搭';
              const avatarSrc = profile.avatar_url || profile.avatar;

              return (
                <button
                  key={profile.user_id}
                  onClick={() => post && router.push(`/detail/${post.post_id}`)}
                  className="glass-card p-4 w-full text-left active:scale-[0.99] transition relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,107,157,0.2), rgba(192,38,211,0.15))',
                      border: '0.5px solid rgba(255,107,157,0.35)',
                    }}>
                    <span className="text-[9px]">✨</span>
                    <span className="text-[11px] font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #FF6B9D, #C026D3)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                      {score}%
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <div className="relative shrink-0">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt={nickname}
                          className="w-14 h-14 rounded-full object-cover"
                          style={{ border: '1.5px solid rgba(255,107,157,0.3)' }} />
                      ) : (
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white"
                          style={{
                            background: 'linear-gradient(135deg, #FF6B9D, #C026D3)',
                            border: '1.5px solid rgba(255,107,157,0.3)',
                          }}>
                          {firstChar}
                        </div>
                      )}
                      {online?.dot && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full"
                          style={{
                            background: online.color,
                            border: '2px solid #0a0a18',
                            boxShadow: `0 0 8px ${online.color}`,
                          }} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-12">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[14px] font-semibold text-white">{nickname}</span>
                        {profile.age && (
                          <span className="text-[11px] text-white/60">{profile.age}岁</span>
                        )}
                        {profile.is_verified && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(59,130,246,0.2)', color: '#93C5FD' }}>
                            ✓ 认证
                          </span>
                        )}
                        {online && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"
                            style={{
                              background: `${online.color}20`,
                              color: online.color,
                            }}>
                            {online.dot && (
                              <span className="w-1 h-1 rounded-full"
                                style={{ background: online.color }} />
                            )}
                            {online.label}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] text-white/50">📍 {profile.city ?? '同城'}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            background: 'rgba(255,140,53,0.15)',
                            color: '#FFB380',
                          }}>
                            {cat.icon} {cat.name}
                        </span>
                      </div>

                      <div className="text-[13px] text-white/85 mt-2 line-clamp-2 leading-relaxed">
                        {post?.title || post?.content || '期待与你相遇'}
                      </div>

                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-[9px]">💡</span>
                        <span className="text-[10px] text-white/50 truncate">{reason}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 flex items-center justify-between"
                    style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-[10px] text-white/40">
                      {post?.created_at ? timeAgo(post.created_at) : ''}
                    </span>
                    <div className="px-4 h-7 rounded-full flex items-center text-[11px] font-semibold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #FF6B9D, #C026D3)',
                        boxShadow: '0 2px 8px rgba(255,107,157,0.35)',
                      }}>
                      联系 TA →
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <TabBar />
    </div>
  );
}
