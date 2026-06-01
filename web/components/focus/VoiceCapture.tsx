"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FocusHeader } from "@/components/FocusHeader";
import { MobileActionBar } from "@/components/MobileActionBar";
import { AlertTriangle, Mic, Play, Sparkles, Stop } from "@/components/icons";
import { SAMPLE_TRANSCRIPT } from "@/lib/ai";
import { fmtClock } from "@/lib/format";

type RecState =
  | "idle"
  | "recording"
  | "recorded"
  | "transcribing"
  | "transcribed"
  | "error";

const REC_TIP = "場所・品目・数量・単位・備考・業者指示事項を続けて話してください。";

export function VoiceCapture({
  estimateId,
  title,
}: {
  estimateId: string;
  title: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"voice" | "text">("voice");
  const [state, setState] = useState<RecState>("idle");
  const [secs, setSecs] = useState(0);
  const [level, setLevel] = useState(0);
  const [transcript, setTranscript] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };
  useEffect(() => stopTimer, []);

  const startRecording = () => {
    setSecs(0);
    setState("recording");
    timer.current = setInterval(() => {
      setSecs((s) => s + 1);
      setLevel(Math.random()); // 音量レベルの擬似表示
    }, 1000);
  };

  const stopRecording = () => {
    stopTimer();
    setState("recorded");
  };

  const reset = () => {
    stopTimer();
    setSecs(0);
    setState("idle");
  };

  const runTranscribe = () => {
    setState("transcribing");
    // 文字起こしのモック（実際はAPI送信）。
    setTimeout(() => {
      // 1割の確率でエラー演出にせず、デモでは常に成功させる。
      setTranscript(SAMPLE_TRANSCRIPT);
      setState("transcribed");
    }, 1800);
  };

  const goAiReview = () => {
    router.push(`/estimates/${estimateId}/ai-review`);
  };

  const editHref = `/estimates/${estimateId}/edit`;
  const recommended = state === "idle" || state === "recording";

  return (
    <div>
      <FocusHeader
        title={title || "新規見積"}
        subtitle="ボイス入力"
        variant="back"
      />

      {/* 入力方式タブ */}
      <div className="mb-4 flex gap-2">
        <TabButton active={tab === "voice"} onClick={() => setTab("voice")}>
          <Mic className="text-base" />
          音声で入力
        </TabButton>
        <TabButton active={tab === "text"} onClick={() => setTab("text")}>
          テキストで入力
        </TabButton>
      </div>

      {tab === "voice" ? (
        <div className="mx-auto max-w-lg">
          {recommended && (
            <div className="mb-5 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-sm text-brand-800">
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="text-base" />
                話す内容のヒント
              </div>
              <p className="mt-1 leading-relaxed text-brand-700">{REC_TIP}</p>
              <p className="mt-2 text-xs text-brand-500">
                推奨録音時間：30秒〜2分（長すぎると失敗しやすくなります）
              </p>
            </div>
          )}

          <RecorderStage
            state={state}
            secs={secs}
            level={level}
            onStart={startRecording}
            onStop={stopRecording}
            onReRecord={reset}
            onTranscribe={runTranscribe}
            onRetry={runTranscribe}
            onSwitchText={() => setTab("text")}
          />

          {(state === "transcribed" || state === "error") && (
            <div className="mt-5">
              <label className="field-label flex items-center gap-2">
                文字起こし結果
                <span className="text-xs font-normal text-slate-400">
                  （誤認識はその場で修正できます）
                </span>
              </label>
              <textarea
                className="field-input min-h-[160px] leading-relaxed"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="文字起こし結果がここに表示されます。"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-lg">
          <p className="mb-2 text-sm text-slate-500">{REC_TIP}</p>
          <textarea
            className="field-input min-h-[220px] leading-relaxed"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="例：外壁の足場120平米、高圧洗浄、外壁3回塗り。シーリング打替え80m。前の道が狭いので搬入は朝イチ、誘導員1名…"
          />
        </div>
      )}

      {/* PC：右寄せの次へ操作 */}
      <div className="mt-6 hidden items-center justify-between lg:flex">
        <button onClick={() => router.push(editHref)} className="btn-secondary">
          下書き保存して戻る
        </button>
        <button
          onClick={goAiReview}
          disabled={!canProceed(tab, state, transcript)}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Sparkles className="text-base" />
          AI解析へ進む
        </button>
      </div>

      <MobileActionBar>
        <button
          onClick={() => router.push(editHref)}
          className="btn-secondary flex-1"
        >
          下書き保存
        </button>
        <button
          onClick={goAiReview}
          disabled={!canProceed(tab, state, transcript)}
          className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
        >
          AI解析へ
        </button>
      </MobileActionBar>
    </div>
  );
}

function canProceed(
  tab: "voice" | "text",
  state: RecState,
  transcript: string,
): boolean {
  if (tab === "text") return transcript.trim().length > 0;
  return state === "transcribed" && transcript.trim().length > 0;
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-colors ${
        active
          ? "bg-brand-600 text-white"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function RecorderStage({
  state,
  secs,
  level,
  onStart,
  onStop,
  onReRecord,
  onTranscribe,
  onRetry,
  onSwitchText,
}: {
  state: RecState;
  secs: number;
  level: number;
  onStart: () => void;
  onStop: () => void;
  onReRecord: () => void;
  onTranscribe: () => void;
  onRetry: () => void;
  onSwitchText: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
      {state === "idle" && (
        <>
          <button
            onClick={onStart}
            className="flex h-28 w-28 items-center justify-center rounded-full bg-brand-600 text-white shadow-panel transition-transform active:scale-95"
            aria-label="録音開始"
          >
            <Mic className="text-5xl" />
          </button>
          <p className="mt-4 text-sm font-semibold text-slate-700">
            タップして録音開始
          </p>
          <p className="num mt-1 text-xs text-slate-400">00:00</p>
        </>
      )}

      {state === "recording" && (
        <>
          <button
            onClick={onStop}
            className="relative flex h-28 w-28 items-center justify-center rounded-full bg-rose-600 text-white shadow-panel"
            aria-label="録音停止"
          >
            <span className="absolute inset-0 animate-pulse-rec rounded-full bg-rose-400/50" />
            <Stop className="relative text-4xl" />
          </button>
          <p className="num mt-4 text-2xl font-bold text-slate-800">
            {fmtClock(secs)}
          </p>
          <div className="mt-3 flex h-8 items-end gap-1" aria-hidden>
            {Array.from({ length: 9 }).map((_, i) => {
              const h = 20 + Math.abs(Math.sin(i + level * 6)) * 80;
              return (
                <span
                  key={i}
                  className="w-1.5 rounded-full bg-rose-400"
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>
          <p className="mt-3 text-xs font-medium text-rose-600">録音中…</p>
        </>
      )}

      {state === "recorded" && (
        <>
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100">
            <Play className="text-4xl" />
          </div>
          <p className="num mt-4 text-lg font-bold text-slate-800">
            録音 {fmtClock(secs)}
          </p>
          <div className="mt-5 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <button className="btn-secondary">
              <Play className="text-base" />
              再生
            </button>
            <button onClick={onReRecord} className="btn-secondary">
              <Mic className="text-base" />
              再録音
            </button>
            <button onClick={onTranscribe} className="btn-primary">
              <Sparkles className="text-base" />
              文字起こしへ進む
            </button>
          </div>
        </>
      )}

      {state === "transcribing" && (
        <>
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-4 ring-brand-100">
            <Sparkles className="animate-pulse text-4xl" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">
            文字起こし中…
          </p>
          <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-slate-100">
            <span className="block h-full w-1/2 animate-pulse rounded-full bg-brand-500" />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            処理中はキャンセルできません。少々お待ちください。
          </p>
        </>
      )}

      {state === "transcribed" && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100">
            <Sparkles className="text-3xl" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-700">
            文字起こしが完了しました
          </p>
          <button onClick={onReRecord} className="btn-ghost mt-2 text-sm">
            録音をやり直す
          </button>
        </>
      )}

      {state === "error" && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-4 ring-rose-100">
            <AlertTriangle className="text-3xl" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-700">
            文字起こしに失敗しました
          </p>
          <p className="mt-1 text-xs text-slate-400">
            録音データは保持しています。再送信するか、テキスト入力に切り替えてください。
          </p>
          <div className="mt-4 flex gap-2">
            <button onClick={onRetry} className="btn-primary">
              再送信
            </button>
            <button onClick={onSwitchText} className="btn-secondary">
              テキストで入力
            </button>
          </div>
        </>
      )}
    </div>
  );
}
