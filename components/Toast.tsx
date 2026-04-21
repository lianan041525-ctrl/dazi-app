'use client';
import { useEffect, useState } from 'react';

let setter: ((msg: string) => void) | null = null;
export function toast(msg: string) { setter?.(msg); }

export default function Toast() {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    setter = (m) => {
      setMsg(m);
      setTimeout(() => setMsg(''), 2000);
    };
    return () => { setter = null; };
  }, []);
  if (!msg) return null;
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                    bg-black/80 text-white px-4 py-2 rounded-lg text-sm">
      {msg}
    </div>
  );
}
