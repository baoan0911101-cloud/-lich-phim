'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function MovieCard({ movie, index = 0, variant = 'grid' }) {
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

  const sizeClass = variant === 'row' ? 'w-[130px] shrink-0' : 'w-full';

  return (
    <Link
      href={`/movie/${movie.id}`}
      className={`block card-hover anim-fadeInUp group ${sizeClass}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#151d2e]">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {movie.season && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-[10px] font-bold text-amber-300">
            {movie.season}
          </div>
        )}

        {/* ═══ NÚT TIM — KHÔNG VÒNG TRÒN ═══ */}
        <button
          onClick={toggleLike}
          aria-label="Lưu phim"
          className="absolute top-2 right-2 z-10 flex items-center justify-center btn-tap transition-transform duration-300 hover:scale-110 active:scale-95"
        >
          {liked ? (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="#fb7185"
              stroke="#fb7185"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] drop-shadow-[0_0_10px_rgba(251,113,133,0.9)]"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fb7185"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] drop-shadow-[0_0_6px_rgba(251,113,133,0.6)]"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>

        {movie.total_duration && (
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-black/70 backdrop-blur text-[10px] font-bold text-amber-300 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {movie.total_duration}
          </div>
        )}
      </div>

      <div className="mt-2">
        <h3 className="text-[13px] font-semibold line-clamp-2 leading-snug text-slate-100 group-hover:text-rose-300 transition-colors">
          {movie.title}
        </h3>
        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
          {movie.title_goc}
        </p>
      </div>
    </Link>
  );
}
