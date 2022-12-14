/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["storage.pinecast.net", "d3t3ozftmdmh3i.cloudfront.net"],
  },
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
