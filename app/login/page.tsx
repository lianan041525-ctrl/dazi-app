'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Suspense } from 'react';

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleReset = async () => {
    if (!resetEmail.trim()) { setError('请输入邮箱'); return; }
    const sb = supabaseBrowser();
    const { error } = await sb.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) { setError('发送失败：' + error.message); return; }
    setResetSent(true);
  };

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPhone = (v: string) => /^1[3-9]\d{9}$/.test(v);

  const handleSubmit = async () => {
    if (!account.trim() || !password.trim()) {
      setError('请填写账号和密码');
      return;
    }
    if (!agreed) {
      setError('请先同意用户协议和隐私政策');
      return;
    }
    if (password.length < 6) {
      setError('密码至少 6 位');
      return;
    }

    setLoading(true);
    setError('');
    const sb = supabaseBrowser();

    let email = '';
    if (isEmail(account)) {
      email = account;
    } else if (isPhone(account)) {
      email = `${account}@phone.xinyu.cc`;
    } else {
      email = `${account}@username.xinyu.cc`;
    }

    const { error: signInError } = await sb.auth.signInWithPassword({ email, password });

    if (!signInError) {
      router.replace(redirect);
      return;
    }

    if (signInError.message.includes('Invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await sb.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message.includes('already registered')
          ? '账号已存在，请检查密码是否正确'
          : '注册失败：' + signUpError.message
        );
        setLoading(false);
        return;
      }

      if (signUpData.user) {
        const profileData: any = {
          user_id: signUpData.user.id,
          nickname: isEmail(account) ? account.split('@')[0] : account,
        };
        if (isPhone(account)) profileData.phone = account;
        else if (!isEmail(account)) profileData.username = account;
        await sb.from('profiles').upsert(profileData);
      }

      router.replace(redirect);
      return;
    }

    setError('登录失败，请检查账号或密码');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: '#0A0A18' }}>

      {/* 背景光晕 */}
      <div className="absolute inset-0 -z-10" style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,107,157,0.2) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(192,38,211,0.15) 0%, transparent 60%)',
      }} />

      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="text-4xl mb-3">🌸</div>
        <h1 className="text-2xl font-bold text-white">心遇</h1>
        <p className="text-white/50 text-sm mt-1">同城找搭子，马上约起来</p>
      </div>

      {/* 卡片 */}
      <div className="w-full max-w-sm rounded-3xl p-8"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
        }}>

        <h2 className="text-lg font-semibold text-white text-center mb-1">
          登录 / 注册账户
        </h2>
        <p className="text-white/40 text-xs text-center mb-6">
          未注册用户将会自动注册
        </p>

        {/* 账号输入 */}
        <div className="mb-4">
          <input
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="手机号 / 邮箱 / 用户名"
            className="w-full h-12 px-4 rounded-2xl text-white text-sm outline-none transition"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '0.5px solid rgba(255,255,255,0.12)',
            }}
          />
        </div>

        {/* 密码输入 */}
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码（至少6位）"
            className="w-full h-12 px-4 rounded-2xl text-white text-sm outline-none transition"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '0.5px solid rgba(255,255,255,0.12)',
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 px-3 py-2 rounded-xl text-xs text-center"
            style={{ background: 'rgba(255,107,157,0.15)', color: '#FF6B9D' }}>
            {error}
          </div>
        )}

        {/* 登录按钮 */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 rounded-2xl text-white font-semibold text-sm transition disabled:opacity-50"
          style={{
            background: loading
              ? 'rgba(255,107,157,0.4)'
              : 'linear-gradient(135deg, #FF6B9D, #C026D3)',
            boxShadow: loading ? 'none' : '0 8px 24px rgba(255,107,157,0.35)',
          }}
        >
          {loading ? '处理中...' : '登录 / 注册'}
        </button>

        {/* 忘记密码 */}
        <button
          onClick={() => setShowReset(!showReset)}
          className="w-full text-center text-xs mt-2 mb-1"
          style={{ color: 'rgba(255,107,157,0.7)' }}
        >
          忘记密码？
        </button>

        {showReset && (
          <div className="mt-2 p-4 rounded-2xl space-y-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
            {resetSent ? (
              <div className="text-center">
                <div className="text-2xl mb-2">📬</div>
                <div className="text-white/80 text-sm">重置邮件已发送</div>
                <div className="text-white/40 text-xs mt-1">请查收邮箱，点击链接重置密码</div>
              </div>
            ) : (
              <>
                <div className="text-white/60 text-xs">输入注册邮箱，我们会发送重置链接</div>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="注册邮箱"
                  className="w-full h-10 px-4 rounded-xl text-white text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)' }}
                />
                <button
                  onClick={handleReset}
                  className="w-full h-10 rounded-xl text-white text-sm font-medium"
                  style={{ background: 'linear-gradient(135deg, #FF6B9D, #C026D3)' }}
                >
                  发送重置邮件
                </button>
              </>
            )}
          </div>
        )}

        {/* 协议 */}
        <div className="flex items-center gap-2 mt-5 justify-center">
          <button
            onClick={() => setAgreed(!agreed)}
            className="w-5 h-5 rounded-full border flex items-center justify-center transition shrink-0"
            style={{
              borderColor: agreed ? '#FF6B9D' : 'rgba(255,255,255,0.3)',
              background: agreed
                ? 'linear-gradient(135deg, #FF6B9D, #C026D3)'
                : 'transparent',
            }}
          >
            {agreed && <span className="text-white text-[10px]">✓</span>}
          </button>
          <span className="text-xs text-white/50">
            已阅读并同意
            <span className="mx-1" style={{ color: '#FF6B9D' }}>用户协议</span>
            <span style={{ color: '#FF6B9D' }}>隐私政策</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: '#0A0A18' }}>
        <div className="text-white/40 text-sm">加载中...</div>
      </div>
    }>
      <LoginInner />
    </Suspense>
  );
}
