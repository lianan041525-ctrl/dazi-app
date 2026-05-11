'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

const ADMIN_UID = '025c3bf4-1e7c-41ce-8bf8-3a956cf40498';

type User = {
  user_id: string; nickname: string; city: string; gender: number;
  age: number; created_at: string; vip_expires_at: string | null;
  blocked: boolean; total_posts: number; total_contacts: number; phone: string;
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user || user.id !== ADMIN_UID) { router.push('/'); return; }
      loadUsers(sb);
    })();
  }, []);

  const loadUsers = async (sb?: any) => {
    setLoading(true);
    const client = sb || supabaseBrowser();
    const { data } = await client.from('profiles')
      .select('user_id,nickname,city,gender,age,created_at,vip_expires_at,blocked,total_posts,total_contacts,phone')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setUsers(data);
    setLoading(false);
  };

  const toggleBlock = async (uid: string, blocked: boolean) => {
    const { error } = await supabaseBrowser().from('profiles').update({ blocked: !blocked }).eq('user_id', uid);
    if (error) { setActionMsg('❌ 操作失败'); return; }
    setUsers(prev => prev.map(u => u.user_id === uid ? { ...u, blocked: !blocked } : u));
    setActionMsg(blocked ? '✅ 已解封' : '✅ 已封禁');
    setTimeout(() => setActionMsg(''), 2000);
  };

  const setVip = async (uid: string) => {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    const { error } = await supabaseBrowser().from('profiles').update({ vip_expires_at: expires.toISOString() }).eq('user_id', uid);
    if (error) { setActionMsg('❌ 操作失败'); return; }
    setUsers(prev => prev.map(u => u.user_id === uid ? { ...u, vip_expires_at: expires.toISOString() } : u));
    setActionMsg('✅ 已设置VIP（1年）');
    setTimeout(() => setActionMsg(''), 2000);
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || (u.nickname || '').includes(search) || (u.city || '').includes(search) || (u.phone || '').includes(search);
    const matchFilter = filter === 'all' || (filter === 'vip' && u.vip_expires_at && new Date(u.vip_expires_at) > new Date()) || (filter === 'blocked' && u.blocked);
    return matchSearch && matchFilter;
  });

  const isVip = (u: User) => u.vip_expires_at && new Date(u.vip_expires_at) > new Date();

  return (
    <div className="min-h-screen" style={{ background: '#0A0A18' }}>
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(10,10,24,0.95)', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => router.push('/admin')} className="text-white/50 hover:text-white text-sm">← 返回</button>
        <h1 className="text-white font-medium flex-1">用户管理</h1>
        <span className="text-white/30 text-xs">{filtered.length} 人</span>
      </div>

      <div className="px-4 py-3 max-w-2xl mx-auto">
        {actionMsg && <div className="text-center text-sm mb-3" style={{ color: actionMsg.startsWith('✅') ? '#4ade80' : '#f87171' }}>{actionMsg}</div>}

        <input
          className="w-full rounded-xl px-4 py-2.5 text-sm text-white mb-3 outline-none"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          placeholder="搜索昵称 / 城市 / 手机号"
          value={search} onChange={e => setSearch(e.target.value)}
        />

        <div className="flex gap-2 mb-4">
          {[['all','全部'],['vip','会员'],['blocked','已封禁']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={{ background: filter === val ? 'linear-gradient(135deg,#FF6B9D,#C026D3)' : 'rgba(255,255,255,0.07)', color: filter === val ? '#fff' : 'rgba(255,255,255,0.5)' }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-white/30 py-10">加载中...</div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(u => (
              <div key={u.user_id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: u.blocked ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#FF6B9D,#C026D3)' }}>
                      {(u.nickname || '搭')?.[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-white font-medium">{u.nickname || '未设置'}</span>
                        {isVip(u) && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700' }}>VIP</span>}
                        {u.blocked && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>已封禁</span>}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">{u.city || '未知'} · {u.gender === 1 ? '男' : u.gender === 2 ? '女' : '未知'} · {u.age || '?'}岁</div>
                    </div>
                  </div>
                  <div className="text-xs text-white/25 shrink-0">{new Date(u.created_at).toLocaleDateString('zh-CN')}</div>
                </div>

                <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-xs text-white/40">发帖 {u.total_posts || 0}</span>
                  <span className="text-xs text-white/40">联系 {u.total_contacts || 0}</span>
                  <div className="flex-1" />
                  {!isVip(u) && (
                    <button onClick={() => setVip(u.user_id)}
                      className="text-xs px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.2)' }}>
                      送VIP
                    </button>
                  )}
                  <button onClick={() => toggleBlock(u.user_id, u.blocked)}
                    className="text-xs px-2.5 py-1 rounded-lg"
                    style={{ background: u.blocked ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', color: u.blocked ? '#4ade80' : '#f87171', border: u.blocked ? '1px solid rgba(74,222,128,0.2)' : '1px solid rgba(239,68,68,0.2)' }}>
                    {u.blocked ? '解封' : '封禁'}
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center text-white/30 py-10">没有找到用户</div>}
          </div>
        )}
      </div>
    </div>
  );
}
