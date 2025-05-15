/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "https://kpjbvnzvqynyaydrtlta.supabase.co/storage/v1/object/public/post-images/",
    ], // Add your image domains here
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    formats: ["image/webp"],
  },
};

module.exports = nextConfig;
