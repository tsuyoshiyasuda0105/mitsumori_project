"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FocusHeader } from "@/components/FocusHeader";
import { MobileActionBar } from "@/components/MobileActionBar";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  Mic,
  Plus,
  Sparkles,
  Trash,
} from "@/components/icons";
import {
  AiTag,
  ConfirmTag,
  CustomerTag,
  EmptyState,
  InternalTag,
  StatusBadge,
} from "@/components/ui";
import { computeTotals, lineAmount, TAX_RATE } from "@/lib/calc";
import { useEstimateStore } from "@/lib/estimate-store";
import { fmtDate, yen } from "@/lib/format";
import { customers, priceItems } from "@/lib/mock";
import type {
  Estimate,
  EstimateLine,
  EstimateStatus,
  LineType,
} from "@/lib/types";
import { LINE_TYPE_LABEL, STATUS_LABEL } from "@/lib/types";

let tmpSeq = 0;
function newLine(type: LineType, lineNo: number): EstimateLine {
  tmpSeq += 1;
  return {
    id: `tmp-${Date.now()}-${tmpSeq}`,
    lineNo,
    location: "",
    itemName: type === "discount" ? "値引き" : type === "expense" ? "諸経費" : "",
    quantity: 1,
    unit: type === "normal" ? "" : "式",
    unitPrice: 0,
    lineType: type,
  };
}

