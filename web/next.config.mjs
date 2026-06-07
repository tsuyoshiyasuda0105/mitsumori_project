/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/lp/sitemap.xml",
        destination: "/sitemap.xml",
        permanent: true,
      },
      {
        source: "/lp",
        destination: "/",
        permanent: true,
      },
      {
        source: "/app",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/TOP",
        destination: "/app",
        permanent: true,
      },
      {
        source: "/top",
        destination: "/app",
        permanent: true,
      },
      {
        source: "/blog/genjo-kaifuku-estimate-ai",
        destination: "/blog/reform-construction-estimate-ai",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
