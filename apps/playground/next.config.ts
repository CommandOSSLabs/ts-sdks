import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  serverExternalPackages: ['@mysten/walrus', '@mysten/walrus-wasm']
}

export default nextConfig
