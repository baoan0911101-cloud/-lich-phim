'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { formatRelativeDate, formatFullDate, getDateBadgeColor } from '@/lib/formatDate';

export default function MovieCard({ movie, index = 0, onClick }) {
  const delay = Math.min(index * 0.05, 0.4);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(movie.likes || 0);
  const [isHover, setIsHover] = useState(false);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  
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

  useEffect(() => {
    setLikeCount(movie.likes || 0);
  }, [movie.likes]);

  const toggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isUnliking = liked;
    const newLikedState = !liked;
    const newCount = isUnliking ? Math.max(likeCount - 1, 0) : likeCount + 1;

    setLiked(newLikedState);
    setLikeCount(newCount);

    const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');
    let newSaved;
    
    if (isUnliking) {
      newSaved = saved.filter((id) => id !== movie.id);
    } else {
      newSaved = [...saved, movie.id];
    }
    localStorage.setItem('savedMovies', JSON.stringify(newSaved));
    window.dispatchEvent(new Event('savedMoviesChanged'));

    try {
      await fetch('/api/movies/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: movie.id, 
          action: isUnliking ? 'unlike' : 'like'
        }),
      });
    } catch (err) {
      console.error('Lỗi khi cập nhật lượt tim:', err);
    }
  };

  const handleCardClick = (e) => {
    e.preventDefault();
    if (onClick) onClick(movie);
  };

  const dateColor = getDateBadgeColor(movie.updated_at || movie.created_at);
  const displayLikeCount = likeCount > 999 ? (likeCount / 1000).toFixed(1) + 'k' : likeCount;

  return (
    <div
      className="block anim-fadeInUp group cursor-pointer"
      style={{ animationDelay: `${delay}s` }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={handleCardClick}
    >
      {/* KHUNG ẢNH (Giữ nguyên kích thước, chỉ đổi viền/sáng nhẹ) */}
      <div
        ref={cardRef}
        className="relative aspect-[2/3] md:aspect-[16/9] rounded-xl overflow-hidden bg-[#151d2e] transition-all duration-300 ease-out border border-white/5"
        style={{
          boxShadow: isHover ? '0 0 0 2px rgba(251,113,133,0.5), 0 10px 30px rgba(0,0,0,0.6)' : '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {!isImgLoaded && (
          <div className="absolute inset-0 bg-[#1e293b] animate-pulse z-0" />
        )}

        {/* 🎯 CHỈ PHÓNG TO ẢNH BÊN TRONG */}
        <Image
          src={movie.poster || 'https://placehold.co/300x450/151d2e/475569?text=No+Image'} 
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 33vw, 300px"
          onLoad={() => setIsImgLoaded(true)}
          className={`object-cover transition-transform duration-500 ease-out z-10 ${
            isHover ? 'scale-110' : 'scale-100'
          } ${isImgLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'}`}
        />

        {/* Lớp phủ đen (Tối lên khi hover để nổi bật nút Play) */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 z-10 pointer-events-none ${isHover ? 'opacity-100' : 'opacity-0'}`} />

        {/* 🎯 NÚT PLAY Ở GIỮA (Hiện khi hover) */}
        <div className={`absolute inset-0 flex items-center justify-center z-20 pointer-events-none transition-all duration-300 ${isHover ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <div className="w-12 h-12 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-[0_0_20px_rgba(251,113,133,0.6)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />

        {movie.season && (
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur text-[9px] font-bold text-amber-300 z-20 whitespace-nowrap">
            {movie.season}
          </div>
        )}

        {movie.total_duration && (
          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full bg-black/70 backdrop-blur text-[9px] font-bold text-amber-300 flex items-center gap-0.5 z-20 whitespace-nowrap">
            ⏱ {movie.total_duration}
          </div>
        )}

        {/* NÚT THẢ TIM */}
        <button
          onClick={toggleLike}
          aria-label="Lưu phim"
          className="absolute top-1 right-1 z-30 h-6 px-1.5 rounded-full flex items-center gap-1 bg-black/60 backdrop-blur border border-white/20 hover:scale-110 transition-transform"
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
          <span className="text-[9px] font-bold text-white pr-0.5">
            {displayLikeCount}
          </span>
        </button>
      </div>

      {/* TEXT */}
      <div className="block mt-1.5 relative z-10">
        <h3 className={`text-[11px] font-semibold line-clamp-2 leading-tight transition-colors duration-300 ${isHover ? 'text-rose-300' : 'text-slate-100'}`}>
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
