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
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) {
        router.replace('/login?redirect=/mine');
        return;
      }
      const { data: p } = await sb
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setProfile(p);
      const { data: list } = await sb
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setPosts(list ?? []);
      setLoading(false);
    })();
  }, [router]);

  const logout = async () => {
    await supabaseBrowser().auth.signOut();
    router.replace('/');
  };

  const offline = async (id: number) => {
    const { error } = await supabaseBrowser()
      .from('posts')
      .update({ status: 3 })
      .eq('post_id', id);
    if (error) return toast(error.message);
    setPosts((ps) => ps.map((p) => (p.post_id === id ? { ...p, status: 3 } : p)));
    toast('已下架');
  };

  const remove = async (id: number) => {
    if (!confirm('确定删除这条发布吗？')) return;
    const { error } = await supabaseBrowser()
      .from('posts')
      .delete()
      .eq('post_id', id);
    if (error) return toast(error.message);
    setPosts((ps) => ps.filter((p) => p.post_id !== id));
    toast('已删除');
  };

  if (loading)
    return <div className="p-8 text-center text-gray-400 text-sm">加载中...</div>;

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-gradient-to-br from-brand to-brand-600 text-white p-6 pt-12">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl overflow-hidden">
            {profile?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{profile?.nickname?.[0] ?? '👤'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-semibold truncate">{profile?.nickname}</div>
            <div className="text-xs opacity-80 mt-0.5">📍 {profile?.city}</div>
          </div>
        </div>
      </header>

      <section className="px-4 mt-4">
        <h2 className="text-base font-semibold mb-3">我的发布</h2>
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
            还没有发布过需求
            <button
              onClick={() => router.push('/post')}
              className="block mx-auto mt-4 px-5 h-9 bg-brand text-white rounded-full text-sm"
            >
              去发布
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => {
              const cat = CATEGORY_MAP[p.category] ?? { name: '其他', icon: '📌' };
              const statusText =
                p.status === 1 ? '匹配中' : p.status === 3 ? '已下架' : '已结束';
              return (
                <div key={p.post_id} className="bg-white rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-brand-50 text-brand px-2 py-0.5 rounded-full">
                      {cat.icon} {cat.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full
                      ${
                        p.status === 1
                          ? 'bg-green-50 text-green-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {statusText}
                    </span>
                    <span className="ml-auto text-xs text-gray-400">
                      {timeAgo(p.created_at)}
                    </span>
                  </div>
                  <div
                    className="mt-2 font-medium"
                    onClick={() => router.push(`/detail/${p.post_id}`)}
                  >
                    {p.title}
                  </div>
                  <div className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {p.content}
                  </div>
                  <div className="mt-3 flex gap-2">
                    {p.status === 1 && (
                      <button
                        onClick={() => offline(p.post_id)}
                        className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600"
                      >
                        下架
                      </button>
                    )}
                    <button
                      onClick={() => remove(p.post_id)}
                      className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500"
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
        className="mx-4 mt-6 w-[calc(100%-2rem)] h-11 bg-white text-gray-500 rounded-xl text-sm"
      >
        退出登录
      </button>

      <TabBar />
      <Toast />
    </div>
  );
}
