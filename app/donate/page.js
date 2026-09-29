'use client';
import { useState } from 'react';

export default function DonatePage() {
  const [tab, setTab] = useState('Ủng Hộ Admin');

  return (
    <div className="px-4 py-6">
      <div className="text-center mb-6 anim-fadeInUp d-1">
        <div className="text-4xl mb-2 anim-float inline-block">💝</div>
        <h1 className="text-2xl font-black grad-text">Ủng hộ tụi mình</h1>
        <p className="text-xs text-slate-500 mt-1">
          Mọi đóng góp giúp duy trì server và cập nhật phim mới
        </p>
      </div>

      <div className="flex gap-2 mb-5 anim-fadeInUp d-2">
        {['Ủng Hộ Admin', 'Sản phẩm Shopee'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold btn-tap transition-all ${
              tab === t
                ? 'bg-gradient-to-r from-rose-400 to-orange-500 text-white shadow-lg'
                : 'card-bg text-slate-400'
            }`}
          >
            {t === 'Ủng Hộ Admin' ? '💗' : '🛍'} {t}
          </button>
        ))}
      </div>

      {tab === 'Ủng Hộ Admin' && (
        <div className="anim-fadeInUp d-3">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-2xl shadow-2xl anim-float">
              <img
                src="/qr-donate.png"
                alt="QR donate"
                className="w-52 h-52 object-contain"
              />
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-500 mb-4">
            💡 Nhấn giữ vào ảnh QR để Lưu hoặc Chia sẻ
          </p>

          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
              ❤️ Đồng Hành Cùng Admin
            </span>
          </div>

          <h2 className="text-lg font-black text-center text-slate-100 mb-3">
            Ủng hộ duy trì cộng đồng
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed text-center">
            Nếu ứng dụng giúp ích cho bạn, hãy Donate ủng hộ Admin một ly
            cà phê để có thêm động lực cập nhật link phim nhanh chóng
            nhất nhé!
          </p>
        </div>
      )}

      {tab === 'Sản phẩm Shopee' && (
        <div className="card-bg rounded-2xl p-8 text-center anim-scaleIn">
          <div className="text-5xl mb-3 anim-float inline-block">🛍</div>
          <p className="text-sm text-slate-400">
            Sản phẩm Shopee sẽ hiển thị ở đây.
          </p>
        </div>
      )}
    </div>
  );
}
