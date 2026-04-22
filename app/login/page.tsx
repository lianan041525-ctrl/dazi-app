'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import Toast, { toast } from '@/components/Toast';

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [countdown, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const supabase = supabaseBrowser();

  const sendOtp = async () => {
    if (!email.includes('@')) return toast('请输入正确邮箱');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) return toast(error.message);
    setSent(true);
    setCount(60);
    const t = setInterval(() => {
      setCount((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
    toast('验证码已发送到邮箱');
  };

  const verify = async () => {
    if (otp.length !== 6) return toast('请输入 6 位验证码');
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    setLoading(false);
    if (error) return toast(error.message);
    toast('登录成功');
    router.replace(redirect);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-14">
      <button onClick={() => router.back()} className="text-white/50 text-sm w-fit">← 返回</button>

      <div className="mt-14">
        <h1 className="gradient-text text-3xl font-medium leading-tight">欢迎回来</h1>
        <p className="text-white/50 text-sm mt-2">登录后发现同城的搭子</p>
      </div>

      <div className="mt-10 space-y-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="邮箱"
          className="glass-input w-full h-12 px-4 rounded-xl text-sm"
        />
        <div className="glass-input h-12 px-4 rounded-xl flex items-center">
          <input
            inputMode="numeric" maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="6 位验证码"
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/35"
          />
          <button
            disabled={countdown > 0 || loading}
            onClick={sendOtp}
            className="text-sm font-medium"
            style={{
              background: countdown > 0 ? 'transparent' : 'linear-gradient(135deg, #FF5E78, #6C5CE7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: countdown > 0 ? 'rgba(255,255,255,0.3)' : 'transparent',
            }}
          >
            {countdown > 0 ? `${countdown}s` : sent ? '重新发送' : '获取验证码'}
          </button>
        </div>
      </div>

      <button
        disabled={loading}
        onClick={verify}
        className="btn-gradient mt-8 h-12 rounded-xl font-medium text-sm disabled:opacity-50"
      >
        {loading ? '登录中...' : '登录 / 注册'}
      </button>

      <p className="mt-8 text-[11px] text-white/30 text-center leading-relaxed">
        登录即代表同意《用户协议》与《隐私政策》
      </p>

      <Toast />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white/40 text-sm">加载中...</div>}>
      <LoginInner />
    </Suspense>
  );
}
