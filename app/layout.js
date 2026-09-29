import './globals.css';
import TopHeader from '@/components/TopHeader';
import BottomNav from '@/components/BottomNav';

export const metadata = {
  title: 'XemVietSub | Xem phim chất lượng cao',
  description: 'Khám phá kho phim 3D, 2D, siêu thực chất lượng cao',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <div className="max-w-md md:max-w-6xl mx-auto min-h-screen pb-24 anim-fadeIn">
          <TopHeader />
          <main>{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
