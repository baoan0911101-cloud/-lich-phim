/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Cho phép tải ảnh từ bất kỳ trang web nào
      },
      {
        protocol: 'http',
        hostname: '**', // Phòng trường hợp link ảnh là http
      }
    ],
  },
};

export default nextConfig;
