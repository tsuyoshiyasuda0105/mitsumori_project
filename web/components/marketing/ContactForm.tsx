"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, HelpCircle } from "@/components/icons";

// 公開前に、自社の受信用メールアドレスへ変更してください。
const CONTACT_EMAIL = "your-email@example.com";

const KINDS = ["導入のご相談", "お見積もり", "取材・提携", "その他"];

export function ContactForm() {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [kind, setKind] = useState(KINDS[0]);
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `【ボイス見積】お問い合わせ（${kind}）`;
    const body = [
      `お名前: ${name}`,
      `会社名: ${org}`,
      `メール: ${email}`,
      `電話: ${phone}`,
      `種別: ${kind}`,
      "",
      "【お問い合わせ内容】",
      message,
    ].join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-panel">
          <HelpCircle className="text-2xl" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            お問い合わせ
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            導入のご相談・お見積もりなど、お気軽にご連絡ください。
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50/70 p-3 text-sm text-amber-800">
        <AlertTriangle className="mt-0.5 shrink-0 text-base" />
        <p>
          このデモでは、送信ボタンを押すとお使いのメールソフトが起動します（サーバーへの自動送信は行いません）。公開前に送信先メールアドレスの設定が必要です。
        </p>
      </div>

      <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="お名前" required>
            <input
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="例: 山田 太郎"
            />
          </Field>
          <Field label="会社名">
            <input
              className="field-input"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="例: 〇〇塗装"
            />
          </Field>
          <Field label="メールアドレス" required>
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.jp"
            />
          </Field>
          <Field label="電話番号">
            <input
              className="field-input num"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="000-0000-0000"
            />
          </Field>
        </div>

        <Field label="お問い合わせ種別">
          <select
            className="field-input"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </Field>

        <Field label="お問い合わせ内容" required>
          <textarea
            className="field-input min-h-[140px] resize-y py-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="ご相談内容をご記入ください。"
          />
        </Field>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            送信により
            <Link href="/privacy" className="text-brand-700 underline">
              プライバシーポリシー
            </Link>
            に同意したものとみなします。
          </p>
          <button type="submit" className="btn-primary px-6">
            <Check className="text-lg" /> メールを作成して送信
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="field-label">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
