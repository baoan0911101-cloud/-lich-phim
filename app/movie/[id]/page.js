'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function MoviePage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">Đang tải...</div>
    );
  }

  if (!movie) return null;

  return (
    <div className="min-h-screen">
      <div className="relative aspect-[16/10] anim-fadeIn">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/40 to-transparent" />
        <Link
          href="/"
          className="absolute top-4 left-4 w-9 h-9 rounded-xl glass flex items-center justify-center text-white btn-tap hover:scale-110 transition-transform"
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

        <div className="grid grid-cols-3 gap-2 mt-5 anim-fadeInUp d-4">
          <button className="py-2.5 rounded-xl card-bg text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 btn-tap hover:border-rose-400/50 transition-colors">
            ♡ Lưu
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
