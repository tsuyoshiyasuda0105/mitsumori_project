import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 3600;

const disallowedPaths = [
  "/dashboard",
  "/customers",
  "/estimates",
  "/import",
  "/price-items",
  "/settings",
  "/login",
];

export function GET(): Response {
  const lines = [
    "User-agent: *",
    "Allow: /",
    ...disallowedPaths.map((path) => `Disallow: ${path}`),
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
