'use client';
import { useEffect, useState } from 'react';

let showFn: ((msg: string) => void) | null = null;
export function toast(msg: string) { showFn?.(msg); }

export default function Toast() {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    showFn = (m: string) => {
      setMsg(m);
      setShow(true);
      setTimeout(() => setShow(false), 2000);
    };
    return () => { showFn = null; };
  }, []);

  if (!show) return null;
  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="px-5 py-3 text-sm text-white whitespace-nowrap rounded-xl"
        style={{ background: 'rgba(30, 25, 50, 0.9)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
        {msg}
      </div>
    </div>
  );
}
