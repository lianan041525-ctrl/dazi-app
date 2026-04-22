'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { CATEGORY_MAP, timeAgo } from '@/lib/constants';
import TabBar from '@/components/TabBar';
import Toast, { toast } from '@/components/Toast';

export default function MinePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.replace('/login?redirect=/mine'); return; }
      const { data: p } = await sb.from('profiles').select('*').eq('user_id', user.id).single();
      setProfile(p);
      const { data: list } = await sb.from('posts').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      setPosts(list ?? []);
      setLoading(false);
    })();
  }, [router]);

  const logout = async () => {
    await supabaseBrowser().auth.signOut();
    router.replace('/');
  };

  const offline = async (id: number) => {
    const { error } = await supabaseBrowser().from('posts').update({ status: 3 }).eq('post_id', id);
    if (error) return toast(error.message);
    setPosts((ps) => ps.map((p) => p.post_id === id ? { ...p, status: 3 } : p));
    toast('已下架');
  };

  const remove = async (id: number) => {
    if (!confirm('确定删除这条发布吗?')) return;
    const { error } = await supabaseBrowser().from('posts').delete().eq('post_id', id);
    if (error) return toast(error.message);
    setPosts((ps) => ps.filter((p) => p.post_id !== id));
    toast('已删除');
  };

  if (loading) return <div className="p-8 text-center text-white/40 text-sm">加载中...</div>;

  return (
    <div className="min-h-screen pb-24">
      <header className="px-5 pt-14 pb-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,94,120,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(108,92,231,0.2) 0%, transparent 60%)',
        }} />
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push("/mine/edit")}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-medium overflow-hidden shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)', color: '#fff', boxShadow: '0 8px 24px rgba(255,94,120,0.3)' }}>
            {profile?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{profile?.nickname?.[0] ?? '搭'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl font-semibold text-white truncate">{profile?.nickname}</div>
            <div className="text-xs text-white/50 mt-1.5 flex items-center gap-1">
              📍 {profile?.city ?? '未设置城市'}
              <span className="text-white/30 ml-1">· 点击编辑资料 ›</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-5">
          <div className="glass-card p-3 text-center">
            <div className="text-lg font-semibold text-white">{posts.length}</div>
            <div className="text-[10px] text-white/50 mt-0.5">我的发布</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-lg font-semibold text-white">{posts.filter((p) => p.status === 1).length}</div>
            <div className="text-[10px] text-white/50 mt-0.5">匹配中</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-lg font-semibold text-white">{posts.reduce((s, p) => s + (p.contact_count || 0), 0)}</div>
            <div className="text-[10px] text-white/50 mt-0.5">被联系</div>
          </div>
        </div>
      </header>

      <section className="px-5 mt-2">
        <h2 className="text-base font-medium text-white mb-3">我的发布</h2>
        {posts.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <div className="text-4xl mb-3">✨</div>
            <div className="text-white/60 text-sm">还没有发布过需求</div>
            <button
              onClick={() => router.push('/post')}
              className="btn-gradient mt-4 px-6 h-10 rounded-full text-sm font-medium"
            >
              去发布
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => {
              const cat = CATEGORY_MAP[p.category] ?? { name: '其他', icon: '📌' };
              const statusText = p.status === 1 ? '匹配中' : p.status === 3 ? '已下架' : '已结束';
              const statusCls = p.status === 1
                ? { background: 'rgba(6,214,160,0.15)', color: '#06D6A0' }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' };
              return (
                <div key={p.post_id} className="glass-card p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,94,120,0.2)', color: '#FFC4D0' }}>
                      {cat.icon} {cat.name}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md" style={statusCls}>
                      {statusText}
                    </span>
                    <span className="ml-auto text-[11px] text-white/40">{timeAgo(p.created_at)}</span>
                  </div>
                  <div
                    className="mt-2 font-medium text-white cursor-pointer"
                    onClick={() => router.push(`/detail/${p.post_id}`)}
                  >
                    {p.title}
                  </div>
                  <div className="mt-1 text-sm text-white/60 line-clamp-2">{p.content}</div>
                  <div className="mt-3 flex gap-2">
                    {p.status === 1 && (
                      <button
                        onClick={() => offline(p.post_id)}
                        className="text-[11px] px-3 py-1.5 rounded-full text-white/60"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)' }}
                      >
                        下架
                      </button>
                    )}
                    <button
                      onClick={() => remove(p.post_id)}
                      className="text-[11px] px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(255,94,120,0.1)', color: '#FF8FA3', border: '0.5px solid rgba(255,94,120,0.2)' }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <button
        onClick={logout}
        className="mx-5 mt-6 w-[calc(100%-2.5rem)] h-12 rounded-xl text-sm text-white/50"
        style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.06)' }}
      >
        退出登录
      </button>

      <TabBar />
      <Toast />
    </div>
  );
}
