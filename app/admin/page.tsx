'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

const ADMIN_UID = '025c3bf4-1e7c-41ce-8bf8-3a956cf40498';

type Stats = {
  totalUsers: number;
  todayUsers: number;
  totalPosts: number;
  todayPosts: number;
  activePosts: number;
  totalContacts: number;
  todayContacts: number;
  totalVip: number;
  recentUsers: any[];
  recentPosts: any[];
  categoryStats: any[];
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();

      if (!user || user.id !== ADMIN_UID) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const todayStart = `${today}T00:00:00.000Z`;

      const [
        { count: totalUsers },
        { count: todayUsers },
        { count: totalPosts },
        { count: todayPosts },
        { count: activePosts },
        { count: totalContacts },
        { count: todayContacts },
        { count: totalVip },
        { data: recentUsers },
        { data: recentPosts },
        { data: categoryStats },
      ] = await Promise.all([
        sb.from('profiles').select('*', { count: 'exact', head: true }),
        sb.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
        sb.from('posts').select('*', { count: 'exact', head: true }),
        sb.from('posts').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
        sb.from('posts').select('*', { count: 'exact', head: true }).eq('status', 1),
        sb.from('contact_logs').select('*', { count: 'exact', head: true }),
        sb.from('contact_logs').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
        sb.from('profiles').select('*', { count: 'exact', head: true }).not('vip_expires_at', 'is', null).gt('vip_expires_at', new Date().toISOString()),
        sb.from('profiles').select('user_id, nickname, city, created_at').order('created_at', { ascending: false }).limit(5),
        sb.from('posts').select('post_id, title, category, created_at, profiles(nickname)').order('created_at', { ascending: false }).limit(5),
        sb.from('posts').select('category').eq('status', 1),
      ]);

      // 统计各分类帖子数
      const catMap: Record<string, number> = {};
      (categoryStats ?? []).forEach((p: any) => {
        catMap[p.category] = (catMap[p.category] || 0) + 1;
      });

      const CATEGORY_NAMES: Record<string, string> = {
        food: '🍜 饭搭子', sport: '🏸 运动搭子', photo: '📸 约拍搭子',
        movie: '🎬 电影搭子', drink: '🍻 酒搭子', game: '🎮 游戏搭子',
        weekend: '🌴 周末出游',
      };

      const catList = Object.entries(catMap)
        .map(([key, count]) => ({ name: CATEGORY_NAMES[key] || key, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        totalUsers: totalUsers || 0,
        todayUsers: todayUsers || 0,
        totalPosts: totalPosts || 0,
        todayPosts: todayPosts || 0,
        activePosts: activePosts || 0,
        totalContacts: totalContacts || 0,
        todayContacts: todayContacts || 0,
        totalVip: totalVip || 0,
        recentUsers: recentUsers || [],
        recentPosts: recentPosts || [],
        categoryStats: catList,
      });
      setLoading(false);
    })();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A18' }}>
      <div className="text-white/40 text-sm">数据加载中...</div>
    </div>
  );

  if (unauthorized) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0A0A18' }}>
      <div className="text-4xl">🚫</div>
      <div className="text-white text-lg font-medium">无权访问</div>
      <div className="text-white/40 text-sm">仅管理员可查看数据面板</div>
      <button onClick={() => router.push('/')}
        className="mt-4 px-6 h-10 rounded-full text-sm text-white"
        style={{ background: 'linear-gradient(135deg, #FF6B9D, #C026D3)' }}>
        返回首页
      </button>
    </div>
  );

  const s = stats!;

  const StatCard = ({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) => (
    <div className="glass-card p-4">
      <div className="text-xs text-white/50 mb-1">{label}</div>
      <div className="text-2xl font-bold"
        style={{ color: color || '#fff' }}>
        {value}
      </div>
      {sub && <div className="text-xs text-white/40 mt-1">{sub}</div>}
    </div>
  );

  return (
    <div className="min-h-screen pb-10" style={{ background: '#0A0A18' }}>
      {/* 背景光晕 */}
      <div className="absolute inset-0 -z-10 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255,107,157,0.15) 0%, transparent 60%)',
      }} />

      {/* 顶部 */}
      <header className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">📊 数据面板</h1>
            <p className="text-white/40 text-xs mt-1">
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
          <button onClick={() => router.push('/')}
            className="text-white/50 text-sm px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            返回
          </button>
        </div>
      </header>

      <div className="px-5 space-y-6">

        {/* 核心数据 */}
        <section>
          <h2 className="text-xs font-medium text-white/50 mb-3 uppercase tracking-wider">核心数据</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="总用户数" value={s.totalUsers} sub={`今日新增 +${s.todayUsers}`} color="#FF6B9D" />
            <StatCard label="总帖子数" value={s.totalPosts} sub={`今日新增 +${s.todayPosts}`} color="#A78BFA" />
            <StatCard label="活跃帖子" value={s.activePosts} sub="匹配中" color="#60A5FA" />
            <StatCard label="总联系次数" value={s.totalContacts} sub={`今日 +${s.todayContacts}`} color="#34D399" />
          </div>
        </section>

        {/* 会员数据 */}
        <section>
          <h2 className="text-xs font-medium text-white/50 mb-3 uppercase tracking-wider">会员数据</h2>
          <div className="glass-card p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-white/50 mb-1">当前有效会员</div>
              <div className="text-2xl font-bold text-yellow-400">👑 {s.totalVip}</div>
              <div className="text-xs text-white/40 mt-1">
                转化率 {s.totalUsers > 0 ? ((s.totalVip / s.totalUsers) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/50 mb-1">预计年收入</div>
              <div className="text-lg font-bold text-white">
                ¥{(s.totalVip * 28).toLocaleString()}
              </div>
              <div className="text-xs text-white/40 mt-1">¥28/人/年</div>
            </div>
          </div>
        </section>

        {/* 分类分布 */}
        {s.categoryStats.length > 0 && (
          <section>
            <h2 className="text-xs font-medium text-white/50 mb-3 uppercase tracking-wider">帖子分类分布</h2>
            <div className="glass-card p-4 space-y-3">
              {s.categoryStats.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className="text-xs text-white/70 w-24 shrink-0">{cat.name}</div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${(cat.count / s.activePosts) * 100}%`,
                        background: 'linear-gradient(135deg, #FF6B9D, #C026D3)',
                      }} />
                  </div>
                  <div className="text-xs text-white/50 w-8 text-right shrink-0">{cat.count}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 最近注册用户 */}
        <section>
          <h2 className="text-xs font-medium text-white/50 mb-3 uppercase tracking-wider">最近注册用户</h2>
          <div className="glass-card divide-y divide-white/5">
            {s.recentUsers.map((u, i) => (
              <div key={u.user_id} className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #FF6B9D, #C026D3)' }}>
                  {(u.nickname || '搭')?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{u.nickname || '未设置昵称'}</div>
                  <div className="text-xs text-white/40">{u.city || '未知城市'}</div>
                </div>
                <div className="text-xs text-white/30 shrink-0">
                  {new Date(u.created_at).toLocaleDateString('zh-CN')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 最近发布帖子 */}
        <section>
          <h2 className="text-xs font-medium text-white/50 mb-3 uppercase tracking-wider">最近发布帖子</h2>
          <div className="glass-card divide-y divide-white/5">
            {s.recentPosts.map((p) => (
              <div key={p.post_id} className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm text-white truncate flex-1">{p.title}</div>
                  <div className="text-xs text-white/30 shrink-0">
                    {new Date(p.created_at).toLocaleDateString('zh-CN')}
                  </div>
                </div>
                <div className="text-xs text-white/40 mt-0.5">
                  {(p as any).profiles?.nickname || '未知用户'}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 底部时间戳 */}
        <div className="text-center text-white/20 text-xs pb-4">
          数据实时查询 · {new Date().toLocaleTimeString('zh-CN')}
        </div>
      </div>
    </div>
  );
}