function patchFromPriceItemName(name: string): Partial<EstimateLine> {
  const item = priceItems.find((candidate) => candidate.name === name);
  if (!item) return { itemName: name, priceItemId: undefined };
  return {
    priceItemId: item.id,
    itemName: item.name,
    unit: item.unit,
    unitPrice: item.unitPrice,
  };
}
export function EstimateEditor({
  initial,
  isNew,
}: {
  initial: Estimate;
  isNew: boolean;
}) {
  const router = useRouter();
  const { ready, getEstimate, saveEstimate } = useEstimateStore();
  const [currentId, setCurrentId] = useState(initial.id);
  const [estimateNo, setEstimateNo] = useState(initial.estimateNo);
  const [localIsNew, setLocalIsNew] = useState(isNew);
  const [customerId, setCustomerId] = useState(initial.customerId ?? "");
  const [title, setTitle] = useState(initial.title);
  const [estimateDate, setEstimateDate] = useState(initial.estimateDate);
  const [expiresOn, setExpiresOn] = useState(initial.expiresOn);
  const [assignee, setAssignee] = useState(initial.assignee);
  const [status, setStatus] = useState<EstimateStatus>(initial.status);
  const [lines, setLines] = useState<EstimateLine[]>(initial.lines);
  const [customerNote, setCustomerNote] = useState(initial.customerNote);
  const [internalInstruction, setInternalInstruction] = useState(
    initial.internalInstruction,
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [savedAt, setSavedAt] = useState<string | null>(
    isNew ? null : "保存済み",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const applyEstimate = (estimate: Estimate) => {
    setCurrentId(estimate.id);
    setEstimateNo(estimate.estimateNo);
    setCustomerId(estimate.customerId ?? "");
    setTitle(estimate.title);
    setEstimateDate(estimate.estimateDate);
    setExpiresOn(estimate.expiresOn);
    setAssignee(estimate.assignee);
    setStatus(estimate.status);
    setLines(estimate.lines);
    setCustomerNote(estimate.customerNote);
    setInternalInstruction(estimate.internalInstruction);
  };

  useEffect(() => {
    if (!ready) return;
    const stored = getEstimate(initial.id);
    if (!stored) return;
    applyEstimate(stored);
    setLocalIsNew(false);
    setSavedAt("保存済み");
  }, [ready, getEstimate, initial.id]);

  const renumber = (arr: EstimateLine[]) =>
    arr.map((l, i) => ({ ...l, lineNo: i + 1 }));

  const updateLine = (id: string, patch: Partial<EstimateLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    setSavedAt(null);
  };
  const addLine = (type: LineType) => {
    setLines((prev) => renumber([...prev, newLine(type, prev.length + 1)]));
    setSavedAt(null);
  };
  const removeLine = (id: string) => {
    setLines((prev) => renumber(prev.filter((l) => l.id !== id)));
    setSavedAt(null);
  };
  const moveLine = (index: number, dir: -1 | 1) => {
    setLines((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return renumber(next);
    });
    setSavedAt(null);
  };
  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const totals = useMemo(() => computeTotals(lines), [lines]);
  const breakdown = useMemo(() => {
    const sumOf = (t: LineType) =>
      lines
        .filter((l) => l.lineType === t)
        .reduce((s, l) => s + lineAmount(l), 0);
    return {
      normal: sumOf("normal"),
      discount: sumOf("discount"),
      expense: sumOf("expense"),
    };
  }, [lines]);

  const buildCurrentEstimate = (): Estimate => ({
    ...initial,
    id: currentId,
    estimateNo,
    customerId: customerId || undefined,
    title,
    estimateDate,
    expiresOn,
    status,
    assignee,
    lines,
    customerNote,
    internalInstruction,
  });

  const save = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const saved = await saveEstimate(buildCurrentEstimate());
      setCurrentId(saved.id);
      setEstimateNo(saved.estimateNo);
      setLocalIsNew(false);
      setSavedAt(
        `保存済み ${new Date(saved.updatedAt).toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      );
      if (saved.id !== currentId) router.replace(`/estimates/${saved.id}/edit`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "見積を保存できませんでした。");
    } finally {
      setIsSaving(false);
    }
  };

  const noCustomer = !customerId;

  return (
    <div>
      <datalist id="price-item-options">
        {priceItems.map((item) => (
          <option key={item.id} value={item.name} label={`${yen(item.unitPrice)} / ${item.unit}`} />
        ))}
      </datalist>
      <FocusHeader
        icon={<FileText className="text-lg" />}
        title={localIsNew ? "新規見積" : "見積編集"}
        subtitle={
          <span className="flex items-center gap-1.5">
            {estimateNo}
            <span className="text-slate-300">·</span>
            {savedAt ? (
              <span className="text-emerald-600">{savedAt}</span>
            ) : (
              <span className="text-amber-600">● 未保存</span>
            )}
          </span>
        }
        trailing={<StatusBadge status={status} />}
      />

      {saveError && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {saveError}
        </div>
      )}
      {localIsNew && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <Sparkles className="mt-0.5 shrink-0 text-base" />
          <p>
            まず顧客と件名を選び、
            <span className="font-bold">「明細をボイス入力」</span>
            で現場の内容を話してください。AIが明細の下書きを作成します。
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* メイン */}
        <div className="space-y-4 lg:col-span-2">
          {/* 基本情報 */}
          <section className="card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-700">基本情報</h2>
              <Link
                href="./meeting"
                className="btn-secondary h-9 min-h-0 gap-1.5 px-3 text-xs"
              >
                <Mic className="text-base" /> 打ち合わせ録音
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label">顧客</label>
                <select
                  className={`field-input ${noCustomer ? "border-amber-300 text-amber-700" : ""}`}
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    setSavedAt(null);
                  }}
                >
                  <option value="">（顧客未選択）</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">件名</label>
                <input
                  className="field-input"
                  placeholder="例: 外壁塗装工事"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setSavedAt(null);
                  }}
                />
              </div>
              <div>
                <label className="field-label">見積日</label>
                <input
                  type="date"
                  className="field-input"
                  value={estimateDate}
                  onChange={(e) => {
                    setEstimateDate(e.target.value);
                    setSavedAt(null);
                  }}
                />
              </div>
              <div>
                <label className="field-label">有効期限</label>
                <input
                  type="date"
                  className="field-input"
                  value={expiresOn}
                  onChange={(e) => {
                    setExpiresOn(e.target.value);
                    setSavedAt(null);
                  }}
                />
              </div>
              <div>
                <label className="field-label">担当者</label>
                <input
                  className="field-input"
                  value={assignee}
                  onChange={(e) => {
                    setAssignee(e.target.value);
                    setSavedAt(null);
                  }}
                />
              </div>
              <div>
                <label className="field-label">ステータス</label>
                <select
                  className="field-input"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as EstimateStatus);
                    setSavedAt(null);
                  }}
                >
                  {(Object.keys(STATUS_LABEL) as EstimateStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* 入力アクション */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link href="./voice" className="btn-primary">
              <Mic className="text-lg" /> 明細をボイス入力
            </Link>
            <button className="btn-secondary" onClick={() => addLine("normal")}>
              <Plus className="text-lg" /> 手入力で明細追加
            </button>
          </div>

          {/* 明細 */}
          <section className="card overflow-hidden">
            <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-bold text-slate-700">
                明細 <span className="num text-slate-400">({lines.length})</span>
              </h2>
              <div className="flex gap-1">
                <button
                  className="btn-ghost h-9 min-h-0 px-2.5 text-xs"
                  onClick={() => addLine("discount")}
                >
                  ＋値引き
                </button>
                <button
                  className="btn-ghost h-9 min-h-0 px-2.5 text-xs"
                  onClick={() => addLine("expense")}
                >
                  ＋諸経費
                </button>
              </div>
            </header>

            {lines.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={<Mic />}
                  title="まだ明細がありません"
                  description="「明細をボイス入力」で話すか、手入力で追加できます。"
                />
              </div>
            ) : (
              <>
                {/* PCテーブル */}
                <div className="hidden lg:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                        <th className="w-8 px-2 py-2"></th>
                        <th className="w-8 px-1 py-2 text-center">No</th>
                        <th className="px-2 py-2">場所</th>
                        <th className="px-2 py-2">品目</th>
                        <th className="w-20 px-2 py-2 text-right">数量</th>
                        <th className="w-16 px-2 py-2">単位</th>
                        <th className="w-28 px-2 py-2 text-right">単価</th>
                        <th className="w-28 px-2 py-2 text-right">金額</th>
                        <th className="w-10 px-1 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, idx) => (
                        <LineTableRow
                          key={line.id}
                          line={line}
                          index={idx}
                          last={idx === lines.length - 1}
                          expanded={expanded.has(line.id)}
                          onToggle={() => toggleExpand(line.id)}
                          onChange={(p) => updateLine(line.id, p)}
                          onMove={(d) => moveLine(idx, d)}
                          onRemove={() => removeLine(line.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* モバイルカード */}
                <div className="space-y-3 p-3 lg:hidden">
                  {lines.map((line, idx) => (
                    <LineCard
                      key={line.id}
                      line={line}
                      index={idx}
                      total={lines.length}
                      onChange={(p) => updateLine(line.id, p)}
                      onMove={(d) => moveLine(idx, d)}
                      onRemove={() => removeLine(line.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </section>

          {/* 顧客向け備考 */}
          <section className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">顧客向け備考</h2>
              <CustomerTag />
            </div>
            <textarea
              className="field-input min-h-[88px] resize-y py-2"
              placeholder="顧客向けの注記。見積書PDFに表示されます。"
              value={customerNote}
              onChange={(e) => {
                setCustomerNote(e.target.value);
                setSavedAt(null);
              }}
            />
          </section>

          {/* 業者指示事項（内部用） */}
          <section className="internal-surface p-4">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-amber-900">
                業者指示事項
              </h2>
              <InternalTag />
            </div>
            <p className="mb-2 text-xs text-amber-700">
              この内容は顧客向けPDFには表示されません。社内確認用・業者指示用Excelには出力できます。
            </p>
            <textarea
              className="min-h-[88px] w-full resize-y rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-amber-400/70 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="社内・協力業者向けの指示。搬入経路、養生範囲、安全注意など。"
              value={internalInstruction}
              onChange={(e) => {
                setInternalInstruction(e.target.value);
                setSavedAt(null);
              }}
            />
          </section>
        </div>

        {/* 右パネル */}
        <aside className="space-y-4">
          {/* 集計 */}
          <section className="card p-4 lg:sticky lg:top-28">
            <h2 className="mb-3 text-sm font-bold text-slate-700">集計</h2>
            <dl className="space-y-2 text-sm">
              <Row label="小計（明細）" value={yen(breakdown.normal)} />
              {breakdown.discount !== 0 && (
                <Row label="値引き" value={yen(breakdown.discount)} tone="rose" />
              )}
              {breakdown.expense !== 0 && (
                <Row label="諸経費" value={yen(breakdown.expense)} />
              )}
              <Row
                label={`消費税（${Math.round(TAX_RATE * 100)}%）`}
                value={yen(totals.tax)}
              />
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3">
                <dt className="text-sm font-bold text-slate-700">合計</dt>
                <dd className="num text-xl font-bold text-brand-700">
                  {yen(totals.total)}
                </dd>
              </div>
            </dl>
          </section>

          {/* 確認事項 */}
          <ConfirmCard hasUnconfirmed={!!initial.hasUnconfirmedAi} />

          {/* 出力 */}
          <section className="card p-4">
            <h2 className="mb-2 text-sm font-bold text-slate-700">出力</h2>
            <div className="mb-3 flex items-start gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800">
              <CustomerTag>PDF</CustomerTag>
              <span>顧客提出用PDFに業者指示事項は出力されません。</span>
            </div>
            <div className="hidden gap-2 lg:flex lg:flex-col">
              <Link href="./export" className="btn-primary w-full">
                出力設定へ
              </Link>
              <button className="btn-secondary w-full" onClick={save} disabled={isSaving}>
                {isSaving ? "保存中..." : "下書き保存"}
              </button>
            </div>
          </section>
        </aside>
      </div>

      {/* モバイル下部固定 */}
      <MobileActionBar>
        <button className="btn-secondary flex-1" onClick={save} disabled={isSaving}>
          {isSaving ? "保存中..." : "下書き保存"}
        </button>
        <Link href="./export" className="btn-primary flex-[2]">
          出力設定へ
        </Link>
      </MobileActionBar>
    </div>
  );
}

function Row({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string;
  tone?: "slate" | "rose";
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={`num font-semibold ${tone === "rose" ? "text-rose-600" : "text-slate-800"}`}
      >
        {value}
      </dd>
    </div>
  );
}

function ConfirmCard({ hasUnconfirmed }: { hasUnconfirmed: boolean }) {
  const items = hasUnconfirmed
    ? ["塗料グレードが未指定です", "下地補修の有無を確認", "駐車場所を確認"]
    : [];
  return (
    <section className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700">確認事項</h2>
        {items.length > 0 && <AiTag>AI抽出</AiTag>}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">未確認の項目はありません。</p>
      ) : (
        <ul className="space-y-2">
          {items.map((t) => (
            <li key={t} className="flex items-center gap-2 text-sm text-slate-700">
              <ConfirmTag>要</ConfirmTag>
              {t}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ── PC: テーブル行（+展開行で備考・指示） ── */
function LineTableRow({
  line,
  index,
  last,
  expanded,
  onToggle,
  onChange,
  onMove,
  onRemove,
}: {
  line: EstimateLine;
  index: number;
  last: boolean;
  expanded: boolean;
  onToggle: () => void;
  onChange: (p: Partial<EstimateLine>) => void;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
}) {
  const cell =
    "w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm hover:border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500/30";
  const special = line.lineType !== "normal";
  const hasInternal = !!line.internalInstruction;
  return (
    <>
      <tr className={`align-top ${special ? "bg-slate-50/60" : ""}`}>
        <td className="px-1 py-1.5">
          <div className="flex flex-col">
            <button
              className="text-slate-300 hover:text-brand-600 disabled:opacity-30"
              onClick={() => onMove(-1)}
              disabled={index === 0}
              aria-label="上へ"
            >
              <ChevronUp className="text-base" />
            </button>
            <button
              className="text-slate-300 hover:text-brand-600 disabled:opacity-30"
              onClick={() => onMove(1)}
              disabled={last}
              aria-label="下へ"
            >
              <ChevronDown className="text-base" />
            </button>
          </div>
        </td>
        <td className="px-1 py-2 text-center text-xs text-slate-400">
          {line.lineNo}
        </td>
        <td className="px-1 py-1.5">
          {special ? (
            <span className="tag bg-slate-200 text-slate-600">
              {LINE_TYPE_LABEL[line.lineType]}
            </span>
          ) : (
            <input
              className={cell}
              value={line.location}
              placeholder="場所"
              onChange={(e) => onChange({ location: e.target.value })}
            />
          )}
        </td>
        <td className="px-1 py-1.5">
          <input
            className={cell + " font-medium"}
            value={line.itemName}
            list="price-item-options"
            placeholder="品目"
            onChange={(e) => onChange(patchFromPriceItemName(e.target.value))}
          />
        </td>
        <td className="px-1 py-1.5">
          <input
            className={cell + " num text-right"}
            inputMode="decimal"
            value={line.quantity}
            onChange={(e) =>
              onChange({ quantity: Number(e.target.value) || 0 })
            }
          />
        </td>
        <td className="px-1 py-1.5">
          <input
            className={cell}
            value={line.unit}
            placeholder="単位"
            onChange={(e) => onChange({ unit: e.target.value })}
          />
        </td>
        <td className="px-1 py-1.5">
          <input
            className={cell + " num text-right"}
            inputMode="decimal"
            value={line.unitPrice}
            onChange={(e) =>
              onChange({ unitPrice: Number(e.target.value) || 0 })
            }
          />
        </td>
        <td className="num px-2 py-2 text-right font-semibold text-slate-800">
          {yen(lineAmount(line))}
        </td>
        <td className="px-1 py-1.5">
          <div className="flex items-center">
            <button
              className={`relative rounded p-1 hover:bg-slate-100 ${hasInternal || expanded ? "text-amber-600" : "text-slate-300"}`}
              onClick={onToggle}
              aria-label="備考・指示を編集"
              title="備考・業者指示事項"
            >
              {expanded ? (
                <ChevronUp className="text-base" />
              ) : (
                <ChevronDown className="text-base" />
              )}
              {hasInternal && !expanded && (
                <span className="absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-amber-500" />
              )}
            </button>
            <button
              className="rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
              onClick={onRemove}
              aria-label="削除"
            >
              <Trash className="text-base" />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={9} className="px-3 pb-3">
            <div className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
              <div>
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-500">
                    顧客向け備考
                  </span>
                  <CustomerTag />
                </div>
                <input
                  className="field-input"
                  value={line.customerNote ?? ""}
                  placeholder="PDFに表示される明細備考"
                  onChange={(e) => onChange({ customerNote: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="text-xs font-medium text-amber-800">
                    業者指示事項
                  </span>
                  <InternalTag />
                </div>
                <input
                  className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  value={line.internalInstruction ?? ""}
                  placeholder="この明細の社内・業者向け指示"
                  onChange={(e) =>
                    onChange({ internalInstruction: e.target.value })
                  }
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── モバイル: カード ── */
function LineCard({
  line,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  line: EstimateLine;
  index: number;
  total: number;
  onChange: (p: Partial<EstimateLine>) => void;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
}) {
  const special = line.lineType !== "normal";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="num text-xs font-bold text-slate-400">
          No.{line.lineNo}
          {special && (
            <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-slate-600">
              {LINE_TYPE_LABEL[line.lineType]}
            </span>
          )}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 disabled:opacity-30"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="上へ"
          >
            <ChevronUp className="text-base" />
          </button>
          <button
            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 disabled:opacity-30"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label="下へ"
          >
            <ChevronDown className="text-base" />
          </button>
          <button
            className="rounded-lg border border-slate-200 p-1.5 text-slate-400"
            onClick={onRemove}
            aria-label="削除"
          >
            <Trash className="text-base" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {!special && (
          <div className="col-span-2">
            <label className="field-label">場所</label>
            <input
              className="field-input"
              value={line.location}
              placeholder="例: 外壁 / 2階 / 玄関"
              onChange={(e) => onChange({ location: e.target.value })}
            />
          </div>
        )}
        <div className="col-span-2">
          <label className="field-label">品目</label>
          <input
            className="field-input font-medium"
            value={line.itemName}
            list="price-item-options"
            onChange={(e) => onChange(patchFromPriceItemName(e.target.value))}
          />
        </div>
        <div>
          <label className="field-label">数量</label>
          <input
            className="field-input num text-right"
            inputMode="decimal"
            value={line.quantity}
            onChange={(e) => onChange({ quantity: Number(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="field-label">単位</label>
          <input
            className="field-input"
            value={line.unit}
            onChange={(e) => onChange({ unit: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">単価</label>
          <input
            className="field-input num text-right"
            inputMode="decimal"
            value={line.unitPrice}
            onChange={(e) => onChange({ unitPrice: Number(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="field-label">金額</label>
          <div className="num flex min-h-[44px] items-center justify-end rounded-xl bg-slate-50 px-3 text-sm font-bold text-slate-800">
            {yen(lineAmount(line))}
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-2">
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500">顧客向け備考</span>
            <CustomerTag />
          </div>
          <input
            className="field-input"
            value={line.customerNote ?? ""}
            placeholder="PDFに表示"
            onChange={(e) => onChange({ customerNote: e.target.value })}
          />
        </div>
        <div className="internal-surface p-2">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="text-xs font-medium text-amber-800">業者指示事項</span>
            <InternalTag />
          </div>
          <input
            className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            value={line.internalInstruction ?? ""}
            placeholder="PDF非表示の社内・業者向け指示"
            onChange={(e) => onChange({ internalInstruction: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
