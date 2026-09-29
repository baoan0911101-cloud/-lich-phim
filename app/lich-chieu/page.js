'use client';
import { useState } from 'react';
import Link from 'next/link';
import { lichChieu } from '@/lib/data';

export default function LichChieuPage() {
  const [day, setDay] = useState('HÔM NAY');

  const days = Object.keys(lichChieu);
  const current = lichChieu[day] || lichChieu[days[0]];

  return (
    <div className="px-4 py-4">
      <div className="mb-5 anim-fadeInUp d-1">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-black grad-text">Lịch Chiếu</h1>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/30">
            {current.movies.length}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Theo dõi lộ trình các phần mới sắp lên sóng
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-3 anim-fadeInUp d-2">
        {days.map((d) => {
          const active = day === d;
          return (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`px-4 py-2 rounded-2xl whitespace-nowrap btn-tap text-center ${
                active
                  ? 'bg-gradient-to-br from-rose-400 to-orange-500 text-white shadow-lg'
                  : 'card-bg text-slate-400'
              }`}
            >
              <div className="text-[9px] font-bold opacity-80">{d}</div>
              <div className="text-xs font-bold">{lichChieu[d].date}</div>
            </button>
          );
        })}
      </div>

      {current && (
        <div className="mt-2 anim-fadeInUp d-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-amber-400">
              ⏰ {current.label}
            </span>
            <span className="text-xs text-slate-500">
              {current.date} · {current.total} phim
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {current.movies.map((m, i) => (
              <Link
                key={m.id}
                href={`/movie/${m.id}`}
                className="block card-hover anim-fadeInUp"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden card-bg group">
                  <img
                    src={m.poster}
                    alt={m.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-[10px] font-bold text-amber-300">
                    {m.season}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-2">
                    <h3 className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                      {m.title}
                    </h3>
                  </div>
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-400">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  {m.status}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
