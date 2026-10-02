'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import MovieModal from '@/components/MovieModal';

export default function LichChieuPage() {
  const [schedule, setSchedule] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Tất cả');
  const [selectedMovie, setSelectedMovie] = useState(null);

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

  // 🎯 Tìm movie data từ movies array theo movie_id
  const getMovieData = (item) => {
    if (!item.movie_id) return item;
    const movie = movies.find((m) => m.id === item.movie_id);
    if (!movie) return item;

    // Merge schedule + movie
    return {
      ...movie,
      // Ghi đè từ schedule (nếu có)
      title: item.title || movie.title,
      poster: item.poster || movie.poster,
      season: item.season || movie.season,
      show_at: item.show_at || null,
      schedule_id: item.id,
    };
  };

  // Lấy danh sách items theo ngày
  const getItems = () => {
    if (activeDay === 'Tất cả') {
      return schedule;
    }
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
      {/* HEADER */}
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

      {/* TABS NGÀY */}
      {days.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-5 anim-fadeInUp d-2">
          {/* TAB TẤT CẢ */}
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

          {/* CÁC NGÀY */}
          {days.map((d) => {
            const active = activeDay === d;
            const dayData = grouped[d];
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
                  {dayData.date}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* DANH SÁCH PHIM */}
      {items.length > 0 && (
        <div className="anim-fadeInUp d-3">
          {/* TIÊU ĐỀ NGÀY */}
          {activeDay !== 'Tất cả' && grouped[activeDay] && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                ⏰ {activeDay}
              </span>
              <span className="text-xs text-slate-500">
                {grouped[activeDay].date} · {items.length} phim
              </span>
            </div>
          )}

          {/* GRID PHIM */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((item, i) => {
              const movieData = getMovieData(item);
              const isAvailable = !!movieData.movie_id;

              return (
                <div
                  key={`${item.id}-${i}`}
                  onClick={() => {
                    if (isAvailable) {
                      setSelectedMovie(movieData);
                    }
                  }}
                  className={`block anim-fadeInUp group ${
                    isAvailable ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  {/* ẢNH NGANG 16:9 */}
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden card-bg">
                    {movieData.poster ? (
                      <img
                        src={movieData.poster}
                        alt={movieData.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-4xl">
                        🎬
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                    {/* Badge Mùa */}
                    {movieData.season && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur text-[10px] font-bold text-amber-300 border border-amber-400/30">
                        {movieData.season}
                      </div>
                    )}

                    {/* Badge Ngày */}
                    {activeDay === 'Tất cả' && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[9px] font-bold shadow-lg">
                        {item.day}
                      </div>
                    )}

                    {/* Badge show_at (nếu có) */}
                    {movieData.show_at &&
                      new Date(movieData.show_at) > new Date() && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-amber-500/90 backdrop-blur text-[9px] font-bold text-white flex items-center gap-1">
                          ⏰{' '}
                          {new Date(movieData.show_at).toLocaleString(
                            'vi-VN',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </div>
                      )}

                    {/* Status */}
                    {movieData.status && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {movieData.status}
                      </div>
                    )}
                  </div>

                  {/* THÔNG TIN PHIM */}
                  <div className="mt-2">
                    <h3 className="text-[12px] font-bold text-white line-clamp-2 leading-tight group-hover:text-rose-300 transition-colors">
                      {movieData.title}
                    </h3>
                    {movieData.title_goc && (
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

      {/* MODAL */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
