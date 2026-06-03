import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "@/components/icons";
import { formatDate, getAllPosts, readingMinutes } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const TITLE = "お役立ち記事";
const DESC =
  "外壁塗装・リフォーム業の見積作成を効率化するヒント集。現場での見積作成、原価・利益の情報分離、属人化の解消、デジタル化の進め方を解説します。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "ボイス見積",
    url: "/blog",
    title: `${TITLE} | ボイス見積`,
    description: DESC,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "ボイス見積 お役立ち記事",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${TITLE} | ボイス見積`,
    description: DESC,
    url: `${SITE_URL}/blog`,
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      url: `${SITE_URL}/blog/${p.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-bold text-brand-700">BLOG</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            {TITLE}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            {DESC}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
            >
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mt-3 text-lg font-bold leading-snug text-slate-900 group-hover:text-brand-700">
                {post.title}
              </h2>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-7 text-slate-600">
                {post.description}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span className="num">
                  {formatDate(post.date)}・約{readingMinutes(post)}分
                </span>
                <span className="inline-flex items-center gap-0.5 font-semibold text-brand-700">
                  読む
                  <ChevronRight className="text-sm transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
