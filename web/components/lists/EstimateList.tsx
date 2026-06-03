"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EstimateCard } from "@/components/EstimateCard";
import { FileText, Plus, Search, Trash } from "@/components/icons";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { computeTotals } from "@/lib/calc";
import { useEstimateStore } from "@/lib/estimate-store";
import { fmtDate, yen } from "@/lib/format";
import { customerName } from "@/lib/mock";
import { type EstimateStatus, STATUS_LABEL } from "@/lib/types";

type Filter = "all" | EstimateStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "draft", label: STATUS_LABEL.draft },
  { id: "submitted", label: STATUS_LABEL.submitted },
  { id: "won", label: STATUS_LABEL.won },
  { id: "lost", label: STATUS_LABEL.lost },
];

export function EstimateList() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { ready, backendMode, syncError, estimates, savedEstimates, localSavedEstimates, deleteEstimate, resetSavedEstimates } = useEstimateStore();

  const savedEstimateIds = useMemo(
    () => new Set(savedEstimates.map((estimate) => estimate.id)),
    [savedEstimates],
  );

  const rows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return estimates.filter((e) => {
      if (filter !== "all" && e.status !== filter) return false;
      if (!kw) return true;
      return (
        e.title.toLowerCase().includes(kw) ||
        e.estimateNo.toLowerCase().includes(kw) ||
        customerName(e.customerId).toLowerCase().includes(kw)
      );
    });
  }, [q, filter, estimates]);

  const removeEstimate = async (estimateId: string, title: string) => {
    if (!window.confirm(`${title || "この見積"} を削除しますか？`)) return;

    setDeletingId(estimateId);
    setActionError(null);
    try {
      await deleteEstimate(estimateId);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "見積を削除できませんでした。");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        className="mb-4"
        icon={<FileText className="text-xl" />}
        title="見積一覧"
        description="作成中・提出済みの見積をまとめて管理します。DB設定後は本番データとして保存されます。"
        actions={
          <Link href="/estimates/new/edit" className="btn-primary">
            <Plus className="text-base" />
            <span className="hidden sm:inline">新規見積</span>
          </Link>
        }
      />

      {actionError && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <span className="font-bold">保存機能:</span>
        <span>
          {!ready || backendMode === "checking"
            ? "保存先を確認中..."
            : backendMode === "database"
              ? `Neon DBに ${savedEstimates.length} 件保存済み`
              : `このブラウザに ${savedEstimates.length} 件保存済み`}
        </span>
        {syncError && <span className="text-xs text-amber-700">DB未接続: {syncError}</span>}
        {backendMode !== "database" && localSavedEstimates.length > 0 && (
          <button
            type="button"
            onClick={resetSavedEstimates}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
          >
            <Trash className="text-sm" />
            保存デモをリセット
          </button>
        )}
      </div>

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="顧客名・件名・見積番号で検索"
            className="field-input pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                filter === f.id
                  ? "bg-brand-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="該当する見積がありません"
          description="検索条件や絞り込みを変更してください。"
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">見積番号</th>
                  <th className="px-4 py-3">顧客名</th>
                  <th className="px-4 py-3">件名</th>
                  <th className="px-4 py-3 text-right">合計金額</th>
                  <th className="px-4 py-3">ステータス</th>
                  <th className="px-4 py-3">見積日</th>
                  <th className="px-4 py-3">担当者</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => {
                  const total = e.lines.length ? computeTotals(e.lines).total : null;
                  return (
                    <tr
                      key={e.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-brand-50/40"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/estimates/${e.id}/edit`}
                          className="font-medium text-brand-700 hover:underline"
                        >
                          {e.estimateNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {customerName(e.customerId)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{e.title}</td>
                      <td className="num px-4 py-3 text-right font-semibold text-slate-800">
                        {total === null ? "—" : yen(total)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={e.status} />
                      </td>
                      <td className="num px-4 py-3 text-slate-500">
                        {fmtDate(e.estimateDate)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{e.assignee}</td>
                      <td className="px-4 py-3 text-right">
                        {savedEstimateIds.has(e.id) ? (
                          <button
                            type="button"
                            onClick={() => removeEstimate(e.id, e.title)}
                            disabled={deletingId === e.id}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
                          >
                            <Trash className="text-sm" />
                            削除
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-slate-300">デモ</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 lg:hidden">
            {rows.map((e) => (
              <div key={e.id} className="space-y-2">
                <EstimateCard estimate={e} />
                {savedEstimateIds.has(e.id) && (
                  <button
                    type="button"
                    onClick={() => removeEstimate(e.id, e.title)}
                    disabled={deletingId === e.id}
                    className="btn-secondary w-full text-rose-700 disabled:opacity-50"
                  >
                    <Trash className="text-base" />
                    削除
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
