'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function TopHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);

  // Hiệu ứng scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lấy số người online mỗi 30s
  useEffect(() => {
    const fetchOnline = () => {
      fetch('/api/online')
        .then((r) => r.json())
        .then((d) => setOnlineCount(d.online || 1))
        .catch(() => {});
    };
    
    fetchOnline();
    const interval = setInterval(fetchOnline, 30000); // 30 giây update 1 lần
    
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 anim-slideDown transition-all duration-500 ${
        scrolled
          ? 'glass-header shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-md md:max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center text-white text-sm font-black group-hover:rotate-12 transition-transform duration-500">
            ▶
          </div>
          <div className="font-black text-lg tracking-tight grad-text">
            XemVietSub
          </div>
        </Link>

        {/* BADGE SỐ NGƯỜI ONLINE */}
        <div className="ml-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-400">
            {onlineCount} online
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/admin"
            className="w-9 h-9 rounded-xl bg-[#151d2e] border border-[#1e293b] flex items-center justify-center text-slate-300 btn-tap hover:border-rose-400/50 transition-colors"
            title="Quản trị"
          >
            ⚙
          </Link>
        </div>
      </div>
    </header>
  );
}
