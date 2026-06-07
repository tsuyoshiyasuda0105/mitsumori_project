import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 3600;

const publicPages = [
  { path: "", changefreq: "weekly", priority: "1.0" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/tokushoho", changefreq: "yearly", priority: "0.3" },
] as const;

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizeDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function urlEntry(input: {
  loc: string;
  lastmod: string | Date;
  changefreq: string;
  priority: string;
}): string {
  return [
    "  <url>",
    `    <loc>${xmlEscape(input.loc)}</loc>`,
    `    <lastmod>${normalizeDate(input.lastmod)}</lastmod>`,
    `    <changefreq>${input.changefreq}</changefreq>`,
    `    <priority>${input.priority}</priority>`,
    "  </url>",
  ].join("\n");
}

export function GET(): Response {
  const now = new Date();
  const entries = [
    ...publicPages.map((page) =>
      urlEntry({
        loc: `${SITE_URL}${page.path}`,
        lastmod: now,
        changefreq: page.changefreq,
        priority: page.priority,
      }),
    ),
    ...getAllPosts().map((post) =>
      urlEntry({
        loc: `${SITE_URL}/blog/${post.slug}`,
        lastmod: post.date,
        changefreq: "monthly",
        priority: "0.7",
      }),
    ),
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
