"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FocusHeader } from "@/components/FocusHeader";
import { MobileActionBar } from "@/components/MobileActionBar";
import {
  AlertTriangle,
  Check,
  Download,
  EyeOff,
  FileText,
  Lock,
  Share,
  Spreadsheet,
  X,
} from "@/components/icons";
import { computeTotals } from "@/lib/calc";
import { yen } from "@/lib/format";
import type { Estimate } from "@/lib/types";

type OutputType = "pdf" | "customer-excel" | "internal-excel";

interface OutputDef {
  id: OutputType;
  label: string;
  audience: string;
  icon: (p: { className?: string }) => React.ReactNode;
  /** 業者指示事項を含むか。 */
  includesInternal: boolean;
  tone: "customer" | "internal";
}

const OUTPUTS: OutputDef[] = [
  {
    id: "pdf",
    label: "顧客提出用PDF",
    audience: "お客様へ提出・共有",
    icon: FileText,
    includesInternal: false,
    tone: "customer",
  },
  {
    id: "customer-excel",
    label: "顧客提出用Excel",
    audience: "お客様へ提出（編集可能形式）",
    icon: Spreadsheet,
    includesInternal: false,
    tone: "customer",
  },
  {
    id: "internal-excel",
    label: "社内・業者指示用Excel",
    audience: "社内・協力業者向け",
    icon: Lock,
    includesInternal: true,
    tone: "internal",
  },
];

export function ExportSettings({ estimate }: { estimate: Estimate }) {
  const router = useRouter();
  const [selected, setSelected] = useState<OutputType>("pdf");
  const [done, setDone] = useState(false);
  const totals = computeTotals(estimate.lines);
  const def = OUTPUTS.find((o) => o.id === selected)!;
  const editHref = `/estimates/${estimate.id}/edit`;

  const generate = () => {
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <div>
      <FocusHeader
        icon={<Download className="text-lg" />}
        title={estimate.title || "見積"}
        subtitle="出力設定"
        variant="back"
      />

      {/* 一貫した出力ルールの明示 */}
      <div className="mb-4 flex items-start gap-2 rounded-2xl border border-sky-200 bg-sky-50 p-3.5 text-sm text-sky-900">
        <EyeOff className="mt-0.5 shrink-0 text-base" />
        <p>
          <strong>顧客提出用PDF・Excelには業者指示事項は出力されません。</strong>
          業者指示事項を含められるのは「社内・業者指示用Excel」のみです。出力前に用途をご確認ください。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 出力種別の選択 */}
        <div className="space-y-3 lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-700">出力する形式を選ぶ</h2>
          {OUTPUTS.map((o) => (
            <OutputCard
              key={o.id}
              def={o}
              selected={selected === o.id}
              onSelect={() => setSelected(o.id)}
            />
          ))}
        </div>

        {/* 内容サマリー / 実行 */}
        <aside className="space-y-4">
          <section
            className={`card p-4 lg:sticky lg:top-28 ${
              def.tone === "internal" ? "ring-2 ring-amber-300" : ""
            }`}
          >
            <h2 className="mb-3 text-sm font-bold text-slate-700">出力内容</h2>
            <dl className="space-y-2 text-sm">
              <SummaryRow label="形式" value={def.label} />
              <SummaryRow label="提出先" value={def.audience} />
              <SummaryRow label="合計金額" value={yen(totals.total)} />
            </dl>

            <div className="my-3 h-px bg-slate-100" />

            <p className="mb-2 text-xs font-semibold text-slate-500">含まれる情報</p>
            <ul className="space-y-1.5 text-sm">
              <IncludeRow included label="見積明細・金額" />
              <IncludeRow included label="顧客向け備考（PDF表示）" />
              <IncludeRow
                included={def.includesInternal}
                label="業者指示事項（内部用）"
                danger={def.includesInternal}
              />
            </ul>

            {def.includesInternal ? (
              <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
                <AlertTriangle className="mt-0.5 shrink-0 text-sm" />
                このファイルには業者指示事項が含まれます。顧客には渡さないでください。
              </p>
            ) : (
              <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-500">
                <Check className="mt-0.5 shrink-0 text-sm text-emerald-500" />
                顧客提出用のため、業者指示事項は出力されません。
              </p>
            )}

            <button
              onClick={generate}
              className={`mt-4 hidden w-full lg:flex ${
                def.tone === "internal" ? "btn-secondary" : "btn-primary"
              }`}
            >
              {selected === "pdf" ? (
                <Share className="text-base" />
              ) : (
                <Download className="text-base" />
              )}
              {selected === "pdf" ? "PDFを作成して共有" : "Excelをダウンロード"}
            </button>
            {done && (
              <p className="mt-2 hidden items-center justify-center gap-1.5 text-sm font-semibold text-emerald-600 lg:flex">
                <Check className="text-base" />
                出力しました（デモ）
              </p>
            )}
          </section>

          {/* PDFプレビューの補足 */}
          {selected === "pdf" && (
            <section className="card overflow-hidden">
              <div className="border-b border-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-500">
                プレビュー（顧客向けPDF）
              </div>
              <div className="space-y-2 p-4 text-xs text-slate-400">
                <div className="h-2 w-2/3 rounded bg-slate-100" />
                <div className="h-2 w-1/2 rounded bg-slate-100" />
                <div className="mt-3 h-16 rounded bg-slate-50" />
                <p className="flex items-center gap-1.5 pt-1 text-[11px] text-amber-700">
                  <EyeOff className="text-xs" />
                  内部用メモ（業者指示事項）はPDFに表示されません。
                </p>
              </div>
            </section>
          )}
        </aside>
      </div>

      <MobileActionBar>
        <button
          onClick={() => router.push(editHref)}
          className="btn-secondary flex-1"
        >
          編集へ戻る
        </button>
        <button
          onClick={generate}
          className={`flex-1 ${
            def.tone === "internal" ? "btn-secondary" : "btn-primary"
          }`}
        >
          {selected === "pdf" ? "PDF共有" : "Excel出力"}
        </button>
      </MobileActionBar>
    </div>
  );
}

