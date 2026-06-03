import Link from "next/link";
import { ChevronRight, Mic } from "@/components/icons";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Mic className="text-lg" />
            </span>
            <span className="text-base font-bold tracking-tight">ボイス見積</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-4">
            <Link
              href="/blog"
              className="hidden px-2 text-sm font-medium text-slate-600 hover:text-brand-700 sm:inline-flex"
            >
              お役立ち記事
            </Link>
            <Link
              href="/contact"
              className="hidden px-2 text-sm font-medium text-slate-600 hover:text-brand-700 sm:inline-flex"
            >
              相談する
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              デモを試す
              <ChevronRight className="text-base" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Mic className="text-base" />
            </span>
            <span className="font-bold">ボイス見積</span>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-brand-700">
              トップ
            </Link>
            <Link href="/blog" className="hover:text-brand-700">
              お役立ち記事
            </Link>
            <Link href="/contact" className="hover:text-brand-700">
              お問い合わせ
            </Link>
            <Link href="/privacy" className="hover:text-brand-700">
              プライバシーポリシー
            </Link>
          </nav>
        </div>
        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
          © 2026 ボイス見積 — このページはデモ用のUIサンプルです。
        </div>
      </footer>
    </div>
  );
}
