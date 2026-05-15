'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { toast } from '@/components/Toast';
import Toast from '@/components/Toast';
import TabBar from '@/components/TabBar';

export default function CheckInPage() {
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [checkedToday, setCheckedToday] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<string[]>([]);
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push('/login?redirect=/checkin'); return; }

      const today = new Date().toISOString().slice(0, 10);

      const { data: profile } = await sb.from('profiles')
        .select('vip_expires_at').eq('user_id', user.id).single();
      if (profile?.vip_expires_at && new Date(profile.vip_expires_at) > new Date()) {
        setIsVip(true);
      }

      const { data: recs } = await sb.from('check_ins')
        .select('check_in_date')
        .eq('user_id', user.id)
        .order('check_in_date', { ascending: false })
        .limit(30);

      const dates = (recs || []).map((r: any) => r.check_in_date);
      setRecords(dates);

      const todayDone = dates.includes(today);
      setCheckedToday(todayDone);

      let s = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        if (dates.includes(ds)) s++;
        else if (i === 0 && !todayDone) continue;
        else break;
      }
      setStreak(s);
    })();
  }, []);

  const doCheckIn = async () => {
    setLoading(true);
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().slice(0, 10);
    const { error } = await sb.from('check_ins').insert({ user_id: user.id, check_in_date: today });

    if (error) { toast('今日已签到'); setLoading(false); return; }

    const newStreak = streak + 1;
    setStreak(newStreak);
    setCheckedToday(true);
    setRecords(prev => [today, ...prev]);

    if (newStreak >= 7) {
      const vipDate = new Date();
      vipDate.setFullYear(vipDate.getFullYear() + 100);
      await sb.from('profiles').update({ vip_expires_at: vipDate.toISOString() }).eq('user_id', user.id);
      setIsVip(true);
      toast('🎉 恭喜获得永久VIP！');
    } else {
      toast(`✅ 签到成功！还差 ${7 - newStreak} 天获得永久VIP`);
    }
    setLoading(false);
  };

  const days = [1,2,3,4,5,6,7];
  const progress = Math.min(streak, 7);

  return (
    <div className="min-h-screen pb-28">
      <Toast />
      <header className="h-12 flex items-center px-4 sticky top-0 z-10"
        style={{ background: 'rgba(10,10,24,0.8)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => router.back()} className="text-white/60 w-10 text-left text-lg">←</button>
        <h1 className="flex-1 text-center text-white font-medium">每日签到</h1>
        <div className="w-10" />
      </header>

      <div className="px-5 pt-6">
        {/* 顶部奖励说明 */}
        <div className="rounded-3xl p-6 text-center mb-6"
          style={{ background: 'linear-gradient(135deg, #FF5E78 0%, #C026D3 50%, #6C5CE7 100%)' }}>
          <div className="text-5xl mb-3">👑</div>
          <div className="text-white font-bold text-xl mb-1">连续签到7天</div>
          <div className="text-white/80 text-sm">送永久VIP会员</div>
          {isVip && <div className="mt-3 bg-white/20 rounded-full px-4 py-1.5 inline-block text-white text-sm font-medium">🎉 已获得永久VIP</div>}
        </div>

        {/* 签到进度 */}
        <div className="glass-card p-5 mb-4">
          <div className="text-sm font-medium text-white mb-4">签到进度 {streak > 0 && <span className="text-white/40 text-xs ml-1">已连续{streak}天</span>}</div>
          <div className="flex gap-2 mb-4">
            {days.map(d => {
              const done = d <= progress && (d < streak || (d === streak && checkedToday));
              const isToday = d === progress + (checkedToday ? 0 : 1);
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all`}
                    style={{
                      background: done ? 'linear-gradient(135deg, #FF6B9D, #C026D3)' :
                        isToday ? 'rgba(255,107,157,0.2)' : 'rgba(255,255,255,0.06)',
                      border: isToday && !checkedToday ? '1.5px solid rgba(255,107,157,0.5)' : 'none',
                      color: done ? '#fff' : isToday ? '#FF6B9D' : 'rgba(255,255,255,0.3)'
                    }}>
                    {done ? '✓' : d === 7 ? '👑' : d}
                  </div>
                  <div className="text-[9px] text-white/30">{d === 7 ? 'VIP' : `第${d}天`}</div>
                </div>
              );
            })}
          </div>

          {/* 进度条 */}
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(progress / 7) * 100}%`, background: 'linear-gradient(90deg, #FF5E78, #6C5CE7)' }} />
          </div>
          <div className="text-xs text-white/40 text-right mt-1">{progress}/7</div>
        </div>

        {/* 签到按钮 */}
        <button
          onClick={doCheckIn}
          disabled={checkedToday || loading || isVip}
          className="w-full h-14 rounded-2xl text-white font-semibold text-base disabled:opacity-50 transition-all active:scale-95"
          style={{ background: checkedToday || isVip ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #FF5E78, #6C5CE7)' }}
        >
          {isVip ? '🎉 已拥有永久VIP' : checkedToday ? `✅ 今日已签到 · 明天继续` : loading ? '签到中...' : '立即签到'}
        </button>

        {/* 签到规则 */}
        <div className="glass-card p-4 mt-4">
          <div className="text-sm font-medium text-white mb-3">活动规则</div>
          <div className="space-y-2 text-xs text-white/50 leading-relaxed">
            <div>· 每天0点后可签到一次，连续签到7天自动获得永久VIP</div>
            <div>· 中断签到后连续天数重新计算</div>
            <div>· 永久VIP享有无限联系搭子、帖子优先展示等全部会员权益</div>
            <div>· 活动最终解释权归心遇平台所有</div>
          </div>
        </div>
      </div>
      <TabBar />
    </div>
  );
}
