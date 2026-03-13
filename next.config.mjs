/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Run eslint separately (e.g. in CI). Don't block production build.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
