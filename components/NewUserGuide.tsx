'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewUserGuide() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('is_new_user') === '1') {
      setShow(true);
      localStorage.removeItem('is_new_user');
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-t-3xl p-6 pb-10"
        style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a18 100%)' }}>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <div className="text-white font-bold text-xl mb-1">欢迎加入心遇！</div>
          <div className="text-white/60 text-sm">完成以下步骤，快速找到你的搭子</div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ background: 'rgba(255,107,157,0.1)', border: '1px solid rgba(255,107,157,0.2)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
              style={{ background: 'rgba(255,107,157,0.2)' }}>📝</div>
            <div>
              <div className="text-white text-sm font-medium">完善个人资料</div>
              <div className="text-white/50 text-xs mt-0.5">上传头像、填写昵称，让别人认识你</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.2)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
              style={{ background: 'rgba(108,92,231,0.2)' }}>✍️</div>
            <div>
              <div className="text-white text-sm font-medium">发布第一个帖子</div>
              <div className="text-white/50 text-xs mt-0.5">告诉大家你想找什么搭子</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => { setShow(false); router.push('/mine/edit'); }}
            className="w-full h-12 rounded-2xl text-white font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)' }}>
            先完善资料 →
          </button>
          <button
            onClick={() => { setShow(false); router.push('/post'); }}
            className="w-full h-12 rounded-2xl text-white/70 text-sm"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            直接发帖子
          </button>
          <button
            onClick={() => setShow(false)}
            className="w-full text-white/30 text-xs py-2">
            跳过，先逛逛
          </button>
        </div>
      </div>
    </div>
  );
}
