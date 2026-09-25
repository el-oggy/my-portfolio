/** @type {import('next').NextConfig} */
const nextConfig = {
  // Linting runs during `next build` again (the old
  // `eslint.ignoreDuringBuilds: true` hid 2 real errors for weeks and let
  // them silently accumulate). Warnings don't fail the build; errors do.
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
};

export default nextConfig;
