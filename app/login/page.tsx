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

  // 判断输入类型
  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPhone = (v: string) => /^1[3-9]\d{9}$/.test(v);

  const getEmailByAccount = async (acc: string): Promise<string | null> => {
    const sb = supabaseBrowser();
    if (isEmail(acc)) return acc;
    if (isPhone(acc)) {
      const { data } = await sb
        .from('profiles')
        .select('user_id')
        .eq('phone', acc)
        .maybeSingle();
      if (!data) return null;
      // 通过 user_id 查 auth email
      const { data: userData } = await sb
        .from('profiles')
        .select('user_id')
        .eq('phone', acc)
        .maybeSingle();
      // 用手机号拼一个虚拟邮箱
      return `${acc}@phone.citydz.cc`;
    }
    // 用户名查询
    const { data } = await sb
      .from('profiles')
      .select('username')
      .eq('username', acc)
      .maybeSingle();
    if (!data) return null;
    return `${acc}@username.citydz.cc`;
  };

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

    // 确定邮箱
    let email = '';
    if (isEmail(account)) {
      email = account;
    } else if (isPhone(account)) {
      email = `${account}@phone.citydz.cc`;
    } else {
      email = `${account}@username.citydz.cc`;
    }

    // 先尝试登录
    const { error: signInError } = await sb.auth.signInWithPassword({ email, password });

    if (!signInError) {
      // 登录成功
      router.replace(redirect);
      return;
    }

    // 登录失败 → 尝试注册
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

      // 写入 profiles
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(180deg, #f0faf8 0%, #ffffff 100%)' }}>

      {/* Logo / 标题 */}
      <div className="mb-10 text-center">
        <div className="text-3xl mb-2">🌸</div>
        <h1 className="text-2xl font-bold text-gray-800">City搭子</h1>
        <p className="text-gray-500 text-sm mt-1">同城找搭子，马上约起来</p>
      </div>

      {/* 卡片 */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-lg font-semibold text-gray-800 text-center mb-1">
          登录 / 注册账户
        </h2>
        <p className="text-gray-400 text-xs text-center mb-6">
          未注册用户将会自动注册
        </p>

        {/* 账号输入 */}
        <div className="mb-4">
          <input
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="手机号 / 邮箱 / 用户名"
            className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 text-sm outline-none focus:border-emerald-400 transition"
          />
        </div>

        {/* 密码输入 */}
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码（至少6位）"
            className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 text-sm outline-none focus:border-emerald-400 transition"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 px-3 py-2 bg-red-50 rounded-xl text-red-500 text-xs text-center">
            {error}
          </div>
        )}

        {/* 登录按钮 */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 rounded-2xl text-white font-semibold text-sm transition disabled:opacity-60"
          style={{ background: loading ? '#9de0d0' : 'linear-gradient(135deg, #2dd4a7, #10b981)' }}
        >
          {loading ? '处理中...' : '登录 / 注册'}
        </button>

        {/* 协议 */}
        <div className="flex items-center gap-2 mt-5 justify-center">
          <button
            onClick={() => setAgreed(!agreed)}
            className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition shrink-0"
            style={{
              borderColor: agreed ? '#10b981' : '#d1d5db',
              background: agreed ? '#10b981' : 'white',
            }}
          >
            {agreed && <span className="text-white text-[10px]">✓</span>}
          </button>
          <span className="text-xs text-gray-500">
            已阅读并同意
            <span className="text-emerald-500 mx-1">用户协议</span>
            <span className="text-emerald-500">隐私政策</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">加载中...</div>}>
      <LoginInner />
    </Suspense>
  );
}
