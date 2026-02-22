/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@context-window/shared'],
  images: {
    unoptimized: true,
  },
}

export default nextConfig
