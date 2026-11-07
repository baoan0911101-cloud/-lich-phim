/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true, // 🎯 Bật nén Gzip
  images: {
    formats: ['image/avif', 'image/webp'], // 🎯 Tự động chuyển sang ảnh siêu nhẹ
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
