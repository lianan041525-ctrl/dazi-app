'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { CATEGORY_MAP, timeAgo } from '@/lib/constants';
import TabBar from '@/components/TabBar';
import Toast, { toast } from '@/components/Toast';

type SubTab = 'received' | 'sent';

export default function MessagesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<SubTab>('received');
  const [receivedLogs, setReceivedLogs] = useState<any[]>([]);
  const [sentLogs, setSentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.replace('/login?redirect=/messages'); return; }
      setUserId(user.id);

      // 收到的:to_user_id = 我
      const { data: received } = await sb
        .from('contact_logs')
        .select('id, created_at, from_user_id, to_user_id, post_id, greeting, posts(post_id, title, category)')
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      // 获取 from_user 的 profile
      const fromUserIds = [...new Set((received ?? []).map((l: any) => l.from_user_id))];
      const { data: fromProfiles } = fromUserIds.length > 0
        ? await sb.from('profiles').select('user_id,nickname,gender,age,city').in('user_id', fromUserIds)
        : { data: [] };
      const fromMap = Object.fromEntries((fromProfiles ?? []).map((p: any) => [p.user_id, p]));

      setReceivedLogs((received ?? []).map((l: any) => ({
        ...l,
        otherProfile: fromMap[l.from_user_id] || null,
      })));

      // 我发出的:from_user_id = 我
      const { data: sent } = await sb
        .from('contact_logs')
        .select('id, created_at, from_user_id, to_user_id, post_id, greeting, posts(post_id, title, category)')
        .eq('from_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      const toUserIds = [...new Set((sent ?? []).map((l: any) => l.to_user_id))];
      const { data: toProfiles } = toUserIds.length > 0
        ? await sb.from('profiles').select('user_id,nickname,gender,age,city').in('user_id', toUserIds)
        : { data: [] };
      const toMap = Object.fromEntries((toProfiles ?? []).map((p: any) => [p.user_id, p]));

      setSentLogs((sent ?? []).map((l: any) => ({
        ...l,
        otherProfile: toMap[l.to_user_id] || null,
      })));

      setLoading(false);
    })();
  }, [router]);

  const showToast = () => toast('即将上线~');

  const activeLogs = subTab === 'received' ? receivedLogs : sentLogs;

  return (
    <div className="min-h-screen pb-24">
      <header className="px-5 pt-14 pb-4 relative">
        <div className="absolute inset-0 -z-10" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,107,157,0.18) 0%, transparent 60%)',
        }} />
        <h1 className="text-2xl font-bold text-white">消息</h1>
      </header>

      {/* 4 宫格入口 */}
      <section className="px-5 mt-2">
        <div className="glass-card p-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: '❤️', label: '点赞', color: '#FF6B9D' },
              { icon: '💬', label: '评论', color: '#A78BFA' },
              { icon: '👤', label: '关注', color: '#60A5FA' },
              { icon: '📢', label: '系统通知', color: '#FF8C35' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={showToast}
                className="flex flex-col items-center gap-1.5 py-2 active:opacity-70 transition"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}33, ${item.color}11)`,
                    border: `1px solid ${item.color}33`,
                  }}>
                  {item.icon}
                </div>
                <span className="text-[11px] text-white/70">{item.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-white/30 text-center mt-3">点赞、评论、关注功能即将上线</p>
        </div>
      </section>

      {/* Sub Tabs */}
      <section className="px-5 mt-5">
        <div className="flex gap-2 mb-3">
          {[
            { key: 'received' as const, label: '收到的打招呼', count: receivedLogs.length },
            { key: 'sent' as const, label: '我发出的', count: sentLogs.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setSubTab(t.key)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition"
              style={subTab === t.key ? {
                background: 'linear-gradient(135deg, #FF6B9D, #FF8C35)',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(255,107,157,0.35)',
              } : {
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.6)',
                border: '0.5px solid rgba(255,255,255,0.08)',
              }}
            >
              {t.label}
              {t.count > 0 && (
                <span className="ml-1.5 text-[11px] opacity-80">({t.count})</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="glass-card p-10 text-center text-white/40 text-sm">加载中...</div>
        ) : activeLogs.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <div className="text-4xl mb-3">✨</div>
            <div className="text-white/70 text-sm font-medium">暂无新消息</div>
            <div className="text-white/40 text-xs mt-1">
              {subTab === 'received'
                ? '去和身边的搭子们互动吧 🌸'
                : '发现心动的人,主动打个招呼吧 🌸'}
            </div>
            <button
              onClick={() => router.push(subTab === 'received' ? '/post' : '/')}
              className="btn-gradient mt-4 px-6 h-9 rounded-full text-xs font-medium"
            >
              {subTab === 'received' ? '去发布需求' : '去看看'}
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeLogs.map((log) => {
              const isReceived = subTab === 'received';
              const profile = log.otherProfile;
              const post = log.posts;
              const cat = post ? (CATEGORY_MAP[post.category] ?? { name: '其他', icon: '📌' }) : null;
              const nickname = profile?.nickname ?? '搭子';
              const firstChar = nickname[0] ?? '搭';
              const genderBadge = profile?.gender === 1 ? '♂' : profile?.gender === 2 ? '♀' : '';

              return (
                <button
                  key={log.id}
                  onClick={() => post && router.push(`/detail/${post.post_id}`)}
                  className="glass-card p-3.5 w-full text-left active:opacity-80 transition flex items-start gap-3"
                >
                  {/* 头像 */}
                  <div className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-base font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #FF6B9D, #C026D3)' }}>
                    {firstChar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-white truncate">{nickname}</span>
                      {genderBadge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            background: profile?.gender === 2 ? 'rgba(255,107,157,0.2)' : 'rgba(108,92,231,0.2)',
                            color: profile?.gender === 2 ? '#FFC4D0' : '#B8B0E8',
                          }}>
                          {genderBadge}{profile?.age ?? ''}
                        </span>
                      )}
                      <span className="ml-auto text-[10px] text-white/40 shrink-0">{timeAgo(log.created_at)}</span>
                    </div>
                    {/* 打招呼内容(如果有) */}
                    {log.greeting && (
                      <div className="text-xs text-white/85 mt-1 line-clamp-2 leading-relaxed"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,107,157,0.08), rgba(192,38,211,0.05))',
                          padding: '6px 10px',
                          borderRadius: '10px',
                          borderLeft: '2px solid rgba(255,107,157,0.5)',
                        }}>
                        {log.greeting}
                      </div>
                    )}
                    <div className="text-[11px] text-white/50 mt-1.5 truncate">
                      {isReceived ? '👋 Ta 联系了你 · ' : '📤 你联系了 Ta · '}
                      {cat?.icon} {post?.title ?? '(帖子已删除)'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <TabBar />
      <Toast />
    </div>
  );
}
