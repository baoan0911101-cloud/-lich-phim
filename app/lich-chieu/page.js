'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import MovieModal from '@/components/MovieModal';

// 📅 TỰ ĐỘNG TÍNH NGÀY TỪ "DAY"
const getDateFromDay = (day) => {
  const today = new Date();
  let targetDate = new Date(today);
  const dayUpper = day.toUpperCase();

  if (dayUpper === 'HÔM NAY') {
    targetDate = today;
  } else if (dayUpper === 'NGÀY MAI') {
    targetDate.setDate(today.getDate() + 1);
  } else if (dayUpper === 'THỨ 2') {
    const currentDay = today.getDay();
    const daysUntil = (1 - currentDay + 7) % 7;
    targetDate.setDate(today.getDate() + (daysUntil || 7));
  } else if (dayUpper === 'THỨ 3') {
    const currentDay = today.getDay();
    const daysUntil = (2 - currentDay + 7) % 7;
    targetDate.setDate(today.getDate() + (daysUntil || 7));
  } else if (dayUpper === 'THỨ 4') {
    const currentDay = today.getDay();
    const daysUntil = (3 - currentDay + 7) % 7;
    targetDate.setDate(today.getDate() + (daysUntil || 7));
  } else if (dayUpper === 'THỨ 5') {
    const currentDay = today.getDay();
    const daysUntil = (4 - currentDay + 7) % 7;
    targetDate.setDate(today.getDate() + (daysUntil || 7));
  } else if (dayUpper === 'THỨ 6') {
    const currentDay = today.getDay();
    const daysUntil = (5 - currentDay + 7) % 7;
    targetDate.setDate(today.getDate() + (daysUntil || 7));
  } else if (dayUpper === 'THỨ 7') {
    const currentDay = today.getDay();
    const daysUntil = (6 - currentDay + 7) % 7;
    targetDate.setDate(today.getDate() + (daysUntil || 7));
  } else if (dayUpper === 'CHỦ NHẬT') {
    const currentDay = today.getDay();
    const daysUntil = (0 - currentDay + 7) % 7;
    targetDate.setDate(today.getDate() + (daysUntil || 7));
  }

  const d = String(targetDate.getDate()).padStart(2, '0');
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}`;
};

export default function LichChieuPage() {
  const [schedule, setSchedule] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Tất cả');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieCache, setMovieCache] = useState({}); // 🎯 CACHE

  useEffect(() => {
    Promise.all([
      fetch('/api/schedule').then((r) => r.json()),
      fetch('/api/movies').then((r) => r.json()),
    ])
      .then(([scheduleData, moviesData]) => {
        setSchedule(scheduleData.schedule || []);
        setMovies(moviesData.movies || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const grouped = schedule.reduce((acc, item) => {
    if (!acc[item.day]) {
      acc[item.day] = { day: item.day, items: [] };
    }
    acc[item.day].items.push(item);
    return acc;
  }, {});

  const days = Object.keys(grouped);

  // 🎯 PRELOAD KHI HOVER
  const preloadMovie = (movieId) => {
    if (!movieId || movieCache[movieId]) return;

    fetch(`/api/movies/${movieId}`)
      .then((r) => r.json())
      .then((data) => {
        setMovieCache((prev) => ({ ...prev, [movieId]: data.movie }));
      })
      .catch(() => {});
  };

  // 🎯 MỞ POPUP — DÙNG CACHE NẾU CÓ
  const handleOpenMovie = async (item) => {
    if (!item.movie_id) return;

    // Tạo data tạm từ schedule để mở popup ngay
    const tempData = {
      id: item.movie_id,
      title: item.title,
      poster: item.poster,
      season: item.season,
      show_at: item.show_at || null,
      schedule_id: item.id,
      // Placeholder
      tags: [],
      custom_links: [],
      seasons: [],
      overview: '',
      _loading: true, // 🎯 Đánh dấu đang load
    };

    // Mở popup ngay với data tạm
    setSelectedMovie(tempData);

    // Nếu có cache → dùng luôn
    if (movieCache[item.movie_id]) {
      const cached = movieCache[item.movie_id];
      setSelectedMovie({
        ...cached,
        title: item.title || cached.title,
        poster: item.poster || cached.poster,
        season: item.season || cached.season,
        show_at: item.show_at || cached.show_at || null,
        schedule_id: item.id,
        _loading: false,
      });
      return;
    }

    // Chưa có cache → gọi API và update sau
    try {
      const res = await fetch(`/api/movies/${item.movie_id}`);
      if (!res.ok) return;

      const data = await res.json();
      const fullMovie = data.movie;

      const mergedData = {
        ...fullMovie,
        title: item.title || fullMovie.title,
        poster: item.poster || fullMovie.poster,
        season: item.season || fullMovie.season,
        show_at: item.show_at || fullMovie.show_at || null,
        schedule_id: item.id,
        _loading: false,
      };

      // Lưu vào cache
      setMovieCache((prev) => ({ ...prev, [item.movie_id]: fullMovie }));

      // Update popup với data đầy đủ
      setSelectedMovie(mergedData);
    } catch (err) {
      console.error('Lỗi mở popup:', err);
    }
  };

  const getItems = () => {
    if (activeDay === 'Tất cả') return schedule;
    return grouped[activeDay]?.items || [];
  };

  const items = getItems();

  if (loading) {
    return (
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <div className="h-20 bg-[#151d2e] rounded-2xl animate-pulse mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[16/9] rounded-xl bg-[#151d2e] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 md:px-6 md:py-6 max-w-6xl mx-auto">
      <div className="mb-5 anim-fadeInUp d-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">📅</span>
          <h1 className="text-2xl font-black grad-text">Lịch Chiếu Phim</h1>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/30">
            {schedule.length} Lịch
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Theo dõi lộ trình các phần mới & bộ phim sắp lên sóng trên website
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

      {days.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-5 anim-fadeInUp d-2">
          <button
            onClick={() => setActiveDay('Tất cả')}
            className={`px-4 py-2.5 rounded-2xl whitespace-nowrap btn-tap text-center shrink-0 transition-all border ${
              activeDay === 'Tất cả'
                ? 'bg-white text-slate-900 font-bold shadow-lg scale-105 border-white'
                : 'card-bg text-slate-300 border-slate-700/50 hover:text-white'
            }`}
          >
            <div className="text-xs font-bold">
              Tất Cả Ngày ({schedule.length})
            </div>
          </button>

          {days.map((d) => {
            const active = activeDay === d;
            const isToday = d.toUpperCase().includes('HÔM NAY');
            const isTomorrow = d.toUpperCase().includes('NGÀY MAI');

            return (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                className={`px-4 py-2.5 rounded-2xl whitespace-nowrap btn-tap text-center shrink-0 transition-all border ${
                  active
                    ? 'bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg scale-105 border-orange-400'
                    : 'card-bg text-slate-300 border-slate-700/50 hover:text-white'
                }`}
              >
                <div className="text-[10px] font-bold opacity-90 flex items-center gap-1 justify-center">
                  {isToday && '🔴'} {isTomorrow && '🟡'} {d}
                </div>
                <div className="text-xs font-bold mt-0.5">
                  {getDateFromDay(d)}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="anim-fadeInUp d-3">
          {activeDay !== 'Tất cả' && grouped[activeDay] && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                ⏰ {activeDay}
              </span>
              <span className="text-xs text-slate-500">
                {getDateFromDay(activeDay)} · {items.length} phim
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((item, i) => {
              const movieData = movies.find((m) => m.id === item.movie_id);
              const isAvailable = !!item.movie_id;

              return (
                <div
                  key={`${item.id}-${i}`}
                  onClick={() => handleOpenMovie(item)}
                  onMouseEnter={() => preloadMovie(item.movie_id)} // 🎯 PRELOAD
                  onTouchStart={() => preloadMovie(item.movie_id)} // 🎯 PRELOAD MOBILE
                  className={`block anim-fadeInUp group ${
                    isAvailable ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden card-bg">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-4xl">
                        🎬
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                    {item.season && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur text-[10px] font-bold text-amber-300 border border-amber-400/30">
                        {item.season}
                      </div>
                    )}

                    {activeDay === 'Tất cả' && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[9px] font-bold shadow-lg">
                        {item.day} · {getDateFromDay(item.day)}
                      </div>
                    )}

                    {item.show_at && new Date(item.show_at) > new Date() && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-amber-500/90 backdrop-blur text-[9px] font-bold text-white flex items-center gap-1">
                        ⏰{' '}
                        {new Date(item.show_at).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}

                    {item.status && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {item.status}
                      </div>
                    )}
                  </div>

                  <div className="mt-2">
                    <h3 className="text-[12px] font-bold text-white line-clamp-2 leading-tight group-hover:text-rose-300 transition-colors">
                      {item.title}
                    </h3>
                    {movieData?.title_goc && (
                      <p className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">
                        {movieData.title_goc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
