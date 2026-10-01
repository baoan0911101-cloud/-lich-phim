'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatRelativeDate } from '@/lib/formatDate';

export default function MovieModal({ movie, onClose }) {
  const [liked, setLiked] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');
    setLiked(saved.includes(movie.id));
  }, [movie.id]);

  useEffect(() => {
    const handleChange = () => {
      const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');
      setLiked(saved.includes(movie.id));
    };
    window.addEventListener('savedMoviesChanged', handleChange);
    return () => window.removeEventListener('savedMoviesChanged', handleChange);
  }, [movie.id]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const toggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');
    let newSaved;

    if (saved.includes(movie.id)) {
      newSaved = saved.filter((id) => id !== movie.id);
      setLiked(false);
    } else {
      newSaved = [...saved, movie.id];
      setLiked(true);
    }

    localStorage.setItem('savedMovies', JSON.stringify(newSaved));
    window.dispatchEvent(new Event('savedMoviesChanged'));
  };

  const overviewText = movie.overview || '';
  const isLongOverview = overviewText.length > 200;
  const displayOverview =
    showFullOverview || !isLongOverview
      ? overviewText
      : overviewText.slice(0, 200) + '...';

  // Custom links
  const customLinks = (movie.custom_links || []).filter(
    (l) => l.name && l.url
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-[modalFadeIn_0.3s_ease_both]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] animate-[modalScaleIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* NÚT ĐÓNG */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Đóng"
          className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-base font-bold hover:bg-rose-500/90 hover:scale-110 hover:rotate-90 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
        >
          ✕
        </button>

        {/* KHUNG MODAL */}
        <div className="w-full max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl bg-[#0f1729] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.9)]">
          {/* ẢNH BANNER */}
          <div className="relative aspect-[16/9] overflow-hidden bg-[#151d2e] rounded-t-3xl">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1729] via-[#0f1729]/40 to-transparent" />

            {movie.season && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur text-[11px] font-bold text-amber-300 border border-amber-400/30">
                {movie.season}
              </div>
            )}
          </div>

          {/* NỘI DUNG */}
          <div className="px-4 pb-4 -mt-12 relative z-10">
            {movie.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {movie.tags.map((t, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-500/15 border border-amber-500/40 text-amber-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <h2 className="text-xl font-black text-white leading-tight mb-1">
              {movie.title}
            </h2>

            <p className="text-xs text-slate-400 italic mb-2">
              {movie.title_goc}
            </p>

            {movie.total_duration && (
              <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-3">
                <span className="text-amber-400">⏱</span>
                <span>
                  Thời lượng:{' '}
                  <span className="font-bold text-amber-300">
                    {movie.total_duration}
                  </span>
                </span>
              </div>
            )}

            {overviewText && (
              <div className="mb-3">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {displayOverview}
                </p>
                {isLongOverview && (
                  <button
                    onClick={() => setShowFullOverview(!showFullOverview)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 mt-1 transition-colors"
                  >
                    {showFullOverview ? 'Thu gọn ↑' : 'Xem chi tiết ↓'}
                  </button>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* NÚT LƯU + LINK — 1 HÀNG NGANG TỰ CO GIÃN */}
            {/* ═══════════════════════════════════════════ */}
            <div className="flex gap-1.5 mt-4 flex-wrap sm:flex-nowrap">
              {/* Nút Lưu phim */}
              <button
                onClick={toggleLike}
                className={`flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 btn-tap transition-all duration-300 ${
                  liked
                    ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                    : 'card-bg text-slate-200 border border-[#1e293b] hover:border-rose-400/50'
                }`}
              >
                <span className={liked ? 'animate-pulse' : ''}>
                  {liked ? '♥' : '♡'}
                </span>
                <span className="truncate">
                  {liked ? 'Đã lưu' : 'Lưu phim'}
                </span>
              </button>

              {/* Custom links */}
              {customLinks.map((link, i) => {
                const colorMap = {
                  sky: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
                  indigo:
                    'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
                  blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
                  emerald:
                    'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
                  rose: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
                  amber: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
                  red: 'bg-red-500/10 border-red-500/30 text-red-300',
                  pink: 'bg-pink-500/10 border-pink-500/30 text-pink-300',
                  purple:
                    'bg-purple-500/10 border-purple-500/30 text-purple-300',
                  slate: 'bg-slate-500/10 border-slate-500/30 text-slate-300',
                };
                const colorClass = colorMap[link.color] || colorMap.slate;

                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener"
                    className={`flex-1 min-w-[70px] py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 btn-tap hover:opacity-90 transition-opacity ${colorClass}`}
                  >
                    {link.icon ? (
                      <img
                        src={link.icon}
                        alt=""
                        className="w-4 h-4 object-contain shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <span>🔗</span>
                    )}
                    <span className="truncate">{link.name}</span>
                  </a>
                );
              })}
            </div>

            {/* NÚT XEM CHI TIẾT */}
            <Link
              href={`/movie/${movie.id}`}
              className="block w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-black text-center btn-tap shadow-[0_8px_24px_rgba(251,113,133,0.4)] hover:shadow-[0_12px_32px_rgba(251,113,133,0.6)] transition-all"
            >
              ▶ Xem chi tiết phim
            </Link>

            {/* DANH SÁCH TẬP */}
            {movie.seasons?.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-bold text-slate-400 tracking-widest mb-3">
                  DANH SÁCH TẬP ({movie.seasons.length})
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {movie.seasons.slice(0, 6).map((s, i) => {
                    const isAvailable = !!s.facebook;
                    const Wrapper = isAvailable ? 'a' : 'div';
                    const wrapperProps = isAvailable
                      ? {
                          href: s.facebook,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                        }
                      : {};

                    return (
                      <Wrapper
                        key={i}
                        {...wrapperProps}
                        className={`card-bg rounded-xl p-2.5 flex items-center gap-2 transition-all duration-300 ${
                          isAvailable
                            ? 'cursor-pointer hover:border-rose-400/50 hover:bg-[#1a2540] hover:-translate-y-0.5 active:scale-[0.97] group'
                            : 'opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 transition-colors ${
                            isAvailable
                              ? 'bg-gradient-to-br from-rose-400/30 to-orange-500/30 border border-rose-400/50 group-hover:from-rose-400/50 group-hover:to-orange-500/50'
                              : 'bg-gradient-to-br from-slate-400/10 to-slate-500/10 border border-slate-500/20'
                          }`}
                        >
                          {isAvailable ? '▶' : '🎞'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-[11px] font-bold truncate ${
                              isAvailable
                                ? 'text-white group-hover:text-rose-300 transition-colors'
                                : 'text-slate-400'
                            }`}
                          >
                            {s.name}
                          </div>
                          <div className="text-[9px] text-slate-500 truncate">
                            {isAvailable ? (
                              <span className="text-emerald-400 font-bold">
                                ● Có thể xem
                              </span>
                            ) : (
                              '⏱ Đang cập nhật'
                            )}
                          </div>
                        </div>
                      </Wrapper>
                    );
                  })}
                </div>

                {movie.seasons.length > 6 && (
                  <Link
                    href={`/movie/${movie.id}`}
                    className="block text-center text-xs text-amber-400 hover:text-amber-300 mt-3 font-bold transition-colors"
                  >
                    + Xem tất cả {movie.seasons.length} tập →
                  </Link>
                )}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <span className="text-[10px] text-slate-500">
                Cập nhật:{' '}
                <span className="text-amber-400 font-bold">
                  {formatRelativeDate(movie.updated_at || movie.created_at)}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
