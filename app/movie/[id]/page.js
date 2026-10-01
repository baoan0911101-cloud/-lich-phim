'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatRelativeDate } from '@/lib/formatDate';

export default function MoviePage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetch(`/api/movies/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((data) => {
        setMovie(data.movie);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        router.push('/');
      });
  }, [id, router]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');
    setLiked(saved.includes(id));
  }, [id]);

  useEffect(() => {
    const handleChange = () => {
      const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');
      setLiked(saved.includes(id));
    };
    window.addEventListener('savedMoviesChanged', handleChange);
    return () => window.removeEventListener('savedMoviesChanged', handleChange);
  }, [id]);

  const toggleLike = () => {
    const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');
    let newSaved;

    if (saved.includes(id)) {
      newSaved = saved.filter((mid) => mid !== id);
      setLiked(false);
    } else {
      newSaved = [...saved, id];
      setLiked(true);
    }

    localStorage.setItem('savedMovies', JSON.stringify(newSaved));
    window.dispatchEvent(new Event('savedMoviesChanged'));
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">Đang tải...</div>
    );
  }

  if (!movie) return null;

  const customLinks = (movie.custom_links || []).filter(
    (l) => l.name && l.url
  );

  return (
    <div className="min-h-screen">
      <div className="relative aspect-[16/10] anim-fadeIn bg-[#151d2e]">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/40 to-transparent" />
        <Link
          href="/"
          className="absolute top-4 left-4 w-9 h-9 rounded-xl glass flex items-center justify-center text-white btn-tap hover:scale-110 transition-transform z-10"
        >
          ←
        </Link>
      </div>

      <div className="px-4 -mt-16 relative z-10">
        <div className="flex gap-4 anim-fadeInUp d-1">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-24 h-36 object-cover rounded-xl shadow-2xl border border-[#1e293b]"
          />
          <div className="flex-1 pt-2">
            <h1 className="text-xl font-black leading-tight text-white mb-1 line-clamp-2">
              {movie.title}
            </h1>
            <p className="text-xs text-slate-500 italic mb-2">
              {movie.title_goc}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {movie.season && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30">
                  <span className="text-rose-400 text-xs">🎬</span>
                  <span className="text-xs font-bold text-rose-300">
                    {movie.season}
                  </span>
                </div>
              )}
              {movie.total_duration && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <span className="text-amber-400 text-xs">⏱</span>
                  <span className="text-xs font-bold text-amber-300">
                    {movie.total_duration}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-4 anim-fadeInUp d-2">
          {movie.tags?.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 rounded-md bg-[#151d2e] border border-[#1e293b] text-slate-300 text-[10px] font-medium"
            >
              {t}
            </span>
          ))}
        </div>

        {movie.overview && (
          <div className="mt-5 anim-fadeInUp d-3">
            <h2 className="text-xs font-bold text-slate-400 tracking-widest mb-2">
              NỘI DUNG
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {movie.overview}
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* LƯU PHIM + LINKS — 1 HÀNG NGANG TỰ CO GIÃN */}
        {/* ═══════════════════════════════════════════ */}
        <div className="flex gap-1.5 mt-5 anim-fadeInUp d-4">
          {/* Nút Lưu phim */}
          <button
            onClick={toggleLike}
            className={`flex-1 min-w-0 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 btn-tap transition-all duration-300 ${
              liked
                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(251,113,133,0.3)]'
                : 'card-bg text-slate-200 border border-[#1e293b] hover:border-rose-400/50'
            }`}
          >
            <span className={liked ? 'animate-pulse' : ''}>
              {liked ? '♥' : '♡'}
            </span>
            <span className="truncate">{liked ? 'Đã lưu' : 'Lưu phim'}</span>
          </button>

          {/* Custom links */}
          {customLinks.map((link, i) => {
            const colorMap = {
              sky: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
              indigo: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
              blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
              emerald:
                'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
              rose: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
              amber: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
              red: 'bg-red-500/10 border-red-500/30 text-red-300',
              pink: 'bg-pink-500/10 border-pink-500/30 text-pink-300',
              purple: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
              slate: 'bg-slate-500/10 border-slate-500/30 text-slate-300',
            };
            const colorClass = colorMap[link.color] || colorMap.slate;

            return (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener"
                className={`flex-1 min-w-0 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 btn-tap hover:opacity-90 transition-opacity ${colorClass}`}
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

          {/* Fallback cho phim cũ chưa có custom_links */}
          {customLinks.length === 0 && movie.telegram_url && (
            <a
              href={movie.telegram_url}
              target="_blank"
              rel="noopener"
              className="flex-1 min-w-0 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center justify-center gap-1 btn-tap"
            >
              ✈ Telegram
            </a>
          )}
          {customLinks.length === 0 && movie.messenger_url && (
            <a
              href={movie.messenger_url}
              target="_blank"
              rel="noopener"
              className="flex-1 min-w-0 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center gap-1 btn-tap"
            >
              💬 Chat
            </a>
          )}
        </div>

        <div className="mt-6 pb-6">
          <h2 className="text-xs font-bold text-slate-400 tracking-widest mb-3">
            DANH SÁCH TẬP ({movie.seasons?.length || 0})
          </h2>

          <div className="space-y-3">
            {movie.seasons?.map((s, i) => {
              const isAvailable = !!s.facebook;

              return (
                <div
                  key={i}
                  className={`card-bg rounded-2xl p-3.5 anim-fadeInUp transition-all duration-300 ${
                    isAvailable ? 'hover:border-rose-400/50' : ''
                  }`}
                  style={{ animationDelay: `${0.25 + i * 0.06}s` }}
                >
                  {/* HEADER TẬP — BẤM ĐƯỢC NẾU CÓ LINK */}
                  {isAvailable ? (
                    <a
                      href={s.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 mb-3 group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400/30 to-orange-500/30 border border-rose-400/50 flex items-center justify-center text-sm shrink-0 group-hover:from-rose-400/50 group-hover:to-orange-500/50 transition-colors">
                        🎥
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors truncate">
                          {s.name}
                        </div>
                        <div className="text-[10px] mt-0.5">
                          <span className="text-emerald-400 font-bold">
                            ● Có thể xem
                          </span>
                        </div>
                      </div>
                      <div className="text-rose-400 text-lg group-hover:translate-x-1 transition-transform">
                        →
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 mb-3 opacity-60">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-400/10 to-slate-500/10 border border-slate-500/20 flex items-center justify-center text-sm shrink-0">
                        🎞
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-400 truncate">
                          {s.name}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          ⏱ {s.duration || 'Đang cập nhật'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NÚT PHỤ — Facebook + YouTube */}
                  <div className="flex gap-2">
                    {s.facebook ? (
                      <a
                        href={s.facebook}
                        target="_blank"
                        rel="noopener"
                        className="flex-1 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 btn-tap hover:bg-blue-500/20 transition-colors"
                      >
                        <span className="font-black">f</span> Facebook
                      </a>
                    ) : (
                      <div className="flex-1 py-2.5 rounded-xl bg-[#151d2e] border border-[#1e293b] text-slate-500 text-xs font-bold flex items-center justify-center">
                        Chưa có link
                      </div>
                    )}
                    {s.youtube && (
                      <a
                        href={s.youtube}
                        target="_blank"
                        rel="noopener"
                        className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 btn-tap hover:bg-red-500/20 transition-colors"
                      >
                        ▶ YouTube
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
