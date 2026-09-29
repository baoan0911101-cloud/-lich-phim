'use client';sdasdasda
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

        <button
          onClick={toggleLike}
          aria-label="Lưu phim"
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur flex items-center justify-center btn-tap"
        >
          <span
            className={`text-sm transition-transform ${
              liked ? 'text-rose-400 scale-110' : 'text-white/70'
            }`}
          >
            {liked ? '♥' : '♡'}
          </span>
        </button>

        {movie.total_duration && (
          <div className="absolute bottom-2 left-2 text-[10px] font-semibold text-white/90">
            ⏱ {movie.total_duration}
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
