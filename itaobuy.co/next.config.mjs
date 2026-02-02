/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Enable image optimization with modern formats
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Disable Next/Vercel image optimization
    unoptimized: true,
  },
  // Enable compression
  compress: true,
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
}

export default nextConfig