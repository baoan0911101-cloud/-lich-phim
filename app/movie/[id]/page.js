'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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

  const toggleLike = () => {
    const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');
    const newSaved = liked
      ? saved.filter((mid) => mid !== id)
      : [...saved, id];
    localStorage.setItem('savedMovies', JSON.stringify(newSaved));
    setLiked(!liked);
    window.dispatchEvent(new Event('savedMoviesChanged'));
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">Đang tải...</div>
    );
  }

  if (!movie) return null;

  return (
    <div className="min-h-screen">
      {/* BANNER ẢNH NGANG */}
      <div className="relative w-full bg-[#151d2e] anim-fadeIn">
        <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
          <img
            src={movie.poster}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.src = '';
              e.target.style.display = 'none';
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/30 to-transparent pointer-events-none" />
        </div>

        {/* Nút back */}
        <Link
          href="/"
          className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white text-lg btn-tap hover:scale-110 transition-transform z-20"
        >
          ←
        </Link>
      </div>

      {/* NỘI DUNG */}
      <div className="px-4 -mt-20 relative z-10">
        <div className="flex gap-4 anim-fadeInUp d-1">
          {/* POSTER NHỎ */}
          <div className="w-28 h-40 rounded-xl shadow-2xl border-2 border-[#1e293b] overflow-hidden bg-[#151d2e] shrink-0">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML =
                  '<div class="w-full h-full flex items-center justify-center text-slate-500 text-3xl">🎬</div>';
              }}
            />
          </div>

          <div className="flex-1 pt-16">
            <h1 className="text-xl font-black leading-tight text-white mb-1 line-clamp-2 drop-shadow-lg">
              {movie.title}
            </h1>
            <p className="text-xs text-slate-400 italic mb-2 drop-shadow">
              {movie.title_goc}
            </p>
            {movie.season && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-2">
                <span className="text-amber-400 text-xs">🎬</span>
                <span className="text-xs font-bold text-amber-300">
                  {movie.season}
                </span>
              </div>
            )}
            {movie.total_duration && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 ml-1">
                <span className="text-amber-400 text-xs">⏱</span>
                <span className="text-xs font-bold text-amber-300">
                  {movie.total_duration}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* TAGS */}
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

        {/* OVERVIEW */}
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

        {/* BUTTONS */}
        <div className="grid grid-cols-3 gap-2 mt-5 anim-fadeInUp d-4">
          <button
            onClick={toggleLike}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 btn-tap transition-colors ${
              liked
                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                : 'card-bg text-slate-200 hover:border-rose-400/50'
            }`}
          >
            {liked ? '♥ Đã lưu' : '♡ Lưu'}
          </button>

          {movie.telegram_url && (
            <a
              href={movie.telegram_url}
              target="_blank"
              rel="noopener"
              className="py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 btn-tap"
            >
              ✈ Telegram
            </a>
          )}
          {movie.messenger_url && (
            <a
              href={movie.messenger_url}
              target="_blank"
              rel="noopener"
              className="py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 btn-tap"
            >
              💬 Chat
            </a>
          )}
        </div>

        {/* DANH SÁCH TẬP */}
        <div className="mt-6 pb-6">
          <h2 className="text-xs font-bold text-slate-400 tracking-widest mb-3">
            DANH SÁCH TẬP ({movie.seasons?.length || 0})
          </h2>

          <div className="space-y-3">
            {movie.seasons?.map((s, i) => (
              <div
                key={i}
                className="card-bg rounded-2xl p-3.5 anim-fadeInUp"
                style={{ animationDelay: `${0.25 + i * 0.06}s` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400/20 to-orange-500/20 border border-rose-400/30 flex items-center justify-center text-sm">
                    🎞
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">
                      {s.name}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      ⏱ {s.duration || 'Đang cập nhật'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {s.facebook ? (
                    <a
                      href={s.facebook}
                      target="_blank"
                      rel="noopener"
                      className="flex-1 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 btn-tap"
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
                      className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 btn-tap"
                    >
                      ▶ YouTube
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
