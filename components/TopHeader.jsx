'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function TopHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center text-white text-sm font-black group-hover:rotate-12 transition-transform duration-500">
            ▶
          </div>
          <div className="font-black text-lg tracking-tight grad-text">
            XemVietSub
          </div>
        </Link>

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
