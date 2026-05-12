'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { HOT_CITIES } from '@/lib/constants';
import Toast, { toast } from '@/components/Toast';

export default function EditProfilePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<0 | 1 | 2>(0);
  const [age, setAge] = useState<number | ''>('');
  const [city, setCity] = useState('深圳');
  const [bio, setBio] = useState('');
  const [wechat, setWechat] = useState('');
  const [avatar, setAvatar] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.replace('/login?redirect=/mine/edit'); return; }

      const { data } = await sb.from('profiles').select('*').eq('user_id', user.id).single();
      if (data) {
        setNickname(data.nickname || '');
        setGender((data.gender ?? 0) as 0 | 1 | 2);
        setAge(data.age ?? '');
        setCity(data.city || '深圳');
        setBio(data.bio || '');
        setWechat(data.wechat_id || '');
        setAvatar(data.avatar_url || '');
      }
      setReady(true);
    })();
  }, [router]);

  const uploadAvatar = async (file: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast('图片不超过 2MB'); return; }
    setUploading(true);
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setUploading(false); return; }
    const ext = file.name.split('.').pop();
    const path = `${user.id}.${ext}`;
    const { error } = await sb.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) { toast('上传失败'); setUploading(false); return; }
    const { data } = sb.storage.from('avatars').getPublicUrl(path);
    const url = data.publicUrl + '?t=' + Date.now();
    setAvatar(url);
    await sb.from('profiles').update({ avatar_url: url }).eq('user_id', user.id);
    toast('头像已更新');
    setUploading(false);
  };

  const save = async () => {
    if (!nickname.trim()) return toast('请填写昵称');
    if (nickname.length > 20) return toast('昵称不超过 20 字');
    if (age !== '' && (Number(age) < 16 || Number(age) > 80)) return toast('年龄需在 16–80 之间');
    if (bio.length > 100) return toast('简介不超过 100 字');

    setSaving(true);
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setSaving(false); return router.replace('/login'); }

    const { error } = await sb.from('profiles').update({
      nickname: nickname.trim(),
      gender,
      age: age === '' ? null : Number(age),
      city,
      bio: bio.trim(),
      wechat_id: wechat.trim(),
      avatar_url: avatar || null,
    }).eq('user_id', user.id);

    setSaving(false);
    if (error) return toast(error.message);
    toast('保存成功');
    setTimeout(() => router.back(), 800);
  };

  if (!ready) return <div className="p-8 text-center text-white/40 text-sm">加载中...</div>;

  const firstChar = nickname.trim()[0] || '搭';

  return (
    <div className="min-h-screen pb-24">
      <header className="h-12 flex items-center px-4 sticky top-0 z-10"
        style={{ background: 'rgba(15,11,30,0.85)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => router.back()} className="text-white/60 w-8 text-left text-lg">←</button>
        <h1 className="flex-1 text-center text-white font-medium">编辑资料</h1>
        <div className="w-8" />
      </header>

      {/* 头像上传 */}
      <section className="flex flex-col items-center pt-8 pb-4">
        <label className="cursor-pointer relative group">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-medium overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)', color: '#fff', boxShadow: '0 8px 24px rgba(255,94,120,0.3)' }}>
            {avatar ? <img src={avatar} alt="头像" className="w-full h-full object-cover" /> : firstChar}
          </div>
          <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <span className="text-white text-xs">{uploading ? '上传中...' : '换头像'}</span>
          </div>
          <input type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
        </label>
        <p className="text-[11px] text-white/40 mt-3">{uploading ? '上传中...' : '点击更换头像'}</p>
      </section>

      {/* 字段表单 */}
      <section className="px-5 space-y-5 mt-2">
        <div>
          <label className="text-sm text-white/60">昵称</label>
          <input
            value={nickname}
            maxLength={20}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="给自己起个名字"
            className="glass-input w-full mt-2 h-12 px-4 rounded-xl text-sm"
          />
          <div className="text-right text-[11px] text-white/30 mt-1">{nickname.length}/20</div>
        </div>

        <div>
          <label className="text-sm text-white/60">性别</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { v: 1 as const, label: '♂ 男生' },
              { v: 2 as const, label: '♀ 女生' },
              { v: 0 as const, label: '保密' },
            ].map((g) => (
              <button
                key={g.v}
                onClick={() => setGender(g.v)}
                className="py-3 rounded-xl text-sm transition"
                style={gender === g.v ? {
                  background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)',
                  color: '#fff',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.7)',
                  border: '0.5px solid rgba(255,255,255,0.08)',
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-white/60">年龄</label>
          <input
            type="number"
            inputMode="numeric"
            min={16}
            max={80}
            value={age}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '') return setAge('');
              const n = parseInt(v, 10);
              if (!isNaN(n)) setAge(n);
            }}
            placeholder="填写年龄(选填)"
            className="glass-input w-full mt-2 h-12 px-4 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="text-sm text-white/60">城市</label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {HOT_CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className="py-2.5 rounded-xl text-xs transition"
                style={city === c ? {
                  background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)',
                  color: '#fff',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.7)',
                  border: '0.5px solid rgba(255,255,255,0.08)',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-white/60">个人简介</label>
          <textarea
            value={bio}
            maxLength={100}
            rows={3}
            onChange={(e) => setBio(e.target.value)}
            placeholder="介绍一下你自己,比如喜欢什么、想找什么样的搭子"
            className="glass-input w-full mt-2 p-3 rounded-xl text-sm resize-none"
          />
          <div className="text-right text-[11px] text-white/30">{bio.length}/100</div>
        </div>

        <div>
          <label className="text-sm text-white/60">微信号</label>
          <input
            value={wechat}
            maxLength={32}
            onChange={(e) => setWechat(e.target.value)}
            placeholder="对方打招呼时展示给对方"
            className="glass-input w-full mt-2 h-12 px-4 rounded-xl text-sm"
          />
          <p className="text-[11px] text-white/30 mt-1.5">仅在发布需求后 + 对方主动打招呼才会展示</p>
        </div>

        <button
          disabled={saving}
          onClick={save}
          className="btn-gradient w-full h-12 rounded-xl font-medium text-sm disabled:opacity-50 mt-4"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </section>

      <Toast />
    </div>
  );
}
