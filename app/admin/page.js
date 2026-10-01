'use client';
import { useState, useEffect } from 'react';

// 🎨 BẢNG MÀU
const LINK_COLORS = [
  { id: 'sky', name: 'Xanh dương', bg: 'bg-sky-500/15', border: 'border-sky-500/40', text: 'text-sky-300' },
  { id: 'indigo', name: 'Tím', bg: 'bg-indigo-500/15', border: 'border-indigo-500/40', text: 'text-indigo-300' },
  { id: 'blue', name: 'Xanh đậm', bg: 'bg-blue-500/15', border: 'border-blue-500/40', text: 'text-blue-300' },
  { id: 'emerald', name: 'Xanh lá', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-300' },
  { id: 'rose', name: 'Hồng', bg: 'bg-rose-500/15', border: 'border-rose-500/40', text: 'text-rose-300' },
  { id: 'amber', name: 'Vàng', bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-300' },
  { id: 'red', name: 'Đỏ', bg: 'bg-red-500/15', border: 'border-red-500/40', text: 'text-red-300' },
  { id: 'pink', name: 'Hồng đậm', bg: 'bg-pink-500/15', border: 'border-pink-500/40', text: 'text-pink-300' },
  { id: 'purple', name: 'Tím đậm', bg: 'bg-purple-500/15', border: 'border-purple-500/40', text: 'text-purple-300' },
  { id: 'slate', name: 'Xám', bg: 'bg-slate-500/15', border: 'border-slate-500/40', text: 'text-slate-300' },
];

// 🎨 BẢNG ICON CÓ SẴN
const ICON_PRESETS = [
  { name: 'Telegram', path: '/icons/telegram.png', color: 'sky' },
  { name: 'Facebook', path: '/icons/facebook.png', color: 'blue' },
  { name: 'TikTok', path: '/icons/tiktok.png', color: 'slate' },
  { name: 'Instagram', path: '/icons/instagram.png', color: 'pink' },
  { name: 'Twitter', path: '/icons/twitter.png', color: 'sky' },
  { name: 'WhatsApp', path: '/icons/whatsapp.png', color: 'emerald' },
  { name: 'Reddit', path: '/icons/reddit.png', color: 'red' },
  { name: 'Snapchat', path: '/icons/snapchat.png', color: 'amber' },
];

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [loginMsg, setLoginMsg] = useState('');
  const [tab, setTab] = useState('add');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [movie, setMovie] = useState({
    title: '',
    title_goc: '',
    poster: '',
    season: '',
    duration: '',
    tags: '',
    overview: '',
  });
  const [seasons, setSeasons] = useState([
    { name: 'Phần 1', facebook: '', youtube: '' },
  ]);
  const [customLinks, setCustomLinks] = useState([
    {
      name: 'Vào nhóm Telegram',
      url: '',
      color: 'sky',
      icon: '/icons/telegram.png',
    },
  ]);

  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editingOriginalTitle, setEditingOriginalTitle] = useState('');

  const loadMovies = async () => {
    setLoadingMovies(true);
    try {
      const res = await fetch('/api/movies');
      const data = await res.json();
      setMovies(data.movies || []);
    } catch {
      setMovies([]);
    }
    setLoadingMovies(false);
  };

  useEffect(() => {
    if (unlocked && (tab === 'manage' || tab === 'edit')) {
      loadMovies();
    }
  }, [unlocked, tab]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setChecking(true);
    setLoginMsg('');

    try {
      const res = await fetch('/api/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setUnlocked(true);
      } else {
        setLoginMsg('❌ Sai mật khẩu');
      }
    } catch {
      setLoginMsg('❌ Không kết nối được server');
    }

    setChecking(false);
  };

  const resetForm = () => {
    setMovie({
      title: '',
      title_goc: '',
      poster: '',
      season: '',
      duration: '',
      tags: '',
      overview: '',
    });
    setSeasons([{ name: 'Phần 1', facebook: '', youtube: '' }]);
    setCustomLinks([
      {
        name: 'Vào nhóm Telegram',
        url: '',
        color: 'sky',
        icon: '/icons/telegram.png',
      },
    ]);
    setEditingId(null);
    setEditingOriginalTitle('');
    setMsg('');
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditingOriginalTitle(m.title);
    setMovie({
      title: m.title || '',
      title_goc: m.title_goc || '',
      poster: m.poster || '',
      season: m.season || '',
      duration: m.total_duration || '',
      tags: (m.tags || []).join(', '),
      overview: m.overview || '',
    });
    setSeasons(
      m.seasons?.length
        ? m.seasons.map((s) => ({
            name: s.name || '',
            facebook: s.facebook || '',
            youtube: s.youtube || '',
          }))
        : [{ name: 'Phần 1', facebook: '', youtube: '' }]
    );

    if (m.custom_links?.length) {
      setCustomLinks(
        m.custom_links.map((l) => ({
          ...l,
          icon: l.icon || '',
        }))
      );
    } else {
      const oldLinks = [];
      if (m.telegram_url)
        oldLinks.push({
          name: 'Vào nhóm Telegram',
          url: m.telegram_url,
          color: 'sky',
          icon: '/icons/telegram.png',
        });
      if (m.messenger_url)
        oldLinks.push({
          name: 'Chat Messenger',
          url: m.messenger_url,
          color: 'indigo',
          icon: '',
        });
      setCustomLinks(
        oldLinks.length
          ? oldLinks
          : [
              {
                name: 'Vào nhóm Telegram',
                url: '',
                color: 'sky',
                icon: '/icons/telegram.png',
              },
            ]
      );
    }

    setMsg('');
    setTab('edit');
  };

  const askDelete = (id, title) => {
    setConfirmDelete({ id, title });
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    const { id, title } = confirmDelete;
    setDeletingId(id);
    setConfirmDelete(null);

    try {
      const res = await fetch('/api/movies/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, id }),
      });
      const data = await res.json();

      if (data.success) {
        setMovies((prev) => prev.filter((m) => m.id !== id));
        setToast(`✅ Đã xoá "${title}"`);
        setTimeout(() => setToast(''), 2500);
        setTimeout(() => loadMovies(), 800);
      } else {
        setToast(`❌ Lỗi: ${data.error || 'Không rõ'}`);
        setTimeout(() => setToast(''), 3000);
      }
    } catch (err) {
      setToast(`❌ Lỗi: ${err.message}`);
      setTimeout(() => setToast(''), 3000);
    }

    setDeletingId(null);
  };

  const addSeason = () => {
    setSeasons([
      ...seasons,
      { name: `Phần ${seasons.length + 1}`, facebook: '', youtube: '' },
    ]);
  };

  const removeSeason = (i) => {
    setSeasons(seasons.filter((_, idx) => idx !== i));
  };

  const updateSeason = (i, key, value) => {
    const newSeasons = [...seasons];
    newSeasons[i][key] = value;
    setSeasons(newSeasons);
  };

  const addCustomLink = () => {
    setCustomLinks([
      ...customLinks,
      { name: '', url: '', color: 'slate', icon: '' },
    ]);
  };

  const removeCustomLink = (i) => {
    setCustomLinks(customLinks.filter((_, idx) => idx !== i));
  };

  const updateCustomLink = (i, key, value) => {
    const newLinks = [...customLinks];
    newLinks[i][key] = value;
    setCustomLinks(newLinks);
  };

  const slugify = (str) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const validLinks = customLinks.filter(
      (l) => l.name.trim() && l.url.trim()
    );

    const movieData = {
      title: movie.title,
      title_goc: movie.title_goc,
      poster: movie.poster,
      season: movie.season,
      tags: movie.tags.split(',').map((t) => t.trim()).filter(Boolean),
      total_duration: movie.duration,
      overview: movie.overview,
      custom_links: validLinks,
      seasons,
    };

    try {
      let res, data;

      if (editingId) {
        res = await fetch('/api/movies/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password, id: editingId, movie: movieData }),
        });
        data = await res.json();

        if (data.success) {
          setMsg('✅ Đã cập nhật!');
          setTimeout(() => {
            resetForm();
            setTab('edit');
            loadMovies();
          }, 1200);
        } else {
          setMsg('❌ Lỗi: ' + (data.error || 'Không rõ'));
        }
      } else {
        const newId = slugify(movie.title);
        res = await fetch('/api/movies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password,
            movie: { id: newId, ...movieData },
          }),
        });
        data = await res.json();

        if (data.success) {
          setMsg('✅ Đã thêm!');
          setMovie({
            title: '',
            title_goc: '',
            poster: '',
            season: '',
            duration: '',
            tags: '',
            overview: '',
          });
          setSeasons([{ name: 'Phần 1', facebook: '', youtube: '' }]);
          setCustomLinks([
            {
              name: 'Vào nhóm Telegram',
              url: '',
              color: 'sky',
              icon: '/icons/telegram.png',
            },
          ]);
        } else {
          setMsg('❌ Lỗi: ' + (data.error || 'Không rõ'));
        }
      }
    } catch (err) {
      setMsg('❌ Lỗi: ' + err.message);
    }

    setLoading(false);
  };

  const input =
    'w-full h-11 rounded-xl card-bg px-4 text-sm focus:outline-none focus:border-rose-400/50';
  const label = 'text-xs font-bold text-slate-400 mb-1.5 block';

  if (!unlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="card-bg rounded-2xl p-6 max-w-sm w-full anim-fadeInUp">
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="text-xl font-black grad-text mb-1">
              Trang quản trị
            </h1>
            <p className="text-xs text-slate-500">Nhập mật khẩu để tiếp tục</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-3">
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu admin"
              className={input}
            />

            <button
              type="submit"
              disabled={checking}
              className={`w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold btn-tap ${
                checking ? 'opacity-50' : ''
              }`}
            >
              {checking ? '⏳ Đang kiểm tra...' : '🔓 Mở khóa'}
            </button>

            {loginMsg && (
              <div className="text-sm text-center py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                {loginMsg}
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black grad-text">Quản trị</h1>
        <button
          onClick={() => {
            setUnlocked(false);
            setPassword('');
            resetForm();
            setTab('add');
          }}
          className="text-xs text-slate-500 hover:text-rose-300 btn-tap"
        >
          🔒 Đăng xuất
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setTab('add');
            resetForm();
          }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold btn-tap transition-all ${
            tab === 'add'
              ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg'
              : 'card-bg text-slate-400'
          }`}
        >
          ✚ Thêm
        </button>
        <button
          onClick={() => setTab('edit')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold btn-tap transition-all ${
            tab === 'edit'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg'
              : 'card-bg text-slate-400'
          }`}
        >
          ✏️ Sửa
        </button>
        <button
          onClick={() => setTab('manage')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold btn-tap transition-all ${
            tab === 'manage'
              ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg'
              : 'card-bg text-slate-400'
          }`}
        >
          🗑 Xoá
        </button>
      </div>

      {(tab === 'add' || tab === 'edit') && (
        <div>
          {tab === 'edit' && !editingId && (
            <div>
              <p className="text-xs text-slate-500 mb-3">
                Chọn phim cần sửa:
              </p>

              {loadingMovies && movies.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Đang tải danh sách...
                </div>
              )}

              {!loadingMovies && movies.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3 opacity-30">🎬</div>
                  <p className="text-sm text-slate-500">
                    Chưa có phim nào trong database
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {movies.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => startEdit(m)}
                    className="w-full card-bg rounded-xl p-3 flex items-center gap-3 hover:border-sky-400/50 transition-colors btn-tap text-left"
                  >
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="w-12 h-16 object-cover rounded-lg shrink-0 bg-[#1e293b]"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white line-clamp-1">
                        {m.title}
                      </h3>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {m.title_goc || '—'}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {m.seasons?.length || 0} tập
                      </p>
                    </div>
                    <div className="text-sky-400 text-lg">✏️</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'edit' && editingId && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30">
                <div className="text-xs text-sky-300">
                  ✏️ Đang sửa:{' '}
                  <span className="font-bold">{editingOriginalTitle}</span>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-rose-300 btn-tap"
                >
                  ✕ Huỷ
                </button>
              </div>

              <MovieForm
                movie={movie}
                setMovie={setMovie}
                seasons={seasons}
                addSeason={addSeason}
                removeSeason={removeSeason}
                updateSeason={updateSeason}
                customLinks={customLinks}
                addCustomLink={addCustomLink}
                removeCustomLink={removeCustomLink}
                updateCustomLink={updateCustomLink}
                input={input}
                label={label}
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold btn-tap ${
                  loading ? 'opacity-50' : ''
                }`}
              >
                {loading ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
              </button>

              {msg && (
                <div className="text-sm text-center py-2 rounded-xl card-bg">
                  {msg}
                </div>
              )}
            </form>
          )}

          {tab === 'add' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <MovieForm
                movie={movie}
                setMovie={setMovie}
                seasons={seasons}
                addSeason={addSeason}
                removeSeason={removeSeason}
                updateSeason={updateSeason}
                customLinks={customLinks}
                addCustomLink={addCustomLink}
                removeCustomLink={removeCustomLink}
                updateCustomLink={updateCustomLink}
                input={input}
                label={label}
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold btn-tap ${
                  loading ? 'opacity-50' : ''
                }`}
              >
                {loading ? '⏳ Đang xử lý...' : '✚ Tạo phim'}
              </button>

              {msg && (
                <div className="text-sm text-center py-2 rounded-xl card-bg">
                  {msg}
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {tab === 'manage' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-slate-500">
              Tổng:{' '}
              <span className="text-amber-400 font-bold">{movies.length}</span>{' '}
              phim
            </p>
            <button
              onClick={loadMovies}
              disabled={loadingMovies}
              className="text-xs px-3 py-1.5 rounded-lg card-bg text-slate-300 btn-tap hover:border-rose-400/50 transition-colors"
            >
              {loadingMovies ? '⏳ Đang tải...' : '🔄 Làm mới'}
            </button>
          </div>

          {loadingMovies && movies.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              Đang tải danh sách...
            </div>
          )}

          {!loadingMovies && movies.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3 opacity-30">🎬</div>
              <p className="text-sm text-slate-500">
                Chưa có phim nào trong database
              </p>
            </div>
          )}

          <div className="space-y-2">
            {movies.map((m) => (
              <div
                key={m.id}
                className="card-bg rounded-xl p-3 flex items-center gap-3"
              >
                <img
                  src={m.poster}
                  alt={m.title}
                  className="w-12 h-16 object-cover rounded-lg shrink-0 bg-[#1e293b]"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white line-clamp-1">
                    {m.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    {m.title_goc || '—'}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    ID: {m.id}
                  </p>
                </div>
                <button
                  onClick={() => askDelete(m.id, m.title)}
                  disabled={deletingId === m.id}
                  className="shrink-0 w-9 h-9 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 btn-tap flex items-center justify-center disabled:opacity-50"
                  title="Xoá phim"
                >
                  {deletingId === m.id ? '⏳' : '🗑'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 anim-fadeIn">
          <div className="card-bg rounded-2xl p-5 max-w-sm w-full anim-fadeInUp">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-lg font-bold text-white mb-1">Xoá phim?</h3>
              <p className="text-sm text-slate-400">
                Bạn sắp xoá{' '}
                <span className="text-rose-300 font-bold">
                  "{confirmDelete.title}"
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Hành động này không thể hoàn tác
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl card-bg text-slate-300 font-bold text-sm btn-tap"
              >
                Huỷ
              </button>
              <button
                onClick={doDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-sm btn-tap"
              >
                🗑 Xoá
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 card-bg rounded-xl px-4 py-3 shadow-2xl anim-fadeInUp max-w-sm">
          <p className="text-sm text-white text-center">{toast}</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// FORM COMPONENT
// ═══════════════════════════════════════════
function MovieForm({
  movie,
  setMovie,
  seasons,
  addSeason,
  removeSeason,
  updateSeason,
  customLinks,
  addCustomLink,
  removeCustomLink,
  updateCustomLink,
  input,
  label,
}) {
  return (
    <>
      <div>
        <label className={label}>Tên phim *</label>
        <input
          required
          value={movie.title}
          onChange={(e) => setMovie({ ...movie, title: e.target.value })}
          className={input}
          placeholder="VD: Quỷ Tiên Ô Đỏ"
        />
      </div>

      <div>
        <label className={label}>Tên gốc</label>
        <input
          value={movie.title_goc}
          onChange={(e) => setMovie({ ...movie, title_goc: e.target.value })}
          className={input}
          placeholder="Ta Chính Là Quỷ Tiên Đế"
        />
      </div>

      <div>
        <label className={label}>Link ảnh poster *</label>
        <input
          required
          value={movie.poster}
          onChange={(e) => setMovie({ ...movie, poster: e.target.value })}
          className={input}
          placeholder="https://... hoặc /posters/abc.jpg"
        />
      </div>

      <div>
        <label className={label}>Mùa (VD: Mùa 9, Phần 2...)</label>
        <input
          value={movie.season}
          onChange={(e) => setMovie({ ...movie, season: e.target.value })}
          className={input}
          placeholder="Mùa 9"
        />
      </div>

      <div>
        <label className={label}>Thời lượng tổng</label>
        <input
          value={movie.duration}
          onChange={(e) => setMovie({ ...movie, duration: e.target.value })}
          className={input}
          placeholder="28h 48p"
        />
      </div>

      <div>
        <label className={label}>Thể loại (cách nhau dấu phẩy)</label>
        <input
          value={movie.tags}
          onChange={(e) => setMovie({ ...movie, tags: e.target.value })}
          className={input}
          placeholder="Tu Tiên, Võ hiệp, Main Có Não"
        />
      </div>

      <div>
        <label className={label}>Mô tả phim</label>
        <textarea
          value={movie.overview}
          onChange={(e) => setMovie({ ...movie, overview: e.target.value })}
          rows={3}
          className="w-full rounded-xl card-bg px-4 py-2 text-sm focus:outline-none focus:border-rose-400/50"
          placeholder="Nội dung phim..."
        />
      </div>

      <hr className="border-[#1e293b]" />

      {/* CUSTOM LINKS */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-sky-400">
          🔗 Link liên hệ ({customLinks.length})
        </h2>
        <button
          type="button"
          onClick={addCustomLink}
          className="text-xs px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 btn-tap"
        >
          + Thêm link
        </button>
      </div>

      {customLinks.map((link, i) => {
        const selectedColor = LINK_COLORS.find((c) => c.id === link.color);

        return (
          <div key={i} className="card-bg rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                value={link.name}
                onChange={(e) => updateCustomLink(i, 'name', e.target.value)}
                placeholder="Tên (VD: Vào nhóm Telegram...)"
                className="flex-1 h-9 rounded-lg bg-black/30 px-3 text-sm font-bold"
              />
              {customLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCustomLink(i)}
                  className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 btn-tap"
                >
                  ✕
                </button>
              )}
            </div>

            <input
              value={link.url}
              onChange={(e) => updateCustomLink(i, 'url', e.target.value)}
              placeholder="https://..."
              className="w-full h-9 rounded-lg bg-black/30 px-3 text-xs"
            />

            {/* ICON PICKER */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                Icon
              </label>

              <div className="grid grid-cols-4 gap-2">
                {ICON_PRESETS.map((ic, idx) => {
                  const isSelected = link.icon === ic.path;

                  return (
                    <button
                      key={idx}
                      type="button"
                      title={ic.name}
                      onClick={() => {
                        updateCustomLink(i, 'icon', ic.path);
                        updateCustomLink(i, 'color', ic.color);
                      }}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 p-1.5 transition-all border-2 ${
                        isSelected
                          ? 'border-sky-400 bg-sky-500/20 scale-105 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                          : 'border-white/10 bg-black/30 hover:border-sky-400/50 hover:bg-black/50'
                      }`}
                    >
                      <img
                        src={ic.path}
                        alt={ic.name}
                        className="w-6 h-6 object-contain"
                        loading="lazy"
                      />
                      <span className="text-[8px] text-slate-400 font-bold truncate w-full text-center">
                        {ic.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2">
                <label className="text-[10px] text-slate-500 font-bold block mb-1">
                  Hoặc dán URL icon tùy chỉnh:
                </label>
                <input
                  value={link.icon || ''}
                  onChange={(e) => updateCustomLink(i, 'icon', e.target.value)}
                  placeholder="https://..."
                  className="w-full h-8 rounded-lg bg-black/40 px-3 text-xs"
                />
              </div>
            </div>

            {/* CHỌN MÀU */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                Màu hiển thị
              </label>
              <div className="flex flex-wrap gap-1.5">
                {LINK_COLORS.map((c) => {
                  const active = link.color === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => updateCustomLink(i, 'color', c.id)}
                      title={c.name}
                      className={`w-7 h-7 rounded-lg border-2 transition-all ${c.bg} ${c.border} ${
                        active
                          ? 'scale-110 ring-2 ring-white/50 shadow-lg'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* PREVIEW */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                Xem trước
              </label>
              <div
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${selectedColor?.bg} ${selectedColor?.border} ${selectedColor?.text}`}
              >
                {link.icon && (
                  <img
                    src={link.icon}
                    alt=""
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span className="truncate">{link.name || 'Tên link'}</span>
              </div>
            </div>
          </div>
        );
      })}

      <hr className="border-[#1e293b]" />

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-amber-400">
          🎞 Danh sách tập ({seasons.length})
        </h2>
        <button
          type="button"
          onClick={addSeason}
          className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 btn-tap"
        >
          + Thêm tập
        </button>
      </div>

      {seasons.map((s, i) => (
        <div key={i} className="card-bg rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={s.name}
              onChange={(e) => updateSeason(i, 'name', e.target.value)}
              placeholder="Tên tập"
              className="flex-1 h-9 rounded-lg bg-black/30 px-3 text-sm"
            />
            {seasons.length > 1 && (
              <button
                type="button"
                onClick={() => removeSeason(i)}
                className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 btn-tap"
              >
                ✕
              </button>
            )}
          </div>

          <input
            value={s.facebook}
            onChange={(e) => updateSeason(i, 'facebook', e.target.value)}
            placeholder="Link Facebook"
            className="w-full h-9 rounded-lg bg-black/30 px-3 text-xs"
          />

          <input
            value={s.youtube}
            onChange={(e) => updateSeason(i, 'youtube', e.target.value)}
            placeholder="Link YouTube (nếu có)"
            className="w-full h-9 rounded-lg bg-black/30 px-3 text-xs"
          />
        </div>
      ))}
    </>
  );
}
