"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Spreadsheet, TagIcon } from "@/components/icons";
import { EmptyState, PageHeader } from "@/components/ui";
import { yen } from "@/lib/format";
import { priceItems } from "@/lib/mock";

export function PriceItemList() {
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [active, setActive] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(priceItems.map((p) => [p.id, p.isActive])),
  );

  const rows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return priceItems.filter((p) => {
      if (onlyActive && !active[p.id]) return false;
      if (!kw) return true;
      return p.name.toLowerCase().includes(kw);
    });
  }, [q, onlyActive, active]);

  const toggle = (id: string) =>
    setActive((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div>
      <PageHeader
        className="mb-4"
        icon={<TagIcon className="text-xl" />}
        title="単価マスター"
        description="見積に使う品目と単価を管理します。"
        actions={
          <Link href="/import" className="btn-secondary">
            <Spreadsheet className="text-base" />
            <span className="hidden sm:inline">Excel取込</span>
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="品目名で検索"
            className="field-input pl-10"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(e) => setOnlyActive(e.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          有効のみ表示
        </label>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<TagIcon />}
          title="該当する品目がありません"
          description="検索条件を変更するか、Excelから取り込んでください。"
        />
      ) : (
        <>
          {/* PC: テーブル */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">品目名</th>
                  <th className="px-4 py-3">単位</th>
                  <th className="px-4 py-3 text-right">単価</th>
                  <th className="px-4 py-3 text-center">状態</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {p.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.unit}</td>
                    <td className="num px-4 py-3 text-right font-semibold text-slate-800">
                      {yen(p.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ActiveToggle on={active[p.id]} onClick={() => toggle(p.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* モバイル: カード */}
          <div className="space-y-2 lg:hidden">
            {rows.map((p) => (
              <div
                key={p.id}
                className="card flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800">{p.name}</div>
                  <div className="num mt-0.5 text-xs text-slate-500">
                    {yen(p.unitPrice)} / {p.unit}
                  </div>
                </div>
                <ActiveToggle on={active[p.id]} onClick={() => toggle(p.id)} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ActiveToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
        on
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
          : "bg-slate-100 text-slate-400 ring-1 ring-inset ring-slate-200"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${on ? "bg-emerald-500" : "bg-slate-300"}`}
      />
      {on ? "有効" : "無効"}
    </button>
  );
}
