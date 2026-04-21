'use client';
import { HOT_CITIES } from '@/lib/constants';
import { useCityStore } from '@/lib/store';

export default function CitySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { city, setCity } = useCityStore();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px]
                   bg-white rounded-t-3xl p-5 safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-semibold text-center mb-4">选择城市</div>
        <div className="text-sm text-gray-500 mb-2">当前：{city}</div>
        <div className="grid grid-cols-4 gap-3">
          {HOT_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCity(c); onClose(); }}
              className={`py-2 rounded-lg text-sm border
                         ${c === city ? 'border-brand text-brand bg-brand-50' : 'border-gray-200'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-5 py-3 bg-gray-100 rounded-xl text-sm">
          取消
        </button>
      </div>
    </div>
  );
}
