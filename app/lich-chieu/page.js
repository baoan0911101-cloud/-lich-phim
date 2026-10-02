'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LichChieuPage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(null);

  useEffect(() => {
    fetch('/api/schedule')
      .then((r) => r.json())
      .then((data) => {
        const items = data.schedule || [];
        setSchedule(items);

        // Lấy ngày đầu tiên có lịch
        if (items.length > 0) {
          const firstDay = items[0].day;
          setActiveDay(firstDay);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Group theo ngày
  const grouped = schedule.reduce((acc, item) => {
    if (!acc[item.day]) {
      acc[item.day] = {
        day: item.day,
        date: item.date,
        items: [],
      };
    }
    acc[item.day].items.push(item);
    return acc;
  }, {});

  const days = Object.keys(grouped);
  const current = activeDay ? grouped[activeDay] : null;

  if (loading) {
    return (
      <div className="px-4 py-8">
        <div className="h-8 w-32 bg-[#151d2e] rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-2xl bg-[#151d2e] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 md:px-6 md:py-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="mb-5 anim-fadeInUp d-1">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-black grad-text">Lịch Chiếu</h1>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/30">
            {schedule.length}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Theo dõi lộ trình các phần mới sắp lên sóng
        </p>
      </div>

      {schedule.length === 0 && (
        <div className="text-center py-16 anim-fadeInUp">
          <div className="text-5xl mb-3 opacity-30">📅</div>
          <p className="text-sm text-slate-500">
            Chưa có lịch chiếu. Vào /admin để thêm.
          </p>
        </div>
      )}

      {/* NGÀY */}
      {days.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-5 anim-fadeInUp d-2">
          {days.map((d) => {
            const active = activeDay === d;
            const dayData = grouped[d];
            const isToday = d.toUpperCase().includes('HÔM NAY');
            const isTomorrow = d.toUpperCase().includes('NGÀY MAI');

            return (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                className={`px-4 py-2.5 rounded-2xl whitespace-nowrap btn-tap text-center shrink-0 transition-all ${
                  active
                    ? 'bg-gradient-to-br from-rose-400 to-orange-500 text-white shadow-lg scale-105'
                    : 'card-bg text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-[10px] font-bold opacity-80 flex items-center gap-1 justify-center">
                  {isToday && '🔴'} {isTomorrow && '🟡'} {d}
                </div>
                <div className="text-xs font-bold mt-0.5">
                  {dayData.date}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* DANH SÁCH PHIM THEO NGÀY */}
      {current && (
        <div className="anim-fadeInUp d-3">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
              ⏰ {current.day}
            </span>
            <span className="text-xs text-slate-500">
              {current.date} · {current.items.length} phim
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {current.items.map((m, i) => (
              <Link
                key={m.id}
                href={m.movie_id ? `/movie/${m.movie_id}` : '#'}
                className={`block card-hover anim-fadeInUp group ${
                  !m.movie_id ? 'cursor-default' : ''
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden card-bg">
                  {m.poster ? (
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-4xl">
                      🎬
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                  {m.season && (
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur text-[10px] font-bold text-amber-300 border border-amber-400/20">
                      {m.season}
                    </div>
                  )}

                  {m.status && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-500/90 backdrop-blur text-[10px] font-bold text-white">
                      {m.status}
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <h3 className="text-[12px] font-black text-white line-clamp-2 leading-tight drop-shadow-lg">
                      {m.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
