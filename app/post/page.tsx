'use client';
import jsQR from 'jsqr';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { CATEGORIES, TIME_OPTIONS } from '@/lib/constants';
import { useCityStore } from '@/lib/store';
import CitySheet from '@/components/CitySheet';
import Toast, { toast } from '@/components/Toast';
import posthog from 'posthog-js';

function PostInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { city } = useCityStore();
  const [citySheetOpen, setCitySheetOpen] = useState(false);

  const [category, setCategory] = useState(params.get('category') || 'meal');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [district, setDistrict] = useState('');
  const [timeType, setTimeType] = useState(1);
  const [wechat, setWechat] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAllCats, setShowAllCats] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imgUploading, setImgUploading] = useState(false);
  const [ready, setReady] = useState(false);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setNotLoggedIn(true); return; }
      const { data } = await sb.from('profiles').select('wechat_id').eq('user_id', user.id).single();
      if (data?.wechat_id) setWechat(data.wechat_id);
      setReady(true);
    })();
  }, [router]);

  const checkQRCode = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(false); return; }
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          resolve(!!code);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadImage = async (file: File) => {
    const hasQR = await checkQRCode(file);
    if (hasQR) { toast('禁止上传二维码图片，请上传个人真实照片'); return; }
    if (images.length >= 4) { toast('最多上传4张图片'); return; }
    if (file.size > 5 * 1024 * 1024) { toast('图片不超过5MB'); return; }
    setImgUploading(true);
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setImgUploading(false); return; }
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await sb.storage.from('post-images').upload(path, file);
    if (error) { toast('上传失败'); setImgUploading(false); return; }
    const { data } = sb.storage.from('post-images').getPublicUrl(path);
    setImages(prev => [...prev, data.publicUrl]);
    setImgUploading(false);
  };

  const submit = async () => {
    if (!title.trim()) return toast('请填写活动标题');
    if (!content.trim()) return toast('请填写活动描述');

    // 敏感词过滤
    const BANNED_WORDS = [
      '一夜情','约炮','打飞机','Q群','微信群','加群','色情','援交','包养','小姐','鸭子',
      '性服务','嫖','卖淫','约会费','见面费','空降','外围','兼职赚钱','日结','百分百',
      '无套','口交','肛交','做爱','激情','成人','裸聊','视频诱惑','发育','下面','Q裙','QQ裙','qq群','QQ群','兼职赚','白虎','骚气','调教','福利发送','哥哥来玩','援交','母狗','求调教','聊骚','社精','冲四次','找哥哥','想要了',
      '骚女','少妇','骚妇','嫩妹','一日情缘','非诚勿扰','约啪','深入交流','全国各地','到处有',
      '外围','包夜','上门服务','约炮','打炮','车震','开房','一夜','炮友','约个','约你',
      '发育好','身材好私','大尺度','不穿','露出','自拍','私拍','福利图','私信我','加我',
      '微信号','WeChat','wechat','wx号','vx号','telegram','tg群','频道','拉你',
      '兼职','日结','周结','佣金','提成','赚钱','招聘','招募','诚招',
      '色情','涩涩','h图','r18','成人网','av','AV','黄片','小电影',
    ];
    const allText = (title + content).toLowerCase();
    const hit = BANNED_WORDS.find(w => allText.includes(w));
    if (hit) return toast('内容含有违规词汇，请修改后重新发布');
    if (!wechat.trim()) return toast('请填写微信号');

    setLoading(true);
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setLoading(false); return router.replace('/login'); }

    await sb.from('profiles').update({ wechat_id: wechat }).eq('user_id', user.id);

    const { error } = await sb.from('posts').insert({
      user_id: user.id,
      category,
      title: title.trim(),
      content: content.trim(),
      city,
      images,
      district: district.trim(),
      meet_time_type: timeType,
      status: 1,
    }).select('post_id').single();

    setLoading(false);
    if (error) return toast(error.message);
    posthog.capture('post_published', { category });
    toast('发布成功');
    router.replace(`/list?category=${category}`);
  };

  // 未登录引导态
  if (notLoggedIn) {
    return (
      <div className="min-h-screen pb-8">
        <header className="h-12 flex items-center px-4 sticky top-0 z-10"
          style={{ background: 'rgba(15,11,30,0.85)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => router.back()} className="text-white/60 w-8 text-left text-lg">←</button>
          <h1 className="flex-1 text-center text-white font-medium">发布需求</h1>
          <div className="w-8" />
        </header>

        <section className="px-5 mt-16">
          <div className="glass-card p-8 text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
              style={{
                background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)',
                boxShadow: '0 8px 24px rgba(255,94,120,0.3)',
              }}>
              ✨
            </div>
            <div className="text-white text-base font-semibold">登录后才能发布搭子需求</div>
            <div className="text-white/50 text-xs mt-2 leading-relaxed">
              登录后,你就可以<br />
              发布需求、接收打招呼、管理自己的帖子 🌸
            </div>
            <button
              onClick={() => router.push('/login?redirect=/post')}
              className="btn-gradient mt-6 px-8 h-10 rounded-full text-sm font-semibold"
            >
              立即登录
            </button>
            <button
              onClick={() => router.push('/')}
              className="block mx-auto mt-3 text-white/40 text-xs"
            >
              先去逛逛
            </button>
          </div>
        </section>

        <Toast />
      </div>
    );
  }

  if (!ready) return <div className="p-8 text-center text-white/40 text-sm">加载中...</div>;

  return (
    <div className="min-h-screen pb-8">
      <header className="h-12 flex items-center px-4 sticky top-0 z-10"
        style={{ background: 'rgba(15,11,30,0.85)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => router.back()} className="text-white/60 w-8 text-left text-lg">←</button>
        <h1 className="flex-1 text-center text-white font-medium">发布需求</h1>
        <div className="w-8" />
      </header>

      <div className="px-5 py-5 space-y-5">
        <div>
          <label className="text-sm text-white/60">搭子类型</label>
          <div className="grid grid-cols-3 gap-2 mt-2.5">
            {(showAllCats ? CATEGORIES : [...CATEGORIES].slice(0, 6)).map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className="py-3 rounded-xl text-xs transition"
                style={category === c.key ? {
                  background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(255,94,120,0.3)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.7)',
                  border: '0.5px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="text-base">{c.icon}</div>
                <div className="mt-1">{c.name}</div>
              </button>
            ))}
            <button onClick={() => setShowAllCats(v => !v)}
              className="col-span-3 py-2.5 rounded-xl text-xs text-white/40 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
              {showAllCats ? '▲ 收起' : `▼ 展开全部 ${CATEGORIES.length} 个分类`}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm text-white/60">活动标题</label>
          <input
            value={title}
            maxLength={20}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如:周六一起打羽毛球"
            className="glass-input w-full mt-2.5 h-12 px-4 rounded-xl text-sm"
          />
          <div className="text-right text-[11px] text-white/30 mt-1">{title.length}/20</div>
        </div>

        <div>
          <label className="text-sm text-white/60">活动描述</label>
          <textarea
            value={content}
            maxLength={100}
            rows={4}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写清楚时间、地点、想找什么样的人"
            className="glass-input w-full mt-2.5 p-4 rounded-xl text-sm resize-none"
          />
          <div className="text-right text-[11px] text-white/30">{content.length}/100</div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm text-white/60">城市</label>
            <button onClick={() => setCitySheetOpen(true)}
              className="glass-input mt-2.5 h-12 px-4 rounded-xl flex items-center text-sm text-white/70 w-full text-left">
              📍 {city} <span className="ml-auto text-white/30 text-xs">切换</span>
            </button>
          </div>
          <div className="flex-1">
            <label className="text-sm text-white/60">区域</label>
            <input
              value={district}
              maxLength={30}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="如:南山区"
              className="glass-input w-full mt-2.5 h-12 px-4 rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-white/60">时间</label>
          <div className="grid grid-cols-4 gap-2 mt-2.5">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTimeType(t.value)}
                className="py-3 rounded-xl text-xs transition"
                style={timeType === t.value ? {
                  background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)',
                  color: '#fff',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.7)',
                  border: '0.5px solid rgba(255,255,255,0.08)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-white/60">微信号</label>
          <input
            value={wechat}
            maxLength={32}
            onChange={(e) => setWechat(e.target.value)}
            placeholder="填写你的微信号"
            className="glass-input w-full mt-2.5 h-12 px-4 rounded-xl text-sm"
          />
          <p className="text-[11px] text-white/30 mt-1.5">仅在对方点击「打招呼」后展示给对方</p>
        </div>

        <div>
          <label className="text-sm text-white/60">图片（可选，最多4张）</label>
          <div className="flex gap-2 mt-2.5 flex-wrap">
            {images.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>x</button>
              </div>
            ))}
            {images.length < 4 && (
              <label className="w-20 h-20 rounded-xl flex flex-col items-center justify-center cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)' }}>
                <span className="text-2xl text-white/30">{imgUploading ? '...' : '+'}</span>
                <span className="text-xs text-white/30 mt-1">{imgUploading ? '上传中' : '添加图片'}</span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
              </label>
            )}
          </div>
        </div>
        <button
          disabled={loading}
          onClick={submit}
          className="btn-gradient w-full h-12 rounded-xl font-medium text-sm disabled:opacity-50 mt-4"
        >
          {loading ? '发布中...' : '发布并开始匹配'}
        </button>
      </div>

      <Toast />
      <CitySheet open={citySheetOpen} onClose={() => setCitySheetOpen(false)} />
    </div>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white/40 text-sm">加载中...</div>}>
      <PostInner />
    </Suspense>
  );
}
