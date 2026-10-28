'use client';
import './globals.css';
import TopHeader from '@/components/TopHeader';
import BottomNav from '@/components/BottomNav';
import { useEffect } from 'react';

// Component phụ để xử lý logic ping online
function OnlineTracker() {
  useEffect(() => {
    // Tạo ID ngẫu nhiên cho user nếu chưa có
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('userId', userId);
    }

    // Ping server báo online
    const ping = () => {
      fetch('/api/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      }).catch(() => {});
    };

    ping(); // Ping lần đầu
    const interval = setInterval(ping, 60000); // Ping mỗi 60 giây

    return () => clearInterval(interval);
  }, []);

  return null; // Component này không hiển thị gì cả
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <title>XemVietSub | Xem phim chất lượng cao</title>
        <meta name="description" content="Khám phá kho phim 3D, 2D, siêu thực chất lượng cao" />
      </head>
      <body>
        {/* Gọi component theo dõi online */}
        <OnlineTracker />
        
        <div className="max-w-md md:max-w-6xl mx-auto min-h-screen pb-24 anim-fadeIn">
          <TopHeader />
          <main>{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
