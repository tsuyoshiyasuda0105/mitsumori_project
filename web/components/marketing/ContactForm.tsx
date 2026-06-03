"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { Check, HelpCircle } from "@/components/icons";

const KINDS = ["導入のご相談", "お見積もり", "取材・提携", "その他"];

type SubmitState = "idle" | "sending" | "success" | "preview" | "error";

export function ContactForm() {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [kind, setKind] = useState(KINDS[0]);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [notice, setNotice] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitState("sending");
    setNotice("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, org, email, phone, kind, message, website }),
      });
      const payload = (await response.json()) as { ok?: boolean; mode?: string; message?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "送信に失敗しました。");
      }

      setSubmitState(payload.mode === "webhook" ? "success" : "preview");
      setNotice(payload.message || "お問い合わせを受け付けました。");
    } catch (error) {
      setSubmitState("error");
      setNotice(error instanceof Error ? error.message : "送信に失敗しました。");
    }
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

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50/80 p-3 text-sm text-sky-900">
        <Check className="mt-0.5 shrink-0 text-base" />
        <p>
          お問い合わせ先メールアドレスは非公開のまま、フォームから受付できます。内容確認後、担当者より返信します。
        </p>
      </div>

      {submitState === "preview" && (
        <StatusBox tone="amber">
          {notice || "フォームの送信環境を確認中です。恐れ入りますが、時間をおいてもう一度お試しください。"}
        </StatusBox>
      )}
      {submitState === "success" && (
        <StatusBox tone="emerald">
          {notice || "お問い合わせを受け付けました。担当者より返信します。"}
        </StatusBox>
      )}
      {submitState === "error" && (
        <StatusBox tone="rose">
          {notice || "送信に失敗しました。入力内容をご確認ください。"}
        </StatusBox>
      )}

      <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-5 sm:p-6">
        <input
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          aria-hidden="true"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="お名前" required>
            <input
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="例：山田 太郎"
              autoComplete="name"
            />
          </Field>
          <Field label="会社名">
            <input
              className="field-input"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="例：〇〇塗装"
              autoComplete="organization"
            />
          </Field>
          <Field label="返信先メールアドレス" required>
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.jp"
              autoComplete="email"
            />
          </Field>
          <Field label="電話番号">
            <input
              className="field-input num"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="000-0000-0000"
              autoComplete="tel"
            />
          </Field>
        </div>

        <Field label="お問い合わせ種別">
          <select className="field-input" value={kind} onChange={(e) => setKind(e.target.value)}>
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
            maxLength={2000}
            placeholder="ご相談内容をご記入ください。例：リフォーム工事の見積作成で、既存のExcel単価表を使えるか相談したい。"
          />
          <p className="mt-1 text-right text-xs text-slate-400">{message.length}/2000</p>
        </Field>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            送信により
            <Link href="/privacy" className="text-brand-700 underline">
              プライバシーポリシー
            </Link>
            に同意したものとみなします。
          </p>
          <button type="submit" className="btn-primary px-6" disabled={submitState === "sending"}>
            <Check className="text-lg" /> {submitState === "sending" ? "送信中..." : "送信する"}
          </button>
        </div>
      </form>

      <p className="mt-5 rounded-xl border border-slate-200 bg-white/80 p-3 text-xs leading-6 text-slate-500">
        いただいた内容は返信目的でのみ利用します。お問い合わせ先メールアドレスは画面上に表示していません。
      </p>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
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

function StatusBox({ tone, children }: { tone: "emerald" | "amber" | "rose"; children: ReactNode }) {
  const toneClass = {
    emerald: "border-emerald-300 bg-emerald-50 text-emerald-800",
    amber: "border-amber-300 bg-amber-50 text-amber-800",
    rose: "border-rose-300 bg-rose-50 text-rose-800",
  }[tone];

  return <div className={`mt-5 rounded-xl border p-3 text-sm leading-7 ${toneClass}`}>{children}</div>;
}
