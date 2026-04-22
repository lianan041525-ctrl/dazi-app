'use client';
import { HOT_CITIES } from '@/lib/constants';
import { useCityStore } from '@/lib/store';

export default function CitySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { city, setCity } = useCityStore();

  if (!open) return null;

  const choose = (c: string) => {
    setCity(c);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-5 safe-bottom rounded-t-3xl"
        style={{ background: '#1A1530', border: '0.5px solid rgba(255,255,255,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center text-white font-semibold mb-4">切换城市</div>
        <div className="grid grid-cols-4 gap-2">
          {HOT_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => choose(c)}
              className="py-2.5 rounded-xl text-sm transition"
              style={city === c ? {
                background: 'linear-gradient(135deg, #FF5E78, #6C5CE7)',
                color: '#fff',
              } : {
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.7)',
                border: '0.5px solid rgba(255,255,255,0.06)',
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl text-sm text-white/50"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          取消
        </button>
      </div>
    </div>
  );
}
