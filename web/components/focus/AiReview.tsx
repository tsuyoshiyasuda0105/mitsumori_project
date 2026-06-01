"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FocusHeader } from "@/components/FocusHeader";
import { MobileActionBar } from "@/components/MobileActionBar";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Pencil,
  Sparkles,
  X,
} from "@/components/icons";
import { AiTag, ConfirmTag, CustomerTag, InternalTag } from "@/components/ui";
import {
  type AiLineCandidate,
  findPriceItem,
  mockAiResult,
} from "@/lib/ai";
import { yen } from "@/lib/format";
import { customerName, priceItems } from "@/lib/mock";

type LineStatus = "adopt" | "exclude";
type ConfirmClass = "later" | "confirmed" | "skip";

const SOURCE_LABEL: Record<string, string> = {
  voice: "音声入力",
  text: "テキスト入力",
  meeting: "打ち合わせ録音",
};

export function AiReview({ estimateId }: { estimateId: string }) {
  const router = useRouter();
  const result = useMemo(() => mockAiResult("voice"), []);

  const [lines, setLines] = useState<AiLineCandidate[]>(result.lines);
  const [status, setStatus] = useState<Record<string, LineStatus>>(
    () => Object.fromEntries(result.lines.map((l) => [l.id, "adopt"])),
  );
  const [editing, setEditing] = useState<Set<string>>(new Set());
  const [confirms, setConfirms] = useState<Record<string, ConfirmClass>>(
    () => Object.fromEntries(result.confirmItems.map((c) => [c.id, "later"])),
  );
  const [internalAdopt, setInternalAdopt] = useState<Record<string, boolean>>(
    () => Object.fromEntries(result.internalCandidates.map((c) => [c.id, true])),
  );
  const [showTranscript, setShowTranscript] = useState(false);

  const setLine = (id: string, patch: Partial<AiLineCandidate>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const selectMatch = (id: string, matchId: string) => {
    const pi = findPriceItem(matchId);
    setLine(id, {
      matchItemId: matchId,
      matchConfidence: 100,
      unit: pi?.unit ?? "",
      unitPrice: pi?.unitPrice ?? 0,
      itemName: pi?.name ?? "",
    });
  };

  const toggleEdit = (id: string) =>
    setEditing((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const adoptedLines = lines.filter((l) => status[l.id] === "adopt");
  const adoptedTotal = adoptedLines.reduce(
    (sum, l) => sum + Math.round(l.quantity * l.unitPrice),
    0,
  );
  const canReflect = adoptedLines.some((l) => l.itemName.trim().length > 0);
  const unresolvedCount = adoptedLines.filter((l) => !l.matchItemId).length;

  const reflect = () => router.push(`/estimates/${estimateId}/edit`);

  return (
    <div>
      <FocusHeader
        title={result.titleSuggestion}
        subtitle="AI解析結果の確認"
        variant="back"
        trailing={<AiTag>AI候補</AiTag>}
      />

      <div className="mb-4 flex items-start gap-2 rounded-2xl border border-violet-200 bg-violet-50 p-3.5 text-sm text-violet-800">
        <Sparkles className="mt-0.5 shrink-0 text-base" />
        <p>
          AIの解析結果は<strong>候補</strong>です。内容を確認・修正してから見積に反映してください。
          表示金額は参考値で、最終金額は単価マスターとあなたの確認で決まります。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* 解析サマリー */}
          <section className="card p-4">
            <h2 className="mb-3 text-sm font-bold text-slate-700">解析サマリー</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
              <SummaryField label="顧客" value={customerName(result.customerId)} />
              <SummaryField label="現場住所" value={result.siteAddress} />
              <SummaryField label="入力元" value={SOURCE_LABEL[result.source]} />
              <SummaryField
                label="件名案"
                value={result.titleSuggestion}
                className="col-span-2 sm:col-span-1"
              />
              <SummaryField
                label="作業概要"
                value={result.workSummary}
                className="col-span-2 sm:col-span-3"
              />
            </dl>
          </section>

          {/* 明細候補 */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">
                見積明細候補（{adoptedLines.length}/{lines.length} 採用）
              </h2>
            </div>
            <div className="space-y-3">
              {lines.map((line) => (
                <CandidateCard
                  key={line.id}
                  line={line}
                  status={status[line.id]}
                  editing={editing.has(line.id)}
                  onAdopt={() =>
                    setStatus((s) => ({ ...s, [line.id]: "adopt" }))
                  }
                  onExclude={() =>
                    setStatus((s) => ({ ...s, [line.id]: "exclude" }))
                  }
                  onToggleEdit={() => toggleEdit(line.id)}
                  onChange={(patch) => setLine(line.id, patch)}
                  onSelectMatch={(mid) => selectMatch(line.id, mid)}
                />
              ))}
            </div>
          </section>

          {/* 業者指示事項候補（内部のみ） */}
          <section className="internal-surface p-4">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-amber-900">業者指示事項候補</h2>
              <InternalTag />
            </div>
            <p className="mb-3 text-xs text-amber-700">
              顧客には表示しない社内・協力業者向けメモです。採用したものだけ見積に取り込みます。
            </p>
            <div className="space-y-2">
              {result.internalCandidates.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-white/70 p-3 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={internalAdopt[c.id]}
                    onChange={(e) =>
                      setInternalAdopt((s) => ({
                        ...s,
                        [c.id]: e.target.checked,
                      }))
                    }
                    className="mt-0.5 h-4 w-4 accent-amber-600"
                  />
                  <span>{c.text}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 文字起こし原文 */}
          <section className="card overflow-hidden">
            <button
              onClick={() => setShowTranscript((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-slate-700"
            >
              文字起こし原文
              {showTranscript ? (
                <ChevronUp className="text-base text-slate-400" />
              ) : (
                <ChevronDown className="text-base text-slate-400" />
              )}
            </button>
            {showTranscript && (
              <p className="border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-600">
                {result.transcript}
              </p>
            )}
          </section>
        </div>

        {/* サイド：確認事項 + 反映 */}
        <aside className="space-y-4">
          <section className="card p-4">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-700">確認事項</h2>
              <ConfirmTag>{result.confirmItems.length}件</ConfirmTag>
            </div>
            <div className="space-y-3">
              {result.confirmItems.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-rose-100 bg-rose-50/50 p-3"
                >
                  <p className="text-sm text-slate-700">{c.text}</p>
                  <div className="mt-2 flex gap-1">
                    {(
                      [
                        ["confirmed", "確認済み"],
                        ["later", "後で確認"],
                        ["skip", "不要"],
                      ] as [ConfirmClass, string][]
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() =>
                          setConfirms((s) => ({ ...s, [c.id]: val }))
                        }
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                          confirms[c.id] === val
                            ? val === "confirmed"
                              ? "bg-emerald-600 text-white"
                              : val === "skip"
                                ? "bg-slate-400 text-white"
                                : "bg-rose-500 text-white"
                            : "bg-white text-slate-500 ring-1 ring-inset ring-slate-200"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4 lg:sticky lg:top-28">
            <h2 className="mb-2 text-sm font-bold text-slate-700">見積に反映</h2>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">採用する明細</dt>
                <dd className="num font-semibold text-slate-700">
                  {adoptedLines.length} 件
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">概算金額（税抜・参考）</dt>
                <dd className="num font-semibold text-slate-700">
                  {yen(adoptedTotal)}
                </dd>
              </div>
            </dl>
            {unresolvedCount > 0 && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-rose-600">
                <AlertTriangle className="mt-0.5 shrink-0 text-sm" />
                単価マスター未一致が {unresolvedCount} 件あります。手入力単価として反映されます。
              </p>
            )}
            <button
              onClick={reflect}
              disabled={!canReflect}
              className="btn-primary mt-3 hidden w-full disabled:cursor-not-allowed disabled:opacity-40 lg:flex"
            >
              <Check className="text-base" />
              見積に反映する
            </button>
            <button
              onClick={reflect}
              className="btn-ghost mt-1 hidden w-full text-sm text-slate-500 lg:flex"
            >
              下書きに保存（未確認のまま）
            </button>
          </section>
        </aside>
      </div>

      <MobileActionBar>
        <button onClick={reflect} className="btn-secondary flex-1">
          下書き保存
        </button>
        <button
          onClick={reflect}
          disabled={!canReflect}
          className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
        >
          見積に反映
        </button>
      </MobileActionBar>
    </div>
  );
}

function SummaryField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-700">{value}</dd>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  if (confidence <= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
        <AlertTriangle className="text-[11px]" />
        マスター未一致
      </span>
    );
  }
  const tone =
    confidence >= 90
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-amber-50 text-amber-800 ring-amber-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${tone}`}
    >
      一致度 {confidence}%
    </span>
  );
}

function CandidateCard({
  line,
  status,
  editing,
  onAdopt,
  onExclude,
  onToggleEdit,
  onChange,
  onSelectMatch,
}: {
  line: AiLineCandidate;
  status: LineStatus;
  editing: boolean;
  onAdopt: () => void;
  onExclude: () => void;
  onToggleEdit: () => void;
  onChange: (patch: Partial<AiLineCandidate>) => void;
  onSelectMatch: (matchId: string) => void;
}) {
  const excluded = status === "exclude";
  const noMatch = !line.matchItemId;
  const amount = Math.round(line.quantity * line.unitPrice);
  const hasAlt = line.altMatchIds.length > 1;

  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-card transition-opacity ${
        excluded ? "border-slate-200 opacity-50" : "border-slate-200"
      } ${noMatch && !excluded ? "ring-1 ring-rose-200" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              {line.location || "場所未設定"}
            </span>
            <span className="font-semibold text-slate-800">{line.itemName}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <ConfidenceBadge confidence={line.matchConfidence} />
            {line.quantityCompleted && (
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-600 ring-1 ring-inset ring-violet-200">
                数量を補完
              </span>
            )}
            {line.unitCompleted && (
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-600 ring-1 ring-inset ring-violet-200">
                単位を補完
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="num text-lg font-bold text-slate-800">{yen(amount)}</div>
          <div className="num text-xs text-slate-400">
            {line.quantity} {line.unit} × {yen(line.unitPrice)}
          </div>
        </div>
      </div>

      {/* 単価マスター候補選択 */}
      {hasAlt && (
        <div className="mt-3">
          <label className="text-xs font-medium text-slate-500">
            単価マスター候補
          </label>
          <select
            value={line.matchItemId ?? ""}
            onChange={(e) => onSelectMatch(e.target.value)}
            className="field-input mt-1 h-10 min-h-0 py-0 text-sm"
          >
            {line.altMatchIds.map((mid) => {
              const pi = priceItems.find((p) => p.id === mid);
              if (!pi) return null;
              return (
                <option key={mid} value={mid}>
                  {pi.name}（{yen(pi.unitPrice)}/{pi.unit}）
                </option>
              );
            })}
          </select>
        </div>
      )}

      {noMatch && !excluded && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-rose-600">
          <AlertTriangle className="mt-0.5 shrink-0 text-sm" />
          単価マスターに一致しません。単価を手入力してください。
        </p>
      )}

      {/* 編集フォーム */}
      {editing && !excluded && (
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-4">
          <EditField label="場所">
            <input
              value={line.location}
              onChange={(e) => onChange({ location: e.target.value })}
              className="cand-input"
            />
          </EditField>
          <EditField label="数量">
            <input
              type="number"
              value={line.quantity}
              onChange={(e) => onChange({ quantity: Number(e.target.value) })}
              className="cand-input text-right"
            />
          </EditField>
          <EditField label="単位">
            <input
              value={line.unit}
              onChange={(e) => onChange({ unit: e.target.value })}
              className="cand-input"
            />
          </EditField>
          <EditField label="単価">
            <input
              type="number"
              value={line.unitPrice}
              onChange={(e) => onChange({ unitPrice: Number(e.target.value) })}
              className="cand-input text-right"
            />
          </EditField>
          <div className="col-span-2 sm:col-span-4">
            <span className="mb-1 flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">
                顧客向け備考
              </span>
              <CustomerTag />
            </span>
            <input
              value={line.customerNote ?? ""}
              onChange={(e) => onChange({ customerNote: e.target.value })}
              placeholder="PDFに表示される備考"
              className="cand-input"
            />
          </div>
        </div>
      )}

      {/* 操作 */}
      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
        {excluded ? (
          <button
            onClick={onAdopt}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
          >
            除外を取り消す
          </button>
        ) : (
          <>
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-semibold text-emerald-700">
              <Check className="text-sm" />
              採用
            </span>
            <button
              onClick={onToggleEdit}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                editing
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
              }`}
            >
              <Pencil className="text-sm" />
              {editing ? "編集を閉じる" : "編集"}
            </button>
            <button
              onClick={onExclude}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-600 ring-1 ring-inset ring-rose-200 hover:bg-rose-50"
            >
              <X className="text-sm" />
              除外
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function EditField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