function OutputCard({
  def,
  selected,
  onSelect,
}: {
  def: OutputDef;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = def.icon;
  const internal = def.tone === "internal";
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
        selected
          ? internal
            ? "border-amber-400 bg-amber-50/70 ring-2 ring-amber-300"
            : "border-brand-400 bg-brand-50/60 ring-2 ring-brand-300"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          internal ? "bg-amber-100 text-amber-700" : "bg-brand-100 text-brand-700"
        }`}
      >
        <Icon className="text-xl" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">{def.label}</span>
          {selected && (
            <Check
              className={`text-base ${
                internal ? "text-amber-600" : "text-brand-600"
              }`}
            />
          )}
        </span>
        <span className="mt-0.5 block text-xs text-slate-500">{def.audience}</span>
        <span
          className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
            def.includesInternal
              ? "bg-amber-50 text-amber-800 ring-amber-300"
              : "bg-emerald-50 text-emerald-700 ring-emerald-200"
          }`}
        >
          {def.includesInternal ? (
            <>
              <EyeOff className="text-[11px]" />
              業者指示事項を含む
            </>
          ) : (
            <>
              <X className="text-[11px]" />
              業者指示事項を含まない
            </>
          )}
        </span>
      </span>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="num text-right font-semibold text-slate-700">{value}</dd>
    </div>
  );
}

function IncludeRow({
  included,
  label,
  danger = false,
}: {
  included: boolean;
  label: string;
  danger?: boolean;
}) {
  return (
    <li className="flex items-center gap-2">
      {included ? (
        <Check
          className={`text-base ${danger ? "text-amber-600" : "text-emerald-500"}`}
        />
      ) : (
        <X className="text-base text-slate-300" />
      )}
      <span className={included ? "text-slate-700" : "text-slate-400 line-through"}>
        {label}
      </span>
    </li>
  );
}
