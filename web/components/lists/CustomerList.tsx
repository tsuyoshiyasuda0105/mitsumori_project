"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FileText, Search, Users } from "@/components/icons";
import { EmptyState, PageHeader } from "@/components/ui";
import { useCustomerStore } from "@/lib/customer-store";
import { useEstimateStore } from "@/lib/estimate-store";

export function CustomerList() {
  const [q, setQ] = useState("");
  const { customers, backendMode, syncError } = useCustomerStore();
  const { estimates } = useEstimateStore();

  const rows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return customers;
    return customers.filter((c) =>
      [c.name, c.nameKana, c.address, c.phone, c.contactName]
        .join(" ")
        .toLowerCase()
        .includes(kw),
    );
  }, [q, customers]);

  const countFor = (id: string) =>
    estimates.filter((e) => e.customerId === id).length;

  return (
    <div>
      <PageHeader
        className="mb-4"
        icon={<Users className="text-xl" />}
        title="顧客一覧"
        description="顧客情報と見積履歴を管理します。"
      />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="顧客名・住所・電話番号・担当者で検索"
          className="field-input pl-10"
        />
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>
            保存先:{" "}
            <strong className="text-slate-800">
              {backendMode === "database"
                ? "データベース"
                : backendMode === "local"
                  ? "デモ用顧客"
                  : "確認中"}
            </strong>
          </span>
          <span className="text-xs text-slate-400">
            {customers.length} 件の顧客を読み込み済み
          </span>
        </div>
        {syncError && (
          <p className="mt-2 text-xs text-amber-700">
            DB接続前のため、画面上はデモ用顧客で動作しています。{syncError}
          </p>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="該当する顧客がありません"
          description="検索条件を変更してください。"
        />
      ) : (
        <>
          {/* PC: テーブル */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">顧客名</th>
                  <th className="px-4 py-3">住所</th>
                  <th className="px-4 py-3">電話番号</th>
                  <th className="px-4 py-3">担当者</th>
                  <th className="px-4 py-3 text-center">見積数</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-brand-50/40"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{c.name}</div>
                      <div className="text-xs text-slate-400">{c.nameKana}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.address}</td>
                    <td className="num px-4 py-3 text-slate-600">{c.phone}</td>
                    <td className="px-4 py-3 text-slate-600">{c.contactName}</td>
                    <td className="num px-4 py-3 text-center text-slate-600">
                      {countFor(c.id)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href="/estimates/new/edit"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
                      >
                        <FileText className="text-sm" />
                        見積作成
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* モバイル: カード */}
          <div className="space-y-3 lg:hidden">
            {rows.map((c) => (
              <div key={c.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.nameKana}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                    見積 {countFor(c.id)}
                  </span>
                </div>
                <dl className="mt-2 space-y-0.5 text-xs text-slate-500">
                  <div className="flex gap-1.5">
                    <dt className="text-slate-400">住所</dt>
                    <dd>{c.address}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-slate-400">電話</dt>
                    <dd className="num">{c.phone}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-slate-400">担当</dt>
                    <dd>{c.contactName}</dd>
                  </div>
                </dl>
                <Link
                  href="/estimates/new/edit"
                  className="btn-secondary mt-3 w-full"
                >
                  <FileText className="text-base" />
                  この顧客で見積作成
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
