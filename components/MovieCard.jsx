'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  formatRelativeDate,
  formatFullDate,
  getDateBadgeColor,
} from '@/lib/formatDate';

export default function MovieCard({ movie, index = 0 }) {
  const delay = Math.min(index * 0.05, 0.4);
  const [liked, setLiked] = useState(false);

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

  const dateColor = getDateBadgeColor(movie.updated_at || movie.created_at);

  return (
    <div
      className="block anim-fadeInUp group"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* ẢNH NGANG + BADGE BÊN TRONG */}
      <Link href={`/movie/${movie.id}`} className="block">
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#151d2e]">
          {/* ẢNH */}
          <img
            src={movie.poster}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Gradient nhẹ phía dưới để badge nổi */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

          {/* BADGE MÙA — góc trên trái */}
          {movie.season && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-[10px] font-bold text-amber-300 border border-amber-400/20 z-10">
              {movie.season}
            </div>
          )}

          {/* THỜI LƯỢNG — góc dưới trái */}
          {movie.total_duration && (
            <div className="absolute bottom-2.5 left-2.5 px-2 py-1 rounded-full bg-black/70 backdrop-blur text-[10px] font-bold text-amber-300 flex items-center gap-1 z-10">
              ⏱ {movie.total_duration}
            </div>
          )}

          {/* NÚT TIM — góc trên phải */}
          <button
            onClick={toggleLike}
            aria-label="Lưu phim"
            className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full flex items-center justify-center bg-black/50 backdrop-blur border border-white/20 hover:scale-110 transition-transform"
            style={{ padding: 0 }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill={liked ? '#fb7185' : 'none'}
              stroke={liked ? '#fb7185' : 'rgba(255, 255, 255, 0.9)'}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: 'all 0.3s',
                filter: liked
                  ? 'drop-shadow(0 0 5px rgba(251,113,133,0.9))'
                  : 'none',
              }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      </Link>

      {/* TEXT BÊN DƯỚI ẢNH */}
      <Link href={`/movie/${movie.id}`} className="block mt-2">
        {/* Tên phim */}
        <h3 className="text-[14px] font-black line-clamp-2 leading-snug text-white group-hover:text-rose-300 transition-colors duration-300">
          {movie.title}
        </h3>

        {/* Mùa + Cập nhật — cùng hàng */}
        <div className="flex items-center justify-between gap-2 mt-1.5">
          {movie.season ? (
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0">
              {movie.season}
            </span>
          ) : (
            <span className="shrink-0" />
          )}

          <span
            className="text-[11px] font-medium flex items-center gap-1 shrink-0"
            title={formatFullDate(movie.updated_at || movie.created_at)}
          >
            <span className="text-slate-500">Cập nhật:</span>
            <span
              className={`font-bold px-1.5 py-0.5 rounded border ${
                dateColor === 'emerald' || dateColor === 'amber'
                  ? 'text-amber-300 bg-amber-500/15 border-amber-500/40'
                  : 'text-slate-300 bg-slate-500/10 border-slate-500/30'
              }`}
            >
              {formatRelativeDate(movie.updated_at || movie.created_at).toUpperCase()}
            </span>
          </span>
        </div>
      </Link>
    </div>
  );
}
