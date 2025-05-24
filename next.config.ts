import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/@:authorId/:pageId',
        destination: '/authorId/:authorId/:pageId',
      },
      {
        source: '/@:authorId',
        destination: '/authorId/:authorId',
      },
    ];
  },

  images: {
    remotePatterns: [{
      protocol: "https",
      hostname: "res.cloudinary.com",
      port: '',
      pathname: "/panta/image/upload/**",
      search: ''
    }]
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  }
};
export default nextConfig;