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
    <div className={`relative ${sizeClass} card-hover anim-fadeInUp group`} style={{ animationDelay: `${delay}s` }}>
      <Link href={`/movie/${movie.id}`} className="block">
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

          {movie.total_duration && (
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-black/70 backdrop-blur text-[10px] font-bold text-amber-300 flex items-center gap-1">
              ⏱ {movie.total_duration}
            </div>
          )}
        </div>
      </Link>

      {/* Nút tim — nằm NGOÀI Link */}
      <button
        onClick={toggleLike}
        aria-label="Lưu phim"
        className={`absolute top-2 right-2 z-30 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 btn-tap hover:scale-110 ${
          liked
            ? 'bg-rose-500 shadow-[0_0_12px_rgba(251,113,133,0.8)]'
            : 'bg-black/60 hover:bg-black/80 border border-white/20'
        }`}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill={liked ? '#ffffff' : 'none'}
          stroke={liked ? '#ffffff' : '#fb7185'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>

      <Link href={`/movie/${movie.id}`} className="block mt-2">
        <h3 className="text-[13px] font-semibold line-clamp-2 leading-snug text-slate-100 group-hover:text-rose-300 transition-colors">
          {movie.title}
        </h3>
        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
          {movie.title_goc}
        </p>
      </Link>
    </div>
  );
}
