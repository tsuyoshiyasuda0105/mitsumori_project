import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "@/components/icons";
import { formatDate, getAllPosts, readingMinutes } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const TITLE = "建設業・リフォーム工事の見積DXブログ";
const DESC =
  "建設業・リフォーム工事の見積作成を効率化するブログ。音声入力、Excel単価表、AI見積、業者指示事項の分離、データ連携の考え方を解説します。";

const READING_PATHS = [
  [
    "01",
    "Excel単価表を残して始める",
    "今ある単価マスターを活かし、AI見積を小さく試す考え方。",
    "/blog/excel-unit-price-ai-estimate",
  ],
  [
    "02",
    "音声入力のデモを見る",
    "現場メモが文字起こし、明細候補、確認事項へ変わる流れ。",
    "/blog/onsei-ai-mitsumori-demo",
  ],
  [
    "03",
    "データ連携の準備をする",
    "施工管理や会計へつなぐ前に、品目・単位・IDを整える視点。",
    "/blog/kensetsu-mitsumori-data-renkei",
  ],
];

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
        alt: "ボイス見積 見積DXブログ",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const [featured, ...others] = posts;

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
      <div className="bg-[radial-gradient(circle_at_12%_0%,rgba(14,165,233,0.12),transparent_32%),linear-gradient(180deg,#f8fafc_0%,#ffffff_42%)]">
        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-700">
              BLOG / SEO KNOWLEDGE
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl">
              建設業・リフォーム工事の見積DXブログ
            </h1>
            <p className="mt-4 text-sm font-medium leading-8 text-slate-600 sm:text-base">
              音声入力、Excel単価表、AI見積、業者指示事項の分離、データ連携を、導入前に確認できる読み物として整理しています。記事を読んでから、デモや相談へ進めます。
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-black text-white hover:bg-slate-800">
                デモを試す <ChevronRight />
              </Link>
              <Link href="/contact" className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-black text-slate-800 hover:border-brand-200 hover:text-brand-700">
                導入相談をする
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-black text-slate-500">読む順番</p>
            <div className="mt-4 space-y-3">
              {READING_PATHS.map(([no, title, body, href]) => (
                <Link key={href} href={href} className="group flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-brand-200 hover:bg-brand-50/40">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-brand-700 shadow-sm">
                    {no}
                  </span>
                  <span>
                    <span className="block text-sm font-black text-slate-950 group-hover:text-brand-700">
                      {title}
                    </span>
                    <span className="mt-1 block text-xs font-medium leading-6 text-slate-500">
                      {body}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {featured && (
          <section className="mx-auto max-w-6xl px-5 pb-10">
            <Link href={`/blog/${featured.slug}`} className="group grid overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)] lg:grid-cols-[0.95fr_1.05fr]">
              <div className="p-7 sm:p-9">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                  Featured article
                </p>
                <h2 className="mt-4 text-2xl font-black leading-tight tracking-[-0.03em] sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-4 line-clamp-3 text-sm font-medium leading-8 text-slate-300">
                  {featured.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-cyan-200">
                  この記事を読む <ChevronRight className="transition group-hover:translate-x-0.5" />
                </span>
              </div>
              <div className="border-t border-white/10 bg-[radial-gradient(circle_at_72%_18%,rgba(34,211,238,0.24),transparent_32%),linear-gradient(135deg,#0f172a,#111827)] p-7 sm:p-9 lg:border-l lg:border-t-0">
                <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                  <p className="text-xs font-black text-slate-400">SEO THEME</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {featured.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 text-xs font-bold text-slate-400">
                    {formatDate(featured.date)}・約{readingMinutes(featured)}分で読めます
                  </p>
                </div>
              </div>
            </Link>
          </section>
        )}

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="grid gap-5 sm:grid-cols-2">
            {others.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50/40 hover:shadow-md">
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
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
                    読む <ChevronRight className="text-sm transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
