/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
};

export default nextConfig;
