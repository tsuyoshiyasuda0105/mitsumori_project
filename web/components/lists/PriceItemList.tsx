"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Spreadsheet, TagIcon, Trash, X } from "@/components/icons";
import { EmptyState, PageHeader } from "@/components/ui";
import { yen } from "@/lib/format";
import { priceItems as mockPriceItems } from "@/lib/mock";
import type { PriceItem } from "@/lib/types";

type BackendMode = "checking" | "database" | "local";
type PriceItemDraft = Partial<Omit<PriceItem, "id">> & { id?: string };

const EMPTY_FORM: PriceItemDraft = {
  name: "",
  unit: "式",
  unitPrice: 0,
  isActive: true,
};

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

interface PriceItemDeleteResponse {
  data?: { id: string } | null;
  mode?: "database" | "local";
  error?: { code: string; message: string };
}

function sortItems(items: PriceItem[]): PriceItem[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

function replaceItem(items: PriceItem[], saved: PriceItem): PriceItem[] {
  return sortItems([saved, ...items.filter((item) => item.id !== saved.id)]);
}

function normalizeLocalItem(draft: PriceItemDraft): PriceItem {
  return {
    id: draft.id?.trim() || `local-price-${Date.now()}`,
    name: draft.name?.trim() || "未設定の品目",
    unit: draft.unit?.trim() || "式",
    unitPrice: Number.isFinite(Number(draft.unitPrice)) ? Number(draft.unitPrice) : 0,
    isActive: draft.isActive ?? true,
  };
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
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<PriceItemDraft>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const isActiveFor = (item: PriceItem) => active[item.id] ?? item.isActive;

  const rows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return items.filter((p) => {
      if (onlyActive && !(active[p.id] ?? p.isActive)) return false;
      if (!kw) return true;
      return p.name.toLowerCase().includes(kw);
    });
  }, [q, onlyActive, active, items]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (item: PriceItem) => {
    setForm({ ...item, isActive: isActiveFor(item) });
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const updateForm = (key: keyof PriceItemDraft, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveLocalItem = (draft: PriceItemDraft) => {
    const saved = normalizeLocalItem(draft);
    setItems((prev) => replaceItem(prev, saved));
    setActive((prev) => ({ ...prev, [saved.id]: saved.isActive }));
    return saved;
  };

  const saveItem = async (draft: PriceItemDraft) => {
    if (backendMode !== "local") {
      try {
        const response = await fetch("/api/price-items", {
          method: draft.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item: draft }),
        });
        const payload = (await response.json()) as PriceItemSaveResponse;

        if (!response.ok) {
          throw new Error(payload.error?.message ?? "単価マスターを保存できませんでした。");
        }
        if (payload.mode === "database" && payload.data) {
          setBackendMode("database");
          setSyncError(null);
          setItems((prev) => replaceItem(prev, payload.data as PriceItem));
          setActive((prev) => ({ ...prev, [payload.data!.id]: payload.data!.isActive }));
          return payload.data;
        }
      } catch (error) {
        if (backendMode === "database") throw error;
        setBackendMode("local");
        setSyncError(
          error instanceof Error
            ? error.message
            : "単価マスターのDB保存を確認できませんでした。",
        );
      }
    }

    return saveLocalItem(draft);
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingForm(true);
    setFormError(null);
    try {
      await saveItem(form);
      closeForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "単価マスターを保存できませんでした。");
    } finally {
      setIsSavingForm(false);
    }
  };

  const toggle = async (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;

    const nextActive = !isActiveFor(target);
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

  const removeItem = async (item: PriceItem) => {
    if (!window.confirm(`${item.name} を単価マスターから非表示にしますか？`)) return;

    setDeletingId(item.id);
    setFormError(null);
    try {
      if (backendMode === "database") {
        const response = await fetch("/api/price-items", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: item.id }),
        });
        const payload = (await response.json()) as PriceItemDeleteResponse;
        if (!response.ok) {
          throw new Error(payload.error?.message ?? "単価マスターを削除できませんでした。");
        }
      }

      setItems((prev) => prev.filter((row) => row.id !== item.id));
      setActive((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "単価マスターを削除できませんでした。");
    } finally {
      setDeletingId(null);
    }
  };

  const isEditing = Boolean(form.id);

  return (
    <div>
      <PageHeader
        className="mb-4"
        icon={<TagIcon className="text-xl" />}
        title="単価マスター"
        description="見積に使う品目と単価を管理します。"
        actions={
          <>
            <button type="button" onClick={openCreate} className="btn-primary">
              <Plus className="text-base" />
              単価追加
            </button>
            <Link href="/import" className="btn-secondary">
              <Spreadsheet className="text-base" />
              <span className="hidden sm:inline">Excel取込</span>
            </Link>
          </>
        }
      />

      {formOpen && (
        <form onSubmit={submitForm} className="card mb-4 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {isEditing ? "単価マスターを編集" : "新しい単価を追加"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                保存先: {backendMode === "database" ? "データベース" : "ローカルデモ"}
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="btn-ghost h-9 min-h-0 w-9 px-0"
              aria-label="閉じる"
            >
              <X className="text-base" />
            </button>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {formError && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 sm:col-span-2 lg:col-span-4">
                {formError}
              </p>
            )}
            <div className="sm:col-span-2">
              <label className="field-label">品目名</label>
              <input
                required
                className="field-input"
                value={form.name ?? ""}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="例: シリコン塗装"
              />
            </div>
            <div>
              <label className="field-label">単位</label>
              <input
                required
                className="field-input"
                value={form.unit ?? ""}
                onChange={(event) => updateForm("unit", event.target.value)}
                placeholder="例: ㎡"
              />
            </div>
            <div>
              <label className="field-label">単価</label>
              <input
                required
                type="number"
                min="0"
                className="field-input"
                value={form.unitPrice ?? 0}
                onChange={(event) => updateForm("unitPrice", Number(event.target.value))}
                placeholder="4000"
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 sm:col-span-2 lg:col-span-4">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(event) => updateForm("isActive", event.target.checked)}
                className="h-4 w-4 accent-brand-600"
              />
              見積作成時に候補として使う
            </label>
            <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end lg:col-span-4">
              <button type="button" onClick={closeForm} className="btn-secondary">
                キャンセル
              </button>
              <button type="submit" className="btn-primary" disabled={isSavingForm}>
                {isSavingForm ? "保存中..." : isEditing ? "変更を保存" : "単価を保存"}
              </button>
            </div>
          </div>
        </form>
      )}

      {formError && !formOpen && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {formError}
        </div>
      )}

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
                  ? "デモ/ローカル"
                  : "確認中"}
            </strong>
          </span>
          <span className="text-xs text-slate-400">
            {items.length} 件の単価を読み込み済み
          </span>
        </div>
        {syncError && (
          <p className="mt-2 text-xs text-amber-700">
            DB接続前または確認中のため、画面上はローカルデモで動作します。{syncError}
          </p>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<TagIcon />}
          title="該当する品目がありません"
          description="検索条件を変更するか、単価を追加してください。"
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">品目名</th>
                  <th className="px-4 py-3">単位</th>
                  <th className="px-4 py-3 text-right">単価</th>
                  <th className="px-4 py-3 text-center">状態</th>
                  <th className="px-4 py-3 text-right">操作</th>
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
                        on={isActiveFor(p)}
                        saving={savingId === p.id}
                        onClick={() => toggle(p.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-brand-700"
                        >
                          <Pencil className="text-sm" />
                          編集
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(p)}
                          disabled={deletingId === p.id}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
                        >
                          <Trash className="text-sm" />
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 lg:hidden">
            {rows.map((p) => (
              <div key={p.id} className="card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800">{p.name}</div>
                    <div className="num mt-0.5 text-xs text-slate-500">
                      {yen(p.unitPrice)} / {p.unit}
                    </div>
                  </div>
                  <ActiveToggle
                    on={isActiveFor(p)}
                    saving={savingId === p.id}
                    onClick={() => toggle(p.id)}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => openEdit(p)} className="btn-secondary">
                    <Pencil className="text-base" />
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(p)}
                    disabled={deletingId === p.id}
                    className="btn-secondary text-rose-700 disabled:opacity-50"
                  >
                    <Trash className="text-base" />
                    削除
                  </button>
                </div>
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