'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import posthog from 'posthog-js';
import { CATEGORY_MAP, TIME_OPTIONS, timeAgo } from '@/lib/constants';
import Toast, { toast } from '@/components/Toast';

export default function DetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [wechatRevealed, setReveal] = useState<string | null>(null);
  const [contacting, setContacting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadError(null);
      const sb = supabaseBrowser();
      const { data, error } = await sb.from('posts')
        .select('post_id,user_id,category,title,content,city,district,meet_time_type,status,created_at,contact_count,profiles!posts_user_id_fkey(nickname,gender,age,wechat_id,city)')
        .eq('post_id', params.id).maybeSingle();
      
      if (error) {
        setLoadError(error.message);
      } else if (!data) {
        setLoadError('需求不存在或已下架');
      } else {
        setPost(data);
      }
      setLoading(false);
    })();
  }, [params.id]);

  const contact = async () => {
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return router.push(`/login?redirect=/detail/${params.id}`);
    if (user.id === post.user_id) return toast('不能联系自己哦');

    setContacting(true);
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: post.post_id }),
    });
    const json = await res.json();
    setContacting(false);
    if (json.code === 403 && json.data?.need_vip) {
      if (confirm('今日联系次数已用完\n开通会员享无限联系搭子\n\n是否前往开通？')) {
        router.push('/vip');
      }
      return;
    }
    if (json.code !== 0) return toast(json.msg);
    setReveal(json.data.wechat_id);
  };

  const submitReport = async (reason: string) => {
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return router.push(`/login?redirect=/detail/${params.id}`);
    await sb.from('reports').insert({
      reporter_id: user.id,
      target_post_id: post.post_id,
      reason,
    });
    setReportOpen(false);
    toast('举报已提交');
  };

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/40 text-sm">加载中...</div>
      </div>
    );
  }

  // 加载失败
  if (loadError || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
        <div className="text-4xl mb-4">😕</div>
        <div className="text-white/80 text-base mb-2">加载失败</div>
        <div className="text-white/50 text-xs mb-6">{loadError || '无法获取详情'}</div>
        <button onClick={() => router.back()}
          className="btn-gradient px-6 h-10 rounded-full text-sm font-medium">
          返回
        </button>
      </div>
    );
  }

  const cat = CATEGORY_MAP[post.category] ?? { name: '其他', icon: '📌' };
  const time = TIME_OPTIONS.find((t) => t.value === post.meet_time_type)?.label ?? '';
  const p = post.profiles;
  const gender = p?.gender;
  const genderIcon = gender === 2 ? '♀' : gender === 1 ? '♂' : '';

  return (
    <div className="min-h-screen pb-28">
      <header className="h-12 flex items-center px-4 sticky top-0 z-10"
        style={{ background: 'rgba(15,11,30,0.85)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => router.back()} className="text-white/60 w-10 text-left text-lg">←</button>
        <h1 className="flex-1 text-center text-white font-medium">详情</h1>
        <button onClick={() => setReportOpen(true)} className="text-white/50 text-xs w-10 text-right">举报</button>
      </header>

      <div className="p-5">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-medium overflow-hidden shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)', color: '#fff' }}>
              {p?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{p?.nickname?.[0] ?? '搭'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium truncate">{p?.nickname}</span>
                {genderIcon && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: gender === 2 ? 'rgba(255,94,120,0.2)' : 'rgba(108,92,231,0.2)', color: gender === 2 ? '#FFC4D0' : '#B8B0E8' }}>
                    {genderIcon} {p?.age ?? ''}
                  </span>
                )}
              </div>
              <div className="text-xs text-white/50 mt-1">
                {post.city}{post.district ? ` · ${post.district}` : ''}
              </div>
              {p?.bio && <div className="text-[11px] text-white/40 mt-1 line-clamp-1">{p.bio}</div>}
            </div>
            <span className="text-xs text-white/40 shrink-0">{timeAgo(post.created_at)}</span>
          </div>
        </div>

        <div className="glass-card p-4 mt-3">
          <div className="flex gap-2 flex-wrap">
            <span className="text-[11px] px-2 py-1 rounded-md" style={{ background: 'rgba(255,94,120,0.2)', color: '#FFC4D0' }}>
              {cat.icon} {cat.name}
            </span>
            {time && (
              <span className="text-[11px] px-2 py-1 rounded-md bg-white/6 text-white/60">
                🕒 {time}
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-white mt-3">{post.title}</h2>
          <p className="text-sm text-white/75 leading-relaxed mt-2 whitespace-pre-wrap">{post.content}</p>
        </div>

        {wechatRevealed && (
          <div className="glass-card p-4 mt-3" style={{ background: 'rgba(6,214,160,0.08)', borderColor: 'rgba(6,214,160,0.2)' }}>
            <div className="text-xs text-accent-green">对方微信号</div>
            <div className="text-lg font-semibold text-white mt-1.5 flex items-center gap-3">
              <span className="font-mono">{wechatRevealed}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(wechatRevealed); toast('已复制'); }}
                className="text-[11px] px-3 py-1 rounded-full"
                style={{ background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)', color: '#fff' }}
              >
                复制
              </button>
            </div>
            <div className="text-xs text-white/50 mt-2">打开微信添加好友,记得说明来意 ~</div>
          </div>
        )}
      </div>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 safe-bottom z-20"
        style={{ background: 'rgba(15,11,30,0.9)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={contact}
          disabled={contacting || !!wechatRevealed}
          className="btn-gradient w-full h-12 rounded-xl font-medium disabled:opacity-60"
        >
          {wechatRevealed ? '已获取联系方式' : contacting ? '请稍候...' : '打招呼'}
        </button>
      </footer>

      {reportOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setReportOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-5 safe-bottom rounded-t-3xl"
            style={{ background: '#1A1530', border: '0.5px solid rgba(255,255,255,0.08)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center text-white font-semibold mb-4">举报原因</div>
            <div className="space-y-2">
              {['骚扰辱骂', '虚假信息', '色情低俗', '诈骗引流', '其他'].map((r) => (
                <button
                  key={r}
                  onClick={() => submitReport(r)}
                  className="w-full py-3 text-sm text-white/80 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.06)' }}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              onClick={() => setReportOpen(false)}
              className="w-full mt-3 py-3 rounded-xl text-sm text-white/50"
              style={{ background: 'rgba(255,255,255,0.02)' }}
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
