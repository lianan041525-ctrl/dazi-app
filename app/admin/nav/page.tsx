'use client';
import NavConfigPanel from '@/components/NavConfigPanel';

export default function NavPage() {
  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h1 className="text-white font-medium text-lg mb-6">导航配置</h1>
      <NavConfigPanel />
    </div>
  );
}
