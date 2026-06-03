"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building, Mic } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("yamada@kouta-tosou.example.jp");
  const [password, setPassword] = useState("demo-password");

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-700 to-brand-900 px-5 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        {/* ブランド */}
        <div className="mb-8 text-center text-white">
          <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
            <Mic className="text-3xl" />
          </span>
          <h1 className="text-2xl font-bold">ボイス見積</h1>
          <p className="mt-1 text-sm text-white/70">音声AI見積作成システム</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/dashboard");
          }}
          className="card space-y-4 p-6"
        >
          <div>
            <label className="field-label" htmlFor="email">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            ログイン
          </button>

          <div className="text-center">
            <a href="#" className="text-xs font-medium text-brand-600 hover:underline">
              パスワードをお忘れですか？
            </a>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-white/60">
          <Building className="text-sm" />
          幸田塗装工業 株式会社
        </div>
      </div>
    </div>
  );
}
