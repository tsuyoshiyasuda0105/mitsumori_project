"use client";

import { useMemo, useRef, useState } from "react";
import { FocusHeader } from "@/components/FocusHeader";
import { computeTotals } from "@/lib/calc";
import {
  buildCopySummary,
  buildCsvText,
  buildCustomerNote,
  buildCustomerPrintTitle,
  buildExportRows,
  buildInternalInstruction,
  buildTsvText,
  type ExportAudience,
} from "@/lib/export-utils";
import { fmtDate, yen } from "@/lib/format";
import { customerName, getEstimateOrBlank } from "@/lib/mock";
import { useEstimateStore } from "@/lib/estimate-store";

export default function Page({ params }: { params: { id: string } }) {
  const fallbackEstimate = useMemo(() => getEstimateOrBlank(params.id).estimate, [params.id]);
  const { ready, getEstimate, backendMode, syncError } = useEstimateStore();
  const estimate = getEstimate(params.id) ?? fallbackEstimate;
  const customer = customerName(estimate.customerId);
  const totals = computeTotals(estimate.lines);
  const printTitle = buildCustomerPrintTitle(estimate);
  const customerRows = buildExportRows(estimate, "customer");
  const internalRows = buildExportRows(estimate, "internal");
  const [audience, setAudience] = useState<ExportAudience>("internal");
  const [copied, setCopied] = useState<string | null>(null);
  const [historyStatus, setHistoryStatus] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const tsvText = useMemo(
    () => buildTsvText(estimate, audience, customer),
    [audience, customer, estimate],
  );
  const copySummary = useMemo(
    () => buildCopySummary(estimate, customer),
    [customer, estimate],
  );

  const recordExportHistory = async (
    exportType: "excel" | "pdf" | "csv",
    exportMode: "customer" | "internal" | "integration",
    result: Record<string, unknown>,
  ) => {
    try {
      const response = await fetch("/api/export-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimateId: estimate.id,
          exportType,
          exportMode,
          result: {
            estimateNo: estimate.estimateNo,
            title: estimate.title,
            ...result,
          },
        }),
      });
      const payload = (await response.json()) as {
        mode?: "database" | "local";
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "出力履歴を保存できませんでした。");
      }
      setHistoryStatus(
        payload.mode === "database"
          ? "DBに出力履歴を保存しました。"
          : "DB未接続のため、今回は画面上の出力記録のみです。",
      );
      setHistoryError(null);
    } catch (error) {
      setHistoryStatus(null);
      setHistoryError(
        error instanceof Error ? error.message : "出力履歴の保存に失敗しました。",
      );
    }
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(label);
    if (label === "tsv") {
      void recordExportHistory("excel", audience, {
        action: "copy_tsv",
        rowCount: estimate.lines.length,
      });
    }
    window.setTimeout(() => setCopied(null), 1800);
  };

  const downloadCsv = () => {
    void recordExportHistory("csv", audience, {
      action: "download_csv",
      rowCount: estimate.lines.length,
    });
    const csv = buildCsvText(estimate, audience, customer);
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${estimate.estimateNo || estimate.id}-${audience}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const printCustomerPreview = () => {
    void recordExportHistory("pdf", "customer", {
      action: "print_or_save_pdf",
      total: totals.total,
    });
    const currentTitle = document.title;
    document.title = printTitle;
    window.print();
    document.title = currentTitle;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="print:hidden">
        <FocusHeader
          title={estimate.title || "見積書出力"}
          subtitle="顧客向けPDFプレビュー/印刷と社内向けCSV・Excel貼り付けテキスト"
          variant="back"
        />
      </div>

      <section className="print:hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
        <p className="font-bold">出力範囲の安全ルール</p>
        <p className="mt-1">
          顧客向けPDFプレビュー/印刷には、見積全体・明細行の業者指示事項を表示しません。
          社内向けのCSV/Excel貼り付け用テキストでは、必要に応じて業者指示事項を含められます。
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-4">
          <div className="print:hidden flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">顧客向けPDFプレビュー</h2>
              <p className="text-sm text-slate-500">
                このプレビューが印刷対象です。ブラウザの「PDFに保存」でPDF化できます。
              </p>
            </div>
            <button onClick={printCustomerPreview} className="btn-primary">
              印刷 / PDF保存
            </button>
          </div>

          <article className="print-area rounded-3xl border border-slate-200 bg-white p-5 shadow-card print:border-0 print:p-0 print:shadow-none sm:p-8">
            <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold tracking-[0.35em] text-slate-400">ESTIMATE</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">御見積書</h1>
                <p className="mt-3 text-sm text-slate-600">{customer} 御中</p>
              </div>
              <dl className="grid gap-1 text-sm text-slate-600 sm:text-right">
                <div>
                  <dt className="inline text-slate-400">見積番号: </dt>
                  <dd className="inline font-semibold text-slate-900">{estimate.estimateNo}</dd>
                </div>
                <div>
                  <dt className="inline text-slate-400">見積日: </dt>
                  <dd className="inline">{fmtDate(estimate.estimateDate)}</dd>
                </div>
                <div>
                  <dt className="inline text-slate-400">有効期限: </dt>
                  <dd className="inline">{fmtDate(estimate.expiresOn)}</dd>
                </div>
                <div>
                  <dt className="inline text-slate-400">担当: </dt>
                  <dd className="inline">{estimate.assignee}</dd>
                </div>
              </dl>
            </div>

            <div className="my-6 rounded-2xl bg-slate-950 p-5 text-white print:bg-slate-100 print:text-slate-950">
              <p className="text-sm text-slate-300 print:text-slate-500">件名</p>
              <p className="mt-1 text-xl font-bold">{estimate.title || "未設定"}</p>
              <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/15 pt-4 print:border-slate-300">
                <span className="text-sm text-slate-300 print:text-slate-500">お見積金額(税込)</span>
                <span className="num text-3xl font-black">{yen(totals.total)}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-y border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="w-12 px-3 py-3">No</th>
                    <th className="px-3 py-3">場所</th>
                    <th className="px-3 py-3">品目</th>
                    <th className="px-3 py-3 text-right">数量</th>
                    <th className="px-3 py-3">単位</th>
                    <th className="px-3 py-3 text-right">単価</th>
                    <th className="px-3 py-3 text-right">金額</th>
                  </tr>
                </thead>
                <tbody>
                  {customerRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-slate-400">
                        明細がありません。
                      </td>
                    </tr>
                  ) : (
                    customerRows.map((line) => (
                      <tr key={`${line.no}-${line.itemName}`} className="border-b border-slate-100 align-top">
                        <td className="px-3 py-3 text-slate-500">{line.no}</td>
                        <td className="px-3 py-3">{line.location}</td>
                        <td className="px-3 py-3">
                          <p className="font-semibold text-slate-900">{line.itemName}</p>
                          {line.description && <p className="mt-1 text-xs text-slate-500">{line.description}</p>}
                          {line.customerNote && <p className="mt-1 text-xs text-slate-500">備考: {line.customerNote}</p>}
                        </td>
                        <td className="num px-3 py-3 text-right">{line.quantity}</td>
                        <td className="px-3 py-3">{line.unit}</td>
                        <td className="num px-3 py-3 text-right">{yen(line.unitPrice)}</td>
                        <td className="num px-3 py-3 text-right font-semibold">{yen(line.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_280px]">
              <section className="rounded-2xl border border-slate-200 p-4">
                <h2 className="text-sm font-bold text-slate-900">備考</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {buildCustomerNote(estimate)}
                </p>
                <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-xs font-semibold text-emerald-700 print:hidden">
                  顧客向け出力のため、業者指示事項はここにも明細にも表示されません。
                </p>
              </section>
              <dl className="rounded-2xl border border-slate-200 p-4 text-sm">
                <TotalRow label="小計" value={yen(totals.subtotal)} />
                <TotalRow label="消費税(10%)" value={yen(totals.tax)} />
                <div className="mt-3 border-t border-slate-200 pt-3">
                  <TotalRow label="合計" value={yen(totals.total)} strong />
                </div>
              </dl>
            </div>
          </article>
        </section>

        <aside className="print:hidden space-y-4">
          <section className="card p-4">
            <h2 className="text-lg font-bold text-slate-900">社内向けCSV / Excel貼り付け</h2>
            <p className="mt-1 text-sm text-slate-500">
              Excelにはタブ区切りテキストをそのまま貼り付けできます。CSVはUTF-8 BOM付きで保存します。
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <AudienceButton
                active={audience === "customer"}
                title="顧客共有用データ"
                description="業者指示事項を含めない"
                tone="safe"
                onClick={() => setAudience("customer")}
              />
              <AudienceButton
                active={audience === "internal"}
                title="社内・業者手配用データ"
                description="業者指示事項を含める"
                tone="warning"
                onClick={() => setAudience("internal")}
              />
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              {audience === "internal"
                ? "現在のテキスト/CSVには業者指示事項が含まれます。顧客送付前に出力先を確認してください。"
                : "現在のテキスト/CSVには業者指示事項を含めません。顧客共有用の確認にも使えます。"}
            </div>

            <textarea
              ref={textAreaRef}
              value={tsvText}
              readOnly
              className="mt-4 h-72 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-700 outline-none focus:ring-2 focus:ring-brand-200"
            />

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button onClick={() => copyText(tsvText, "tsv")} className="btn-primary">
                TSVをコピー
              </button>
              <button onClick={downloadCsv} className="btn-secondary">
                CSVダウンロード
              </button>
            </div>
            <button
              onClick={() => copyText(copySummary, "summary")}
              className="btn-secondary mt-2 w-full"
            >
              見積サマリーをコピー
            </button>
            {copied && (
              <p className="mt-2 text-center text-sm font-semibold text-emerald-600">
                {copied === "summary" ? "サマリー" : "TSV"}をコピーしました。
              </p>
            )}
            {(historyStatus || historyError) && (
              <p
                className={`mt-2 rounded-xl px-3 py-2 text-center text-xs font-semibold ${
                  historyError
                    ? "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200"
                    : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                }`}
              >
                {historyError ?? historyStatus}
              </p>
            )}
          </section>

          <section className="card p-4">
            <h2 className="text-sm font-bold text-slate-900">社内確認用の業者指示事項</h2>
            <p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              {buildInternalInstruction(estimate)}
            </p>
            <div className="mt-3 max-h-56 overflow-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-3 py-2">No</th>
                    <th className="px-3 py-2">品目</th>
                    <th className="px-3 py-2">行別指示</th>
                  </tr>
                </thead>
                <tbody>
                  {internalRows.map((line) => (
                    <tr key={`internal-${line.no}-${line.itemName}`} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-500">{line.no}</td>
                      <td className="px-3 py-2">{line.itemName}</td>
                      <td className="px-3 py-2 text-amber-800">{line.internalInstruction || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
            <p>データ取得: {ready ? (backendMode === "database" ? "DB/同期済み" : "mock + localStorage") : "確認中"}</p>
            {syncError && <p className="mt-1 text-amber-700">DB接続なしでローカル表示中: {syncError}</p>}
          </section>
        </aside>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print-area {
            width: 100% !important;
          }
          @page {
            margin: 14mm;
            size: A4 portrait;
          }
        }
      `}</style>
    </div>
  );
}

function TotalRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <dt className={strong ? "font-bold text-slate-900" : "text-slate-500"}>{label}</dt>
      <dd className={`num text-right ${strong ? "text-xl font-black text-slate-950" : "font-semibold text-slate-800"}`}>
        {value}
      </dd>
    </div>
  );
}

function AudienceButton({
  active,
  title,
  description,
  tone,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  tone: "safe" | "warning";
  onClick: () => void;
}) {
  const activeClass =
    tone === "warning"
      ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200"
      : "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-3 text-left transition ${
        active ? activeClass : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <span className="block text-sm font-bold text-slate-900">{title}</span>
      <span className={tone === "warning" ? "mt-1 block text-xs text-amber-800" : "mt-1 block text-xs text-emerald-700"}>
        {description}
      </span>
    </button>
  );
}
