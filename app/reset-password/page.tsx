'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!password.trim()) { setError('请输入新密码'); return; }
    if (password.length < 6) { setError('密码至少 6 位'); return; }
    if (password !== confirm) { setError('两次密码不一致'); return; }

    setLoading(true);
    setError('');
    const sb = supabaseBrowser();
    const { error } = await sb.auth.updateUser({ password });

    if (error) {
      setError('重置失败：' + error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.replace('/'), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative"
      style={{ background: '#0A0A18' }}>
      <div className="absolute inset-0 -z-10" style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,107,157,0.2) 0%, transparent 60%)',
      }} />

      <div className="text-4xl mb-4">🔐</div>
      <h1 className="text-xl font-bold text-white mb-2">重置密码</h1>
      <p className="text-white/50 text-sm mb-8">设置你的新密码</p>

      <div className="w-full max-w-sm rounded-3xl p-8"
        style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)' }}>

        {success ? (
          <div className="text-center">
            <div className="text-4xl mb-3">✅</div>
            <div className="text-white font-medium">密码重置成功</div>
            <div className="text-white/50 text-sm mt-2">正在跳转首页...</div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="新密码（至少6位）"
                className="w-full h-12 px-4 rounded-2xl text-white text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)' }}
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="确认新密码"
                className="w-full h-12 px-4 rounded-2xl text-white text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)' }}
              />
            </div>
            {error && (
              <div className="mb-4 px-3 py-2 rounded-xl text-xs text-center"
                style={{ background: 'rgba(255,107,157,0.15)', color: '#FF6B9D' }}>
                {error}
              </div>
            )}
            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full h-12 rounded-2xl text-white font-semibold text-sm disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #FF6B9D, #C026D3)' }}
            >
              {loading ? '重置中...' : '确认重置'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
