"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, Check, HelpCircle } from "@/components/icons";

const KINDS = ["導入のご相談", "お見積もり", "取材・提携", "その他"];

export function ContactForm() {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [kind, setKind] = useState(KINDS[0]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-panel">
          <HelpCircle className="text-2xl" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">お問い合わせ</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            導入のご相談・お見積もりなど、お気軽にご連絡ください。
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50/70 p-3 text-sm text-amber-800">
        <AlertTriangle className="mt-0.5 shrink-0 text-base" />
        <p>
          現在、お問い合わせ先メールアドレスは非公開にしています。フォーム送信機能は準備中のため、入力内容はサーバーへ送信されません。
        </p>
      </div>

      {submitted && (
        <div className="mt-5 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm leading-7 text-emerald-800">
          入力内容を確認しました。現在はメールアドレス非公開・フォーム送信準備中のため、送信は行われていません。公開準備が整い次第、送信機能を有効化します。
        </div>
      )}

      <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="お名前" required>
            <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="例：山田 太郎" />
          </Field>
          <Field label="会社名">
            <input className="field-input" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="例：〇〇塗装" />
          </Field>
          <Field label="返信先メールアドレス" required>
            <input type="email" className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.jp" />
          </Field>
          <Field label="電話番号">
            <input className="field-input num" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="000-0000-0000" />
          </Field>
        </div>

        <Field label="お問い合わせ種別">
          <select className="field-input" value={kind} onChange={(e) => setKind(e.target.value)}>
            {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>

        <Field label="お問い合わせ内容" required>
          <textarea className="field-input min-h-[140px] resize-y py-2" value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="ご相談内容をご記入ください。" />
        </Field>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            送信により<Link href="/privacy" className="text-brand-700 underline">プライバシーポリシー</Link>に同意したものとみなします。
          </p>
          <button type="submit" className="btn-primary px-6">
            <Check className="text-lg" /> 入力内容を確認する
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}{required && <span className="text-rose-500"> *</span>}</label>
      {children}
    </div>
  );
}
