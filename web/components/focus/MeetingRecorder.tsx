"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FocusHeader } from "@/components/FocusHeader";
import { MobileActionBar } from "@/components/MobileActionBar";
import { Check, Mic, Sparkles, Stop } from "@/components/icons";
import { CustomerTag, InternalTag } from "@/components/ui";
import {
  type MeetingReflectCandidate,
  type MeetingSummary,
  mockMeetingSummary,
} from "@/lib/ai";
import { fmtClock } from "@/lib/format";

type Phase = "idle" | "recording" | "recorded" | "transcribing" | "summarized";

export function MeetingRecorder({
  estimateId,
  title,
  customer,
  assignee,
}: {
  estimateId: string;
  title: string;
  customer: string;
  assignee: string;
}) {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [secs, setSecs] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [adopt, setAdopt] = useState<Record<string, boolean>>({});
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };
  useEffect(() => stopTimer, []);

  const start = () => {
    if (!consent) return;
    setSecs(0);
    setPhase("recording");
    timer.current = setInterval(() => setSecs((s) => s + 1), 1000);
  };

  const stop = () => {
    stopTimer();
    setPhase("recorded");
  };

  const reRecord = () => {
    stopTimer();
    setSecs(0);
    setPhase("idle");
  };

  const transcribe = () => {
    setPhase("transcribing");
    setTimeout(() => {
      const s = mockMeetingSummary();
      setSummary(s);
      setTranscript(s.transcript);
      setAdopt(Object.fromEntries(s.reflectCandidates.map((c) => [c.id, true])));
      setPhase("summarized");
    }, 1800);
  };

  const adoptedCount = Object.values(adopt).filter(Boolean).length;
  const reflect = () => router.push(`/estimates/${estimateId}/edit`);

  return (
    <div>
      <FocusHeader
        icon={<Mic className="text-lg" />}
        title={title || "新規見積"}
        subtitle="打ち合わせ録音"
        variant="back"
      />

      {/* 営業メモである旨の明示 */}
      <div className="mb-4 flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-600">
        <InternalTag>営業メモ・PDF非表示</InternalTag>
        <p>
          打ち合わせ録音は営業メモとして扱い、顧客提出用PDFには出力されません。
          抽出された候補は、あなたが採用するまで見積に反映されません。
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-4">
        {/* 紐づけ情報 */}
        <section className="card p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-700">紐づけ情報</h2>
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-xs text-slate-400">顧客</dt>
              <dd className="mt-0.5 font-medium text-slate-700">{customer}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">見積件名</dt>
              <dd className="mt-0.5 font-medium text-slate-700">
                {title || "（未設定）"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">営業担当</dt>
              <dd className="mt-0.5 font-medium text-slate-700">{assignee}</dd>
            </div>
          </dl>
        </section>

        {/* 録音同意確認 */}
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
            consent
              ? "border-emerald-300 bg-emerald-50/60"
              : "border-rose-300 bg-rose-50/60"
          }`}
        >
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (!e.target.checked && phase === "recording") reRecord();
            }}
            className="mt-0.5 h-5 w-5 accent-emerald-600"
          />
          <span className="text-sm">
            <span className="font-semibold text-slate-800">
              顧客へ録音の同意を確認済みです
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              同意の確認が取れるまで録音は開始できません。
            </span>
          </span>
        </label>

        {/* 録音ステージ */}
        <section className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          {phase === "idle" && (
            <>
              <button
                onClick={start}
                disabled={!consent}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-600 text-white shadow-panel transition-transform active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                aria-label="録音開始"
              >
                <Mic className="text-4xl" />
              </button>
              <p className="mt-4 text-sm font-semibold text-slate-700">
                {consent ? "タップして録音開始" : "同意確認後に録音できます"}
              </p>
            </>
          )}

          {phase === "recording" && (
            <>
              <button
                onClick={stop}
                className="relative flex h-24 w-24 items-center justify-center rounded-full bg-rose-600 text-white shadow-panel"
                aria-label="録音停止"
              >
                <span className="absolute inset-0 animate-pulse-rec rounded-full bg-rose-400/50" />
                <Stop className="relative text-3xl" />
              </button>
              <p className="num mt-4 text-2xl font-bold text-slate-800">
                {fmtClock(secs)}
              </p>
              <p className="mt-1 text-xs font-medium text-rose-600">録音中…</p>
            </>
          )}

          {phase === "recorded" && (
            <>
              <p className="num text-lg font-bold text-slate-800">
                録音 {fmtClock(secs)}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button onClick={reRecord} className="btn-secondary">
                  <Mic className="text-base" />
                  再録音
                </button>
                <button onClick={transcribe} className="btn-primary">
                  <Sparkles className="text-base" />
                  文字起こし・AI整理
                </button>
              </div>
            </>
          )}

          {phase === "transcribing" && (
            <>
              <Sparkles className="animate-pulse text-4xl text-brand-600" />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                文字起こし・要点整理中…
              </p>
              <p className="mt-1 text-xs text-slate-400">
                処理中はキャンセルできません。
              </p>
            </>
          )}

          {phase === "summarized" && (
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
              <Check className="text-base" />
              AI整理が完了しました
            </p>
          )}
        </section>

        {/* AI整理結果 */}
        {phase === "summarized" && summary && (
          <>
            <section className="card p-4">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-700">文字起こし結果</h2>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="field-input min-h-[120px] leading-relaxed"
              />
            </section>

            <div className="grid gap-4 sm:grid-cols-3">
              <PointList title="要点" items={summary.points} />
              <PointList title="顧客要望" items={summary.requests} />
              <PointList title="確認事項" items={summary.confirmItems} tone="rose" />
            </div>

            <section className="card p-4">
              <h2 className="mb-1 text-sm font-bold text-slate-700">見積反映候補</h2>
              <p className="mb-3 text-xs text-slate-500">
                採用した候補のみ見積編集画面へ反映されます。
              </p>
              <div className="space-y-2">
                {summary.reflectCandidates.map((c) => (
                  <ReflectRow
                    key={c.id}
                    candidate={c}
                    checked={adopt[c.id] ?? false}
                    onToggle={(v) => setAdopt((s) => ({ ...s, [c.id]: v }))}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* PC操作 */}
      <div className="mx-auto mt-6 hidden max-w-2xl items-center justify-between lg:flex">
        <button onClick={reflect} className="btn-secondary">
          見積に戻る
        </button>
        <button
          onClick={reflect}
          disabled={phase !== "summarized" || adoptedCount === 0}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check className="text-base" />
          採用した{adoptedCount}件を反映
        </button>
      </div>

      <MobileActionBar>
        <button onClick={reflect} className="btn-secondary flex-1">
          戻る
        </button>
        <button
          onClick={reflect}
          disabled={phase !== "summarized" || adoptedCount === 0}
          className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {adoptedCount}件を反映
        </button>
      </MobileActionBar>
    </div>
  );
}

function PointList({
  title,
  items,
  tone = "slate",
}: {
  title: string;
  items: { id: string; text: string }[];
  tone?: "slate" | "rose";
}) {
  return (
    <section className="card p-4">
      <h3
        className={`mb-2 text-sm font-bold ${
          tone === "rose" ? "text-rose-700" : "text-slate-700"
        }`}
      >
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it.id} className="flex gap-2 text-sm text-slate-600">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                tone === "rose" ? "bg-rose-400" : "bg-brand-400"
              }`}
            />
            {it.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReflectRow({
  candidate,
  checked,
  onToggle,
}: {
  candidate: MeetingReflectCandidate;
  checked: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onToggle(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-brand-600"
      />
      <span className="min-w-0 flex-1">
        <span className="mb-1 inline-flex">
          {candidate.kind === "internal" ? (
            <InternalTag />
          ) : candidate.kind === "customerNote" ? (
            <CustomerTag />
          ) : (
            <span className="tag bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200">
              明細
            </span>
          )}
        </span>
        <span className="block">{candidate.label}</span>
      </span>
    </label>
  );
}
