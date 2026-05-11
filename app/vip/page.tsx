'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import TabBar from '@/components/TabBar';
import Toast, { toast } from '@/components/Toast';

export default function VipPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.replace('/login?redirect=/vip'); return; }
      const { data } = await sb.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      setProfile(data);
      setLoading(false);
    })();
  }, [router]);

  const isVip = profile?.vip_expires_at && new Date(profile.vip_expires_at) > new Date();
  const vipExpiry = profile?.vip_expires_at
    ? new Date(profile.vip_expires_at).toLocaleDateString('zh-CN')
    : null;

  const handleBuy = () => {
    toast('支付功能即将开放，敬请期待 🌸');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A18' }}>
      <div className="text-white/40 text-sm">加载中...</div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: '#0A0A18' }}>
      <div className="absolute inset-0 -z-10" style={{
        background: 'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(255,107,157,0.25) 0%, transparent 60%)',
      }} />

      <header className="px-5 pt-14 pb-6 text-center relative">
        <button onClick={() => router.back()}
          className="absolute left-5 top-14 text-white/50 text-lg">←</button>
        <div className="text-3xl mb-2">👑</div>
        <h1 className="text-2xl font-bold text-white">搭子会员</h1>
        <p className="text-white/50 text-sm mt-1">解锁无限联系，找到更多搭子</p>
      </header>

      {isVip ? (
        <div className="mx-5 mb-6 p-4 rounded-2xl text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,157,0.2), rgba(192,38,211,0.15))',
            border: '1px solid rgba(255,107,157,0.3)',
          }}>
          <div className="text-sm text-white/70">当前状态</div>
          <div className="text-lg font-bold mt-1"
            style={{
              background: 'linear-gradient(135deg, #FF6B9D, #C026D3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>👑 会员有效中</div>
          <div className="text-xs text-white/50 mt-1">到期时间：{vipExpiry}</div>
        </div>
      ) : (
        <div className="mx-5 mb-6 p-4 rounded-2xl text-center"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '0.5px solid rgba(255,255,255,0.08)',
          }}>
          <div className="text-sm text-white/50">当前状态</div>
          <div className="text-base font-medium text-white/70 mt-1">普通用户</div>
          <div className="text-xs text-white/40 mt-1">每天可联系 3 位搭子</div>
        </div>
      )}

      <section className="px-5 mb-6">
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div className="grid grid-cols-3 text-center py-3 text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="text-white/50">权益</div>
            <div className="text-white/50">普通用户</div>
            <div style={{
              background: 'linear-gradient(135deg, #FF6B9D, #C026D3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>👑 会员</div>
          </div>
          {[
            { label: '每日联系次数', free: '3次/天', vip: '✅ 无限联系' },
            { label: '帖子优先展示', free: '❌', vip: '✅' },
            { label: '会员专属标识', free: '❌', vip: '👑' },
            { label: '查看谁看过我', free: '❌', vip: '✅（即将上线）' },
            { label: '专属客服', free: '❌', vip: '✅' },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-3 text-center py-3.5 text-xs"
              style={{
                borderTop: '0.5px solid rgba(255,255,255,0.06)',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
              }}>
              <div className="text-white/70">{item.label}</div>
              <div className="text-white/40">{item.free}</div>
              <div className="text-white/90">{item.vip}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mb-8">
        <h2 className="text-sm font-medium text-white/70 mb-3">选择套餐</h2>
        <div className="p-5 rounded-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,157,0.15), rgba(192,38,211,0.1))',
            border: '1.5px solid rgba(255,107,157,0.4)',
          }}>
          <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #FF6B9D, #C026D3)' }}>
            推荐
          </div>
          <div className="flex items-end gap-1.5">
            <span className="text-3xl font-bold text-white">¥30</span>
            <span className="text-white/50 text-sm mb-1">/ 年</span>
          </div>
          <div className="text-white/50 text-xs mt-1">约 ¥2.5 / 月 · 无限每日联系次数</div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {['无限联系', '优先展示', '会员标识', '专属客服'].map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,107,157,0.15)', color: '#FF9DC0' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {!isVip && (
        <div className="px-5">
          <button onClick={handleBuy}
            className="w-full h-14 rounded-2xl text-white font-semibold text-base transition active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #FF6B9D, #C026D3)',
              boxShadow: '0 8px 24px rgba(255,107,157,0.4)',
            }}>
            立即开通 · ¥30/年
          </button>
          <p className="text-center text-white/30 text-xs mt-3">
            支付功能即将开放 · 敬请期待 🌸
          </p>
        </div>
      )}

      <TabBar />
      <Toast />
    </div>
  );
}
