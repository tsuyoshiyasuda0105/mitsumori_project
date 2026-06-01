"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Building,
  Check,
  FileText,
  Pencil,
  Settings,
  Upload,
  Users,
} from "@/components/icons";
import { CustomerTag, InternalTag, PageHeader } from "@/components/ui";
import { TAX_RATE } from "@/lib/calc";
import { company, currentUser } from "@/lib/mock";

export default function SettingsPage() {
  const [form, setForm] = useState(company);
  const [taxRate, setTaxRate] = useState(String(Math.round(TAX_RATE * 100)));
  const [expireDays, setExpireDays] = useState("30");
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      setDirty(true);
    };
  const touch = () => setDirty(true);
  const save = () => {
    setDirty(false);
    setSavedAt(
      new Date().toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  };

  return (
    <div className="space-y-5">
      {/* ページヘッダー */}
      <PageHeader
        icon={<Settings className="text-xl" />}
        title="会社設定"
        description="会社情報や見積書の初期設定を管理します。"
        actions={
          <>
            {dirty ? (
              <span className="text-xs font-medium text-amber-600">
                ● 未保存の変更があります
              </span>
            ) : savedAt ? (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <Check className="text-sm" /> 保存しました {savedAt}
              </span>
            ) : null}
            <button
              className="btn-primary px-5"
              onClick={save}
              disabled={!dirty}
            >
              保存する
            </button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* メイン */}
        <div className="space-y-4 lg:col-span-2">
          {/* 会社情報 */}
          <section className="card overflow-hidden">
            <SectionHead
              icon={<Building className="text-lg" />}
              title="会社情報"
              desc="見積書のヘッダーに印刷されます"
              trailing={<CustomerTag>見積書に表示</CustomerTag>}
            />
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <Field label="会社名" required full>
                <input
                  className="field-input"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="例: 〇〇株式会社"
                />
              </Field>
              <Field label="代表者名">
                <input
                  className="field-input"
                  value={form.representativeName}
                  onChange={set("representativeName")}
                  placeholder="例: 代表取締役 山田 太郎"
                />
              </Field>
              <Field label="電話番号">
                <input
                  className="field-input num"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="0000-00-0000"
                />
              </Field>
              <Field label="郵便番号">
                <input
                  className="field-input num"
                  value={form.postalCode}
                  onChange={set("postalCode")}
                  placeholder="000-0000"
                />
              </Field>
              <Field label="メールアドレス">
                <input
                  className="field-input"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="info@example.jp"
                />
              </Field>
              <Field label="住所" full>
                <input
                  className="field-input"
                  value={form.address}
                  onChange={set("address")}
                  placeholder="都道府県市区町村 番地"
                />
              </Field>
            </div>
          </section>

          {/* インボイス・振込先 */}
          <section className="card overflow-hidden">
            <SectionHead
              icon={<FileText className="text-lg" />}
              title="インボイス・振込先"
              desc="登録番号と振込先を見積書・請求書に表示します"
              trailing={<CustomerTag>見積書に表示</CustomerTag>}
            />
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <Field label="適格請求書発行事業者 登録番号" full>
                <input
                  className="field-input num"
                  value={form.invoiceRegistrationNo}
                  onChange={set("invoiceRegistrationNo")}
                  placeholder="T0000000000000"
                />
              </Field>
              <Field label="振込先口座" full>
                <input
                  className="field-input"
                  value={form.bankAccountText}
                  onChange={set("bankAccountText")}
                  placeholder="〇〇銀行 〇〇支店 普通 0000000 カ）〇〇"
                />
              </Field>
            </div>
          </section>

          {/* 見積書の初期設定 */}
          <section className="card overflow-hidden">
            <SectionHead
              icon={<Pencil className="text-lg" />}
              title="見積書の初期設定"
              desc="新規見積を作成したときの初期値"
            />
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <Field label="消費税率">
                <select
                  className="field-input"
                  value={taxRate}
                  onChange={(e) => {
                    setTaxRate(e.target.value);
                    touch();
                  }}
                >
                  <option value="10">10%（標準）</option>
                  <option value="8">8%（軽減）</option>
                  <option value="0">非課税（0%）</option>
                </select>
              </Field>
              <Field label="見積有効期限（既定）">
                <div className="flex items-center gap-2">
                  <input
                    className="field-input num text-right"
                    inputMode="numeric"
                    value={expireDays}
                    onChange={(e) => {
                      setExpireDays(e.target.value);
                      touch();
                    }}
                  />
                  <span className="shrink-0 text-sm text-slate-500">日間</span>
                </div>
              </Field>
              <div className="sm:col-span-2">
                <div className="mb-1 flex items-center gap-1.5">
                  <label className="field-label mb-0">
                    見積書フッターの初期文言
                  </label>
                  <CustomerTag />
                </div>
                <textarea
                  className="field-input min-h-[96px] resize-y py-2"
                  value={form.defaultNote}
                  onChange={set("defaultNote")}
                  placeholder="・本見積の有効期限は発行日より30日間です。"
                />
              </div>
            </div>
          </section>
        </div>

        {/* 右パネル */}
        <aside className="space-y-4">
          {/* ロゴ・社印 */}
          <section className="card overflow-hidden">
            <SectionHead
              icon={<Upload className="text-lg" />}
              title="ロゴ・社印"
              trailing={<CustomerTag>PDF</CustomerTag>}
            />
            <div className="grid grid-cols-2 gap-3 p-4 sm:p-5">
              <UploadTile label="会社ロゴ" />
              <UploadTile label="社印" />
            </div>
          </section>

          {/* 担当者・アカウント */}
          <section className="card overflow-hidden">
            <SectionHead
              icon={<Users className="text-lg" />}
              title="担当者・アカウント"
            />
            <div className="space-y-3 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-base font-bold text-brand-700">
                  {currentUser.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-800">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {form.email || "メール未設定"}
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                  {currentUser.role === "admin" ? "管理者" : "一般担当者"}
                </span>
              </div>
              <button className="btn-secondary h-10 min-h-0 w-full text-sm">
                <Users className="text-base" /> ユーザーを招待
              </button>
            </div>
          </section>

          {/* 情報の表示先（情報分離の要） */}
          <section className="card p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-bold text-slate-700">
              情報の表示先
            </h2>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CustomerTag>顧客に表示</CustomerTag>
                <span className="flex-1">
                  会社情報・振込先・備考は顧客向けPDFに印刷されます。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <InternalTag>社内のみ</InternalTag>
                <span className="flex-1">
                  原価・利益率・業者指示事項は顧客に
                  <span className="font-bold text-amber-700">表示されません</span>
                  。
                </span>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ── セクション見出し ── */
function SectionHead({
  icon,
  title,
  desc,
  trailing,
}: {
  icon: ReactNode;
  title: string;
  desc?: string;
  trailing?: ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-700">{title}</h2>
          {desc && <p className="truncate text-xs text-slate-400">{desc}</p>}
        </div>
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </header>
  );
}

/* ── 入力フィールド（ラベル + 子要素） ── */
function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="field-label">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

/* ── ロゴ/社印アップロード（プレースホルダ） ── */
function UploadTile({ label }: { label: string }) {
  return (
    <button className="group flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-2 py-5 text-center transition-colors hover:border-brand-300 hover:bg-brand-50/40">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-inset ring-slate-200 transition-colors group-hover:ring-brand-200">
        <Upload className="text-lg" />
      </span>
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <span className="text-[10px] text-slate-400">PNG · JPG</span>
    </button>
  );
}
