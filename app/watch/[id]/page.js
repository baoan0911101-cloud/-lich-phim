'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function WatchPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const seasonName = searchParams.get('season');

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/movies/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setMovie(data.movie);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">Đang tải...</div>
    );
  }

  if (!movie) return null;

  const season =
    movie.seasons?.find((s) => s.name === seasonName) || movie.seasons?.[0];

  if (!season) return null;

  if (!season.facebook) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center anim-fadeInUp">
          <div className="text-6xl mb-4 opacity-50">⏳</div>
          <h1 className="text-xl font-black text-white mb-2">
            {season.name}
          </h1>
          <p className="text-sm text-slate-400 mb-1">Chưa có link xem</p>
          <p className="text-xs text-slate-500 mb-8">
            Vui lòng quay lại sau
          </p>
          <Link
            href={`/movie/${movie.id}`}
            className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-orange-500 text-white font-bold text-sm btn-tap"
          >
            ← Về trang phim
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center anim-fadeInUp">
        <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl">
          f
        </div>

        <h1 className="text-lg font-black text-white mb-2 line-clamp-2">
          {movie.title}
        </h1>
        <p className="text-sm text-slate-400 mb-1">{season.name}</p>
        <p className="text-xs text-slate-500 mb-8">
          Video sẽ mở trên Facebook
        </p>

        <a
          href={season.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm btn-tap shadow-[0_8px_24px_rgba(59,130,246,0.4)]"
        >
          <span className="text-lg font-black">f</span>
          Mở trên Facebook
        </a>

        <Link
          href={`/movie/${movie.id}`}
          className="inline-block mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Về trang phim
        </Link>
      </div>
    </div>
  );
}
