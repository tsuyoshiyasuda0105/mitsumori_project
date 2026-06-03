"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { FileText, Pencil, Plus, Search, Trash, Users, X } from "@/components/icons";
import { EmptyState, PageHeader } from "@/components/ui";
import { CustomerDraft, useCustomerStore } from "@/lib/customer-store";
import { useEstimateStore } from "@/lib/estimate-store";
import type { Customer } from "@/lib/types";

const EMPTY_FORM: CustomerDraft = {
  name: "",
  nameKana: "",
  postalCode: "",
  address: "",
  phone: "",
  email: "",
  contactName: "",
  note: "",
};

export function CustomerList() {
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CustomerDraft>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const {
    customers,
    backendMode,
    syncError,
    saveCustomer,
    deleteCustomer,
  } = useCustomerStore();
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

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setForm(customer);
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const updateField = (key: keyof CustomerDraft, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);
    try {
      await saveCustomer(form);
      closeForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "顧客情報を保存できませんでした。");
    } finally {
      setIsSaving(false);
    }
  };

  const removeCustomer = async (customer: Customer) => {
    const estimateCount = countFor(customer.id);
    const message = estimateCount > 0
      ? `${customer.name} には ${estimateCount} 件の見積があります。顧客一覧から非表示にしますか？`
      : `${customer.name} を顧客一覧から非表示にしますか？`;

    if (!window.confirm(message)) return;

    setDeletingId(customer.id);
    setFormError(null);
    try {
      await deleteCustomer(customer.id);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "顧客情報を削除できませんでした。");
    } finally {
      setDeletingId(null);
    }
  };

  const isEditing = Boolean(form.id);

  return (
    <div>
      <PageHeader
        className="mb-4"
        icon={<Users className="text-xl" />}
        title="顧客一覧"
        description="顧客情報と見積履歴を管理します。"
        actions={
          <button type="button" onClick={openCreate} className="btn-primary">
            <Plus className="text-base" />
            顧客追加
          </button>
        }
      />

      {formOpen && (
        <form onSubmit={submitForm} className="card mb-4 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {isEditing ? "顧客情報を編集" : "新しい顧客を追加"}
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

          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {formError && (
              <p className="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {formError}
              </p>
            )}
            <div>
              <label className="field-label">顧客名</label>
              <input
                required
                className="field-input"
                value={form.name ?? ""}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="例: 山田工務店"
              />
            </div>
            <div>
              <label className="field-label">フリガナ</label>
              <input
                className="field-input"
                value={form.nameKana ?? ""}
                onChange={(event) => updateField("nameKana", event.target.value)}
                placeholder="例: ヤマダコウムテン"
              />
            </div>
            <div>
              <label className="field-label">郵便番号</label>
              <input
                className="field-input"
                value={form.postalCode ?? ""}
                onChange={(event) => updateField("postalCode", event.target.value)}
                placeholder="例: 446-0001"
              />
            </div>
            <div>
              <label className="field-label">電話番号</label>
              <input
                className="field-input"
                value={form.phone ?? ""}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="例: 0566-00-0000"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">住所</label>
              <input
                className="field-input"
                value={form.address ?? ""}
                onChange={(event) => updateField("address", event.target.value)}
                placeholder="例: 愛知県安城市..."
              />
            </div>
            <div>
              <label className="field-label">メール</label>
              <input
                type="email"
                className="field-input"
                value={form.email ?? ""}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="customer@example.com"
              />
            </div>
            <div>
              <label className="field-label">担当者</label>
              <input
                className="field-input"
                value={form.contactName ?? ""}
                onChange={(event) => updateField("contactName", event.target.value)}
                placeholder="例: 山田 太郎"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">メモ</label>
              <textarea
                className="field-input min-h-24"
                value={form.note ?? ""}
                onChange={(event) => updateField("note", event.target.value)}
                placeholder="見積時に確認しておきたい情報"
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeForm} className="btn-secondary">
                キャンセル
              </button>
              <button type="submit" className="btn-primary" disabled={isSaving}>
                {isSaving ? "保存中..." : isEditing ? "変更を保存" : "顧客を保存"}
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
                  ? "デモ/ローカル"
                  : "確認中"}
            </strong>
          </span>
          <span className="text-xs text-slate-400">
            {customers.length} 件の顧客を読み込み済み
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
          icon={<Users />}
          title="該当する顧客がありません"
          description="検索条件を変更するか、新しい顧客を追加してください。"
        />
      ) : (
        <>
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
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-brand-700"
                        >
                          <Pencil className="text-sm" />
                          編集
                        </button>
                        <Link
                          href="/estimates/new/edit"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
                        >
                          <FileText className="text-sm" />
                          見積作成
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeCustomer(c)}
                          disabled={deletingId === c.id}
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
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => openEdit(c)} className="btn-secondary">
                    <Pencil className="text-base" />
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCustomer(c)}
                    disabled={deletingId === c.id}
                    className="btn-secondary text-rose-700 disabled:opacity-50"
                  >
                    <Trash className="text-base" />
                    削除
                  </button>
                </div>
                <Link
                  href="/estimates/new/edit"
                  className="btn-primary mt-2 w-full"
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
