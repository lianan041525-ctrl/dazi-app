'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { toast } from '@/components/Toast';
import Toast from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const [phone, setPhone]       = useState('');
  const [otp, setOtp]           = useState('');
  const [sent, setSent]         = useState(false);
  const [countdown, setCount]   = useState(0);
  const [loading, setLoading]   = useState(false);

  const supabase = supabaseBrowser();

  const sendOtp = async () => {
    if (!/^1\d{10}$/.test(phone)) return toast('请输入正确手机号');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: phone,
    });
    setLoading(false);
    if (error) return toast(error.message);
    setSent(true);
    setCount(60);
    const t = setInterval(() => {
      setCount((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  const verify = async () => {
    if (otp.length !== 6) return toast('请输入6位验证码');
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: phone,
      token: otp,
      type: 'email',
    });
    setLoading(false);
    if (error) return toast(error.message);
    toast('登录成功');
    router.replace(redirect);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-14">
      <button onClick={() => router.back()} className="text-gray-500 text-sm w-fit">← 返回</button>

      <h1 className="mt-10 text-2xl font-bold">登录附近搭子</h1>
      <p className="text-gray-500 text-sm mt-1">登录后发布需求、联系搭子</p>

      <div className="mt-8 space-y-3">
        <div className="flex items-center bg-white rounded-xl px-4 h-12">
          <span className="text-gray-500 text-sm">+86</span>
          <input
            inputMode="numeric" maxLength={11}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="请输入手机号"
            className="flex-1 ml-3 bg-transparent outline-none"
          />
        </div>

        <div className="flex items-center bg-white rounded-xl px-4 h-12">
          <input
            inputMode="numeric" maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="6位验证码"
            className="flex-1 bg-transparent outline-none"
          />
          <button
            disabled={countdown > 0 || loading}
            onClick={sendOtp}
            className="text-brand text-sm disabled:text-gray-400"
          >
            {countdown > 0 ? `${countdown}s` : sent ? '重新发送' : '获取验证码'}
          </button>
        </div>
      </div>

      <button
        disabled={loading}
        onClick={verify}
        className="mt-6 h-12 bg-brand text-white rounded-xl font-medium disabled:opacity-50"
      >
        {loading ? '登录中...' : '登录 / 注册'}
      </button>

      <p className="mt-6 text-xs text-gray-400 text-center">
        登录即代表同意《用户协议》与《隐私政策》
      </p>

      <Toast />
    </div>
  );
}
