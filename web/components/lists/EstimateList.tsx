"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EstimateCard } from "@/components/EstimateCard";
import { FileText, Plus, Search } from "@/components/icons";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { computeTotals } from "@/lib/calc";
import { fmtDate, yen } from "@/lib/format";
import { customerName, estimates } from "@/lib/mock";
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
  }, [q, filter]);

  return (
    <div>
      <PageHeader
        className="mb-4"
        icon={<FileText className="text-xl" />}
        title="見積一覧"
        description="作成中・提出済みの見積をまとめて管理します。"
        actions={
          <Link href="/estimates/new/edit" className="btn-primary">
            <Plus className="text-base" />
            <span className="hidden sm:inline">新規見積</span>
          </Link>
        }
      />

      {/* 検索・絞り込み */}
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
          {/* PC: テーブル */}
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
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => {
                  const total = e.lines.length
                    ? computeTotals(e.lines).total
                    : null;
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* モバイル: カード */}
          <div className="space-y-3 lg:hidden">
            {rows.map((e) => (
              <EstimateCard key={e.id} estimate={e} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
