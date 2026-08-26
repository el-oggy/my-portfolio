/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Virtual room routes: the 3D experience pushStates /gallery, /studio,
  // /about, /contact as the user teleports. Rewrites let a refresh (F5)
  // serve the app instead of a 404, while client-side code reads the
  // pathname to re-enter the correct room.
  async rewrites() {
    return [
      { source: "/gallery", destination: "/" },
      { source: "/studio", destination: "/" },
      { source: "/about", destination: "/" },
      { source: "/contact", destination: "/" },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
