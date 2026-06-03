/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/blog/genjo-kaifuku-estimate-ai",
        destination: "/blog/reform-construction-estimate-ai",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;