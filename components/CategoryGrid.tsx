'use client';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/constants';

export default function CategoryGrid() {
  const router = useRouter();
  return (
    <div className="grid grid-cols-4 gap-3 px-4 py-4 bg-white rounded-2xl mx-4 mt-3 shadow-sm">
      {CATEGORIES.map((c) => (
        <button
          key={c.key}
          onClick={() => router.push(`/list?category=${c.key}`)}
          className="flex flex-col items-center py-2 active:scale-95 transition-transform"
        >
          <span className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl">
            {c.icon}
          </span>
          <span className="text-xs text-gray-700 mt-2">{c.name}</span>
        </button>
      ))}
    </div>
  );
}
