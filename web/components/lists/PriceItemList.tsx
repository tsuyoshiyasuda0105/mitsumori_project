"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, Spreadsheet, TagIcon } from "@/components/icons";
import { EmptyState, PageHeader } from "@/components/ui";
import { yen } from "@/lib/format";
import { priceItems as mockPriceItems } from "@/lib/mock";
import type { PriceItem } from "@/lib/types";

type BackendMode = "checking" | "database" | "local";

interface PriceItemListResponse {
  data?: PriceItem[] | null;
  mode?: "database" | "local";
  error?: { code: string; message: string };
}

interface PriceItemSaveResponse {
  data?: PriceItem | null;
  mode?: "database" | "local";
  error?: { code: string; message: string };
}

export function PriceItemList() {
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [items, setItems] = useState<PriceItem[]>(mockPriceItems);
  const [active, setActive] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(mockPriceItems.map((p) => [p.id, p.isActive])),
  );
  const [backendMode, setBackendMode] = useState<BackendMode>("checking");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPriceItems() {
      try {
        const response = await fetch("/api/price-items", { cache: "no-store" });
        const payload = (await response.json()) as PriceItemListResponse;

        if (cancelled) return;
        if (!response.ok) {
          throw new Error(payload.error?.message ?? "単価マスターを取得できませんでした。");
        }
        if (payload.mode !== "database" || !payload.data) {
          setBackendMode("local");
          return;
        }

        setItems(payload.data);
        setActive(Object.fromEntries(payload.data.map((p) => [p.id, p.isActive])));
        setBackendMode("database");
        setSyncError(null);
      } catch (error) {
        if (cancelled) return;
        setBackendMode("local");
        setSyncError(
          error instanceof Error
            ? error.message
            : "単価マスターのDB接続を確認できませんでした。",
        );
      }
    }

    loadPriceItems();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return items.filter((p) => {
      if (onlyActive && !active[p.id]) return false;
      if (!kw) return true;
      return p.name.toLowerCase().includes(kw);
    });
  }, [q, onlyActive, active, items]);

  const toggle = async (id: string) => {
    const nextActive = !active[id];
    setActive((s) => ({ ...s, [id]: nextActive }));

    if (backendMode !== "database") return;

    setSavingId(id);
    setSyncError(null);
    try {
      const response = await fetch("/api/price-items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id, isActive: nextActive }),
      });
      const payload = (await response.json()) as PriceItemSaveResponse;
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "単価マスターを更新できませんでした。");
      }
      if (payload.mode === "database" && payload.data) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...payload.data } : item)),
        );
        setActive((s) => ({ ...s, [id]: payload.data!.isActive }));
      }
    } catch (error) {
      setActive((s) => ({ ...s, [id]: !nextActive }));
      setSyncError(
        error instanceof Error
          ? error.message
          : "単価マスターの更新に失敗しました。",
      );
    } finally {
      setSavingId(null);
    }
  };

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

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>
            保存先:{" "}
            <strong className="text-slate-800">
              {backendMode === "database"
                ? "データベース"
                : backendMode === "local"
                  ? "デモ用マスター"
                  : "確認中"}
            </strong>
          </span>
          <span className="text-xs text-slate-400">
            {items.length} 件の単価を読み込み済み
          </span>
        </div>
        {syncError && (
          <p className="mt-2 text-xs text-amber-700">
            DB接続前のため、画面上はデモ用マスターで動作しています。{syncError}
          </p>
        )}
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
                      <ActiveToggle
                        on={active[p.id]}
                        saving={savingId === p.id}
                        onClick={() => toggle(p.id)}
                      />
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
                <ActiveToggle
                  on={active[p.id]}
                  saving={savingId === p.id}
                  onClick={() => toggle(p.id)}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ActiveToggle({
  on,
  saving,
  onClick,
}: {
  on: boolean;
  saving: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      role="switch"
      aria-checked={on}
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        on
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
          : "bg-slate-100 text-slate-400 ring-1 ring-inset ring-slate-200"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${on ? "bg-emerald-500" : "bg-slate-300"}`}
      />
      {saving ? "保存中" : on ? "有効" : "無効"}
    </button>
  );
}
