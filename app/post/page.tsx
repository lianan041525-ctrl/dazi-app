'use client';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { CATEGORIES, TIME_OPTIONS } from '@/lib/constants';
import { useCityStore } from '@/lib/store';
import Toast, { toast } from '@/components/Toast';

function PostInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { city } = useCityStore();

  const [category, setCategory] = useState(params.get('category') || 'meal');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [district, setDistrict] = useState('');
  const [timeType, setTimeType] = useState(1);
  const [wechat, setWechat] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) {
        router.replace('/login?redirect=/post');
        return;
      }
      const { data } = await sb
        .from('profiles')
        .select('wechat_id')
        .eq('user_id', user.id)
        .single();
      if (data?.wechat_id) setWechat(data.wechat_id);
      setReady(true);
    })();
  }, [router]);

  const submit = async () => {
    if (!title.trim()) return toast('请填写活动标题');
    if (!content.trim()) return toast('请填写活动描述');
    if (!wechat.trim()) return toast('请填写微信号，方便对方联系');

    setLoading(true);
    const sb = supabaseBrowser();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      setLoading(false);
      return router.replace('/login');
    }

    // 同步保存微信号到 profile
    await sb.from('profiles').update({ wechat_id: wechat }).eq('user_id', user.id);

    const { error } = await sb
      .from('posts')
      .insert({
        user_id: user.id,
        category,
        title: title.trim(),
        content: content.trim(),
        city,
        district: district.trim(),
        meet_time_type: timeType,
        status: 1,
      })
      .select('post_id')
      .single();

    setLoading(false);
    if (error) return toast(error.message);
    toast('发布成功');
    router.replace(`/list?category=${category}`);
  };

  if (!ready) return <div className="p-8 text-center text-gray-400 text-sm">加载中...</div>;

  return (
    <div className="min-h-screen pb-8">
      <header className="h-12 flex items-center px-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-500 w-6 text-left">
          ←
        </button>
        <h1 className="flex-1 text-center font-medium">发布需求</h1>
        <div className="w-6" />
      </header>

      <div className="px-4 py-4 space-y-4">
        <div>
          <label className="text-sm text-gray-600">搭子类型</label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`py-2.5 rounded-xl text-sm border transition
                  ${
                    category === c.key
                      ? 'border-brand bg-brand-50 text-brand'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">活动标题</label>
          <input
            value={title}
            maxLength={20}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：周六一起打羽毛球"
            className="w-full mt-2 h-11 px-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-brand/40"
          />
          <div className="text-right text-xs text-gray-400 mt-1">{title.length}/20</div>
        </div>

        <div>
          <label className="text-sm text-gray-600">活动描述</label>
          <textarea
            value={content}
            maxLength={100}
            rows={4}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写清楚时间、地点、想找什么样的人"
            className="w-full mt-2 p-3 bg-white rounded-xl outline-none resize-none focus:ring-2 focus:ring-brand/40"
          />
          <div className="text-right text-xs text-gray-400">{content.length}/100</div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm text-gray-600">城市</label>
            <div className="mt-2 h-11 px-3 bg-white rounded-xl flex items-center text-gray-700">
              📍 {city}
            </div>
          </div>
          <div className="flex-1">
            <label className="text-sm text-gray-600">区域</label>
            <input
              value={district}
              maxLength={30}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="如：南山区"
              className="w-full mt-2 h-11 px-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">时间</label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTimeType(t.value)}
                className={`py-2.5 rounded-xl text-sm border transition
                  ${
                    timeType === t.value
                      ? 'border-brand bg-brand-50 text-brand'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">微信号（对方联系你用）</label>
          <input
            value={wechat}
            maxLength={32}
            onChange={(e) => setWechat(e.target.value)}
            placeholder="填写你的微信号"
            className="w-full mt-2 h-11 px-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-brand/40"
          />
          <p className="text-xs text-gray-400 mt-1">仅在对方点击「联系」后展示给对方</p>
        </div>

        <button
          disabled={loading}
          onClick={submit}
          className="w-full h-12 bg-brand text-white rounded-xl font-medium disabled:opacity-50 mt-4 active:scale-[0.98] transition"
        >
          {loading ? '发布中...' : '发布并开始匹配'}
        </button>
      </div>

      <Toast />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">加载中...</div>}>
      <PostInner />
    </Suspense>
  );
}
