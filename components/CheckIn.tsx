'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { toast } from '@/components/Toast';

export default function CheckIn() {
  const [show, setShow] = useState(false);
  const [streak, setStreak] = useState(0);
  const [checkedToday, setCheckedToday] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().slice(0, 10);

      // 查最近7天签到记录
      const { data: records } = await sb.from('check_ins')
        .select('check_in_date')
        .eq('user_id', user.id)
        .order('check_in_date', { ascending: false })
        .limit(7);

      if (!records) return;

      // 是否今天已签到
      const todayDone = records.some(r => r.check_in_date === today);
      setCheckedToday(todayDone);

      // 计算连续签到天数
      let s = todayDone ? 1 : 0;
      const base = todayDone ? 1 : 0;
      for (let i = base; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i - (todayDone ? 0 : 1));
        const ds = d.toISOString().slice(0, 10);
        if (records.some(r => r.check_in_date === ds)) s++;
        else break;
      }
      setStreak(s);
      setShow(true);
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

    if (newStreak >= 7) {
      // 升级永久VIP
      const vipDate = new Date();
      vipDate.setFullYear(vipDate.getFullYear() + 100);
      await sb.from('profiles').update({ vip_expires_at: vipDate.toISOString() }).eq('user_id', user.id);
      toast('🎉 恭喜获得永久VIP！');
    } else {
      toast(`✅ 签到成功！已连续签到 ${newStreak} 天`);
    }
    setLoading(false);
  };

  if (!show) return null;

  const days = [1,2,3,4,5,6,7];

  return (
    <div className="glass-card p-4 mx-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-white">每日签到</div>
        <div className="text-xs text-white/40">连续签到7天送永久VIP</div>
      </div>
      <div className="flex gap-2 mb-4">
        {days.map(d => (
          <div key={d} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
              ${d < streak ? 'text-white' : d === streak && checkedToday ? 'text-white' : 'text-white/30'}`}
              style={{
                background: d < streak || (d === streak && checkedToday)
                  ? 'linear-gradient(135deg, #FF6B9D, #C026D3)'
                  : 'rgba(255,255,255,0.08)'
              }}>
              {d < streak || (d === streak && checkedToday) ? '✓' : d === 7 ? '👑' : d}
            </div>
            <div className="text-[9px] text-white/30">{d === 7 ? 'VIP' : `第${d}天`}</div>
          </div>
        ))}
      </div>
      <button
        onClick={doCheckIn}
        disabled={checkedToday || loading}
        className="w-full h-10 rounded-xl text-sm font-medium disabled:opacity-50"
        style={{
          background: checkedToday
            ? 'rgba(255,255,255,0.08)'
            : 'linear-gradient(135deg, #FF5E78, #6C5CE7)',
          color: '#fff'
        }}
      >
        {checkedToday ? `已签到 · 已连续${streak}天` : loading ? '签到中...' : '立即签到'}
      </button>
    </div>
  );
}
