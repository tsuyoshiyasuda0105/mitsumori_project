import type { ReactNode } from "react";
import { AlertTriangle, Eye, EyeOff, Sparkles } from "./icons";
import type { EstimateStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";

/* ── 情報種別ラベル ──────────────────────────────
   顧客可視 / 内部のみ の取り違え防止が本アプリ最重要のUX。
   色とアイコンで明確に分離する。 */

export function CustomerTag({ children = "PDF表示" }: { children?: ReactNode }) {
  return (
    <span className="tag-customer">
      <Eye className="text-[13px]" />
      {children}
    </span>
  );
}

export function InternalTag({ children = "内部用・PDF非表示" }: { children?: ReactNode }) {
  return (
    <span className="tag-internal">
      <EyeOff className="text-[13px]" />
      {children}
    </span>
  );
}

export function ConfirmTag({ children = "要確認" }: { children?: ReactNode }) {
  return (
    <span className="tag-confirm">
      <AlertTriangle className="text-[12px]" />
      {children}
    </span>
  );
}

export function AiTag({ children = "AI候補" }: { children?: ReactNode }) {
  return (
    <span className="tag-ai">
      <Sparkles className="text-[12px]" />
      {children}
    </span>
  );
}

/* ── ステータスバッジ ────────────────────────── */

const STATUS_STYLE: Record<EstimateStatus, string> = {
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  submitted: "bg-sky-50 text-sky-700 ring-sky-200",
  won: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  lost: "bg-rose-50 text-rose-700 ring-rose-200",
  cancelled: "bg-slate-100 text-slate-400 ring-slate-200 line-through",
};

export function StatusBadge({ status }: { status: EstimateStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ── セクションカード ────────────────────────── */

export function SectionCard({
  title,
  trailing,
  children,
  tone = "default",
  className = "",
}: {
  title?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
  tone?: "default" | "internal";
  className?: string;
}) {
  const base =
    tone === "internal"
      ? "rounded-2xl border border-amber-300 bg-amber-50/60 shadow-card"
      : "card";
  return (
    <section className={`${base} ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700">
            {title}
          </h2>
          {trailing}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

/* ── 統計タイル ──────────────────────────────── */

export function StatTile({
  label,
  value,
  accent = "slate",
  hint,
}: {
  label: string;
  value: ReactNode;
  accent?: "slate" | "brand" | "amber" | "emerald" | "rose" | "sky";
  hint?: string;
}) {
  const accentText: Record<string, string> = {
    slate: "text-slate-900",
    brand: "text-brand-700",
    amber: "text-amber-700",
    emerald: "text-emerald-700",
    rose: "text-rose-700",
    sky: "text-sky-700",
  };
  return (
    <div className="card p-4">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className={`mt-1 num text-2xl font-bold ${accentText[accent]}`}>
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-slate-400">{hint}</div>}
    </div>
  );
}

/* ── 空状態 ──────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
      {icon && <div className="mb-3 text-3xl text-slate-300">{icon}</div>}
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-xs text-slate-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
