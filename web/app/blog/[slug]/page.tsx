import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogContent } from "@/components/marketing/BlogContent";
import { ArrowLeft, ChevronRight, Mic } from "@/components/icons";
import {
  formatDate,
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  readingMinutes,
} from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      locale: "ja_JP",
      siteName: "ボイス見積",
      url: `/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      images: [
        {
          url: "/og-image.svg",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/og-image.svg"],
    },
    robots: { index: true, follow: true },
  };
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug, 2);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: "ja",
      mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
      image: `${SITE_URL}/og-image.svg`,
      author: { "@type": "Organization", name: "ボイス見積" },
      publisher: {
        "@type": "Organization",
        name: "ボイス見積",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "お役立ち記事", item: `${SITE_URL}/blog` },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: `${SITE_URL}/blog/${post.slug}`,
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        {/* パンくず */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/blog" className="inline-flex items-center gap-1 hover:text-brand-700">
            <ArrowLeft className="text-sm" />
            お役立ち記事
          </Link>
        </nav>

        {/* 記事ヘッダ */}
        <header className="mt-4">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight text-slate-900 sm:text-[32px] sm:leading-[1.3]">
            {post.title}
          </h1>
          <p className="num mt-3 text-xs text-slate-400">
            {formatDate(post.date)}・約{readingMinutes(post)}分で読めます
          </p>
        </header>

        <hr className="my-7 border-slate-100" />

        {/* 本文 */}
        <BlogContent body={post.body} />

        {/* CTA */}
        <section className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-7 text-white sm:p-9">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Mic className="text-xl" />
          </span>
          <h2 className="mt-4 text-xl font-extrabold leading-snug sm:text-2xl">
            現場の見積フローに合うか、デモで確かめてみませんか
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            ボイス見積は、音声入力・単価マスター・業者指示事項の分離・Excel/PDF出力を一つの流れで確認できるプロトタイプです。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-white px-6 text-base font-bold text-slate-950 hover:bg-slate-100"
            >
              デモを試す
              <ChevronRight className="text-lg" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-white/30 px-6 text-base font-bold text-white hover:bg-white/10"
            >
              導入相談をする
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            ※ 現在はデモ用のUIサンプルです。
          </p>
        </section>

        {/* 関連記事 */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm font-bold text-slate-500">関連記事</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <h3 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-brand-700">
                    {r.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-6 text-slate-500">
                    {r.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
