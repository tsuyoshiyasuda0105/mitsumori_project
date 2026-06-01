import type { ReactNode } from "react";
import { AlertTriangle } from "@/components/icons";

/** 法務系ページの共通シェル（タイトル + 雛形バナー + 本文） */
export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-slate-400">最終更新日: {updated}</p>
      <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50/70 p-3 text-sm text-amber-800">
        <AlertTriangle className="mt-0.5 shrink-0 text-base" />
        <p>
          本ページはデモ版の雛形です。実際の有料提供を開始する前に、内容を自社の情報・運用に合わせて確定してください。
        </p>
      </div>
      <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-slate-700">
        {children}
      </div>
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

/** 特商法表記の項目行（ラベル + 値） */
export function LegalRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-3 sm:grid-cols-[190px_1fr] sm:gap-4">
      <dt className="text-sm font-semibold text-slate-500">{label}</dt>
      <dd className="text-slate-800">{children}</dd>
    </div>
  );
}

/** 公開前に確定が必要なプレースホルダを強調 */
export function Ph({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-amber-100 px-1 font-medium text-amber-800">
      {children}
    </span>
  );
}
