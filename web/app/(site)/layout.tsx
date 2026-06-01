import Link from "next/link";
import { ArrowLeft, Mic } from "@/components/icons";

const SITE_LINKS = [
  { href: "/tokushoho", label: "特定商取引法に基づく表記" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/terms", label: "利用規約" },
  { href: "/contact", label: "お問い合わせ" },
];

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link href="/lp" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Mic className="text-lg" />
            </span>
            <span className="text-base font-bold tracking-tight">ボイス見積</span>
          </Link>
          <Link
            href="/lp"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-700"
          >
            <ArrowLeft className="text-base" /> トップへ戻る
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
            {SITE_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-brand-700">
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="mt-4 text-xs text-slate-400">
            © 2026 ボイス見積 — このページはデモ用のUIサンプルです。
          </p>
        </div>
      </footer>
    </div>
  );
}
