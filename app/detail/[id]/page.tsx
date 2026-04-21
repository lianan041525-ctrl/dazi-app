'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { CATEGORY_MAP, TIME_OPTIONS, timeAgo } from '@/lib/constants';
import Toast, { toast } from '@/components/Toast';

export default function DetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [wechatRevealed, setReveal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data } = await sb
        .from('posts')
        .select('*,profiles(nickname,avatar,gender,age,wechat_id,city)')
        .eq('post_id', params.id)
        .single();
      setPost(data);
    })();
  }, [params.id]);

  const contact = async () => {
    const sb = supabaseBrowser();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return router.push(`/login?redirect=/detail/${params.id}`);
    if (user.id === post.user_id) return toast('不能联系自己哦');

    setLoading(true);
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: post.post_id }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.code !== 0) return toast(json.msg);
    setReveal(json.data.wechat_id);
  };

  const submitReport = async (reason: string) => {
    const sb = supabaseBrowser();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return router.push(`/login?redirect=/detail/${params.id}`);
    await sb.from('reports').insert({
      reporter_id: user.id,
      target_post_id: post.post_id,
      reason,
    });
    setReportOpen(false);
    toast('举报已提交');
  };

  if (!post)
    return <div className="p-8 text-center text-gray-400 text-sm">加载中...</div>;

  const cat = CATEGORY_MAP[post.category] ?? { name: '其他', icon: '📌' };
  const time = TIME_OPTIONS.find((t) => t.value === post.meet_time_type)?.label ?? '';
  const p = post.profiles;

  return (
    <div className="min-h-screen pb-28">
      <header className="h-12 flex items-center px-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-500 w-6 text-left">
          ←
        </button>
        <h1 className="flex-1 text-center font-medium">详情</h1>
        <button
          onClick={() => setReportOpen(true)}
          className="text-gray-400 text-xs w-10 text-right"
        >
          举报
        </button>
      </header>

      <div className="bg-white p-4 flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center text-xl overflow-hidden shrink-0">
          {p?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span>{p?.nickname?.[0] ?? '👤'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{p?.nickname}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {p?.age ? `${p.age}岁 · ` : ''}
            {post.city}
            {post.district ? `·${post.district}` : ''}
          </div>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{timeAgo(post.created_at)}</span>
      </div>

      <div className="mt-3 bg-white p-4">
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs bg-brand-50 text-brand px-2 py-1 rounded-full">
            {cat.icon} {cat.name}
          </span>
          {time && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              🕐 {time}
            </span>
          )}
        </div>
        <h2 className="text-lg font-semibold mt-3">{post.title}</h2>
        <p className="text-sm text-gray-700 leading-relaxed mt-2 whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {wechatRevealed && (
        <div className="mt-3 bg-white p-4">
          <div className="text-sm text-gray-500">对方微信号</div>
          <div className="text-lg font-semibold mt-1 flex items-center gap-2">
            <span className="font-mono">{wechatRevealed}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(wechatRevealed);
                toast('已复制');
              }}
              className="text-xs text-brand border border-brand px-2 py-0.5 rounded"
            >
              复制
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            打开微信添加好友，记得说明来意 ~
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white p-3 border-t border-gray-100 safe-bottom">
        <button
          onClick={contact}
          disabled={loading || !!wechatRevealed}
          className="w-full h-12 bg-brand text-white rounded-xl font-medium disabled:opacity-60 active:scale-[0.98] transition"
        >
          {wechatRevealed ? '已获取联系方式' : loading ? '请稍候...' : '立即联系'}
        </button>
      </footer>

      {/* 举报弹窗 */}
      {reportOpen && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setReportOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white rounded-t-3xl p-5 safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-semibold text-center mb-4">举报原因</div>
            <div className="space-y-2">
              {['骚扰辱骂', '虚假信息', '色情低俗', '诈骗引流', '其他'].map((r) => (
                <button
                  key={r}
                  onClick={() => submitReport(r)}
                  className="w-full py-3 text-sm bg-gray-50 rounded-xl"
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              onClick={() => setReportOpen(false)}
              className="w-full mt-3 py-3 bg-gray-100 rounded-xl text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <Toast />
    </div>
  );
}
