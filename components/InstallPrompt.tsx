'use client';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 已经安装或已关闭过不再显示


    const isIOSDevice = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isInStandalone) return;

    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      setTimeout(() => setShow(true), 2000);
    } else {
      window.addEventListener('beforeinstallprompt', (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setTimeout(() => setShow(true), 2000);
      });
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
        posthog.capture('pwa_installed', { method: 'android' });
      }
    }
  };

  const handleDismiss = () => {
    setShow(false);

  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={handleDismiss}>
      <div className="w-full max-w-[440px] rounded-3xl p-6"
        style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: 'linear-gradient(135deg, #FF6B9D, #C026D3)' }}>
            💝
          </div>
          <div>
            <div className="text-white font-bold text-lg">添加心遇到桌面</div>
            <div className="text-white/60 text-sm">随时找到你的城市搭子</div>
          </div>
        </div>

        {isIOS ? (
          <div className="bg-white/8 rounded-2xl p-4 mb-4">
            <div className="text-white/80 text-sm leading-relaxed">
              点击底部 <span className="text-white font-medium">分享按钮</span> →
              选择 <span className="text-white font-medium">添加到主屏幕</span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-2xl">⬆️</span>
              <span className="text-white/60 text-xs">Safari 底部工具栏中间的分享图标</span>
            </div>
          </div>
        ) : (
          <button onClick={handleInstall}
            className="w-full py-3.5 rounded-2xl text-white font-semibold text-base mb-3"
            style={{ background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)' }}>
            立即添加到桌面 ✨
          </button>
        )}

        <button onClick={handleDismiss}
          className="w-full py-2.5 rounded-2xl text-white/50 text-sm">
          稍后再说
        </button>
      </div>
    </div>
  );
}
