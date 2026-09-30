'use client';
import { useState, useEffect, useRef } from 'react';
import { formatRelativeDate, formatFullDate, getDateBadgeColor } from '@/lib/formatDate';

export default function MovieCard({ movie, index = 0, onClick }) {
  const delay = Math.min(index * 0.05, 0.4);
  const [liked, setLiked] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const cardRef = useRef(null);

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

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--rx', `${y * 6}deg`);
    card.style.setProperty('--ry', `${-x * 6}deg`);
  };

  const handleMouseLeave = () => {
    setIsHover(false);
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  };

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

  const handleCardClick = (e) => {
    e.preventDefault();
    if (onClick) onClick(movie);
  };

  const dateColor = getDateBadgeColor(movie.updated_at || movie.created_at);

  return (
    <div
      className="block anim-fadeInUp group cursor-pointer"
      style={{ animationDelay: `${delay}s` }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleCardClick}
    >
      {/* ẢNH */}
      <div
        ref={cardRef}
        className="relative aspect-[2/3] md:aspect-[16/9] rounded-xl overflow-hidden bg-[#151d2e] transition-all duration-500"
        style={{
          transform: isHover
            ? 'perspective(800px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(-3px) scale(1.02)'
            : 'perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)',
          transformStyle: 'preserve-3d',
          boxShadow: isHover
            ? '0 15px 30px rgba(0,0,0,0.6), 0 0 15px rgba(251,113,133,0.3)'
            : '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        {movie.season && (
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur text-[9px] font-bold text-amber-300 z-10 whitespace-nowrap">
            {movie.season}
          </div>
        )}

        {movie.total_duration && (
          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full bg-black/70 backdrop-blur text-[9px] font-bold text-amber-300 flex items-center gap-0.5 z-10 whitespace-nowrap">
            ⏱ {movie.total_duration}
          </div>
        )}

        <button
          onClick={toggleLike}
          aria-label="Lưu phim"
          className="absolute top-1 right-1 z-20 w-6 h-6 rounded-full flex items-center justify-center bg-black/50 backdrop-blur border border-white/20 hover:scale-110 transition-transform"
          style={{ padding: 0 }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill={liked ? '#fb7185' : 'none'}
            stroke={liked ? '#fb7185' : 'rgba(255, 255, 255, 0.9)'}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: 'all 0.3s',
              filter: liked ? 'drop-shadow(0 0 4px rgba(251,113,133,0.9))' : 'none',
            }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      {/* TEXT */}
      <div className="block mt-1.5">
        <h3 className="text-[11px] font-semibold line-clamp-2 leading-tight text-slate-100 group-hover:text-rose-300 transition-colors duration-300">
          {movie.title}
        </h3>

        <p className="text-[9px] text-slate-500 line-clamp-1 mt-0.5 mb-1">
          {movie.title_goc}
        </p>

        <div className="flex items-center justify-between gap-1 flex-wrap">
          {movie.season ? (
            <span className="text-[9px] font-bold text-rose-300 bg-rose-500/10 px-1.5 py-0.5 rounded whitespace-nowrap">
              {movie.season}
            </span>
          ) : (
            <span />
          )}

          <span
            className="text-[9px] font-medium flex items-center gap-1 whitespace-nowrap"
            title={formatFullDate(movie.updated_at || movie.created_at)}
          >
            <span className="text-slate-500">Cập nhật:</span>
            <span
              className={`font-bold px-1 py-0.5 rounded ${
                dateColor === 'emerald' || dateColor === 'amber'
                  ? 'text-amber-300 bg-amber-500/15 border border-amber-500/40'
                  : 'text-slate-300 bg-slate-500/10 border border-slate-500/30'
              }`}
            >
              {formatRelativeDate(movie.updated_at || movie.created_at).toUpperCase()}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
