'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', icon: '🎞', label: 'Phim hay' },
  { href: '/lich-chieu', icon: '📅', label: 'Lịch chiếu', dot: true },
  { href: '/donate', icon: '♡', label: 'Donate' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const activeIndex = NAV.findIndex((item) => item.href === pathname);

  return (
    <nav className="bottom-nav fixed bottom-4 z-50 anim-fadeInUp">
      <div className="relative w-full rounded-2xl overflow-hidden bg-black/60 backdrop-blur-2xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {/* Viền sáng trên cùng */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-10" />

        {/* Pill gradient chạy theo tab active */}
        <div
          className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-br from-rose-400/80 to-orange-500/80 shadow-[0_4px_16px_rgba(251,113,133,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            left: `calc(${(activeIndex * 100) / NAV.length}% + 6px)`,
            width: `calc(${100 / NAV.length}% - 12px)`,
            opacity: activeIndex === -1 ? 0 : 1,
          }}
        />

        <div className="relative grid grid-cols-3">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-3 flex flex-col items-center justify-center gap-1 transition-colors duration-300 z-10 ${
                  active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-lg relative leading-none flex items-center gap-1">
                  <span
                    className={`text-amber-300 transition-all duration-300 ease-out ${
                      active
                        ? 'w-3 opacity-100 translate-x-0'
                        : 'w-0 opacity-0 -translate-x-2'
                    }`}
                  >
                    ▸
                  </span>

                  <span>{item.icon}</span>

                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}

                  {item.dot && !active && (
                    <span className="absolute -top-0.5 -right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400">
                      <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping" />
                    </span>
                  )}
                </div>

                <span
                  className={`text-[11px] leading-none ${
                    active ? 'font-bold' : 'font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
