'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tất cả');
  const [showSaved, setShowSaved] = useState(false);
  const [savedMovies, setSavedMovies] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/movies')
      .then((r) => r.json())
      .then((data) => {
        setMovies(data.movies || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');
    setSavedMovies(saved);
  }, []);

  useEffect(() => {
    const handleChange = () => {
      const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');
      setSavedMovies(saved);
    };
    window.addEventListener('savedMoviesChanged', handleChange);
    return () => window.removeEventListener('savedMoviesChanged', handleChange);
  }, []);

  const filters = [
    'Tất cả',
    'Hoàn Thành',
    'Nữ Chính',
    'Nam Chính',
    'Tu Tiên',
    'Vả mặt',
    'Xuyên Không',
    'Hài Hước',
    'Tình Cảm',
    'Main Có Não',
    'Nghịch tập',
    'Hệ Thống',
    'Hiện Đại',
    'Vô địch lưu',
    'Xuyên Thư',
    'Đô thị dị năng',
    'Trọng sinh',
    'Fantasy',
    'Kinh Dị',
    'Mạt thế',
    'Võng du',
    'Học đường',
    'Võ hiệp',
    'Vô hạn lưu',
  ];

  const base = showSaved
    ? movies.filter((m) => savedMovies.includes(m.id))
    : filter === 'Tất cả'
    ? movies
    : movies.filter((m) => {
        if (!m.tags) return false;
        return m.tags.some((t) =>
          t.toUpperCase().includes(filter.toUpperCase())
        );
      });

  const filtered = search.trim()
    ? base.filter((m) => {
        const q = search.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.title_goc?.toLowerCase().includes(q)
        );
      })
    : base;

  const featured = filtered[0];
  const sideMovies = filtered.slice(1, 3);
  const newest = filtered;
  const rest = filtered.slice(2);

  const handleFilterClick = (f) => {
    setFilter(f);
    setShowSaved(false);
  };

  if (loading) {
    return (
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
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
    <div className="md:flex md:gap-6 md:px-6 md:py-6">
      {/* SIDEBAR (PC) */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="sticky top-20 card-bg rounded-2xl p-3 max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-2 px-3 py-2 mb-2 border-b border-[#1e293b]">
            <span className="text-amber-400 text-sm">☰</span>
            <h2 className="text-xs font-bold text-slate-300 tracking-wider">
              THỂ LOẠI PHIM
            </h2>
          </div>

          <div className="space-y-0.5">
            {filters.map((f) => {
              const active = !showSaved && filter === f;
              return (
                <button
                  key={f}
                  onClick={() => handleFilterClick(f)}
                  className={`group w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium relative overflow-hidden transition-all duration-300 ease-out ${
                    active
                      ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold shadow-[0_4px_16px_rgba(251,113,133,0.35)] -translate-y-0.5'
                      : 'text-slate-400 hover:bg-[#1e293b] hover:text-slate-100'
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white transition-all duration-300 ${
                      active ? 'h-5 opacity-100' : 'h-0 opacity-0'
                    }`}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <span
                      className={`text-amber-300 transition-all duration-300 ease-out ${
                        active
                          ? 'w-3 opacity-100 translate-x-0'
                          : 'w-0 opacity-0 -translate-x-2'
                      }`}
                    >
                      ▸
                    </span>
                    <span className="flex-1">{f}</span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 px-4 pt-4 pb-6 md:p-0 md:min-w-0">
        {/* SEARCH + ĐÃ LƯU */}
        <section className="anim-fadeInUp d-1 mb-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm phim, diễn viên, nội dung..."
                className="w-full h-12 rounded-2xl card-bg pl-11 pr-4 text-sm placeholder:text-slate-500 focus:outline-none focus:border-rose-400/50 transition-colors"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1e293b] flex items-center justify-center text-slate-400 text-xs btn-tap hover:text-rose-300"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => setShowSaved(!showSaved)}
              className={`h-12 px-4 rounded-2xl flex items-center gap-2 text-sm font-bold btn-tap transition-all duration-300 ${
                showSaved
                  ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-[0_0_20px_rgba(251,113,133,0.5)] scale-[1.03]'
                  : 'card-bg text-slate-300 hover:text-rose-300 hover:scale-[1.03]'
              }`}
            >
              <span className={showSaved ? 'animate-pulse' : ''}>
                {showSaved ? '♥' : '♡'}
              </span>
              <span className="hidden sm:inline">Đã lưu</span>
              {savedMovies.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    showSaved ? 'bg-white/25' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {savedMovies.length}
                </span>
              )}
            </button>
          </div>
        </section>

        {/* FEATURED (mobile) */}
        {!showSaved && !search && featured && (
          <section className="anim-fadeInUp d-2 md:hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-200">
                🔥 Nổi bật hôm nay
              </h2>
              <Link
                href="/lich-chieu"
                className="text-xs text-slate-500 hover:text-rose-300 transition-colors"
              >
                Xem thêm →
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <Link
                href={`/movie/${featured.id}`}
                className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden card-hover group card-bg"
              >
                <div className="aspect-[4/5] relative">
                  <img
                    src={featured.poster}
                    alt={featured.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-black shadow-lg">
                    🔥 HOT
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-3.5">
                    <h3 className="text-base font-black text-white leading-tight line-clamp-2 mb-1">
                      {featured.title}
                    </h3>
                    <p className="text-[10px] text-slate-300 line-clamp-1 mb-2">
                      {featured.title_goc}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-300">
                      <span className="text-amber-400 font-bold">
                        ⏱ {featured.total_duration}
                      </span>
                    </div>
                    <button className="mt-2.5 w-full py-2 rounded-xl bg-white/15 backdrop-blur border border-white/20 text-white text-xs font-bold btn-tap hover:bg-white/25 transition-colors">
                      ▶ Xem ngay
                    </button>
                  </div>
                </div>
              </Link>

              {sideMovies.map((m) => (
                <Link
                  key={m.id}
                  href={`/movie/${m.id}`}
                  className="relative rounded-2xl overflow-hidden card-hover group card-bg"
                >
                  <div className="aspect-[2/3] relative">
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-2">
                      <h3 className="text-[11px] font-bold text-white leading-tight line-clamp-2">
                        {m.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* PHIM MỚI (mobile) */}
        {!showSaved && !search && newest.length > 0 && (
          <section className="mt-6 anim-fadeInUp d-3 md:hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-200">
                Mới cập nhật
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              {newest.slice(0, 5).map((m, i) => (
                <MovieCard key={m.id} movie={m} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* CHIP THỂ LOẠI (mobile) */}
        {!showSaved && !search && (
          <section className="mt-6 anim-fadeInUp d-4 md:hidden">
            <h2 className="text-sm font-bold text-slate-200 mb-3">
              Thể loại
            </h2>
            <div className="overflow-x-auto no-scrollbar pb-1 -mx-4">
              <div className="flex gap-2 w-max px-4">
                {filters.map((f) => {
                  const active = !showSaved && filter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => handleFilterClick(f)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap btn-tap transition-all duration-300 ${
                        active
                          ? 'bg-gradient-to-r from-rose-400 to-orange-500 text-white shadow-lg scale-105'
                          : 'bg-[#151d2e] text-slate-400 border border-[#1e293b] hover:text-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* GRID PHIM */}
        {filtered.length > 0 && (
          <section className="mt-6 anim-fadeInUp d-5 md:mt-0">
            <h2 className="text-sm font-bold text-slate-200 mb-3 hidden md:block">
              {search.trim()
                ? `🔍 Kết quả cho "${search}" (${filtered.length})`
                : showSaved
                ? `♡ Đã lưu (${savedMovies.length})`
                : filter === 'Tất cả'
                ? '🔥 Phim mới cập nhật'
                : `Thể loại: ${filter}`}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((m, i) => (
                <MovieCard key={m.id} movie={m} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* RỖNG */}
        {filtered.length === 0 && (
          <div className="text-center py-16 anim-fadeInUp">
            <div className="text-5xl mb-3 opacity-30">
              {search.trim() ? '🔍' : showSaved ? '♡' : '🎬'}
            </div>
            <p className="text-sm text-slate-500">
              {search.trim()
                ? `Không tìm thấy phim nào khớp "${search}"`
                : showSaved
                ? 'Bạn chưa lưu phim nào. Bấm ♡ trên poster để lưu.'
                : 'Chưa có phim nào. Vào /admin để thêm phim.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
