"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Download,
  Spreadsheet,
  Upload,
  X,
} from "@/components/icons";
import { PageHeader } from "@/components/ui";
import { yen } from "@/lib/format";

const STEPS = [
  "ファイル選択",
  "シート選択",
  "列マッピング",
  "プレビュー",
  "取り込み設定",
  "完了",
];

const SHEETS = ["単価表2026", "旧単価（2024）", "メモ"];

const SRC_COLUMNS = ["品目名", "単位", "金額", "区分", "備考"];

type TargetField = "name" | "unit" | "price" | "ignore";
const TARGET_LABEL: Record<TargetField, string> = {
  name: "品目名（必須）",
  unit: "単位（必須）",
  price: "単価（必須）",
  ignore: "取り込まない",
};

type RowStatus = "ok" | "warn" | "error";
interface PreviewRow {
  name: string;
  unit: string;
  price: string;
  status: RowStatus;
  msg?: string;
}

const PREVIEW: PreviewRow[] = [
  { name: "足場設置・解体", unit: "m2", price: "900", status: "ok" },
  { name: "高圧洗浄", unit: "m2", price: "250", status: "ok" },
  { name: "外壁 下塗り", unit: "m2", price: "800", status: "ok" },
  { name: "雨樋塗装", unit: "m", price: "800", status: "ok" },
  {
    name: "養生",
    unit: "式",
    price: "15000",
    status: "warn",
    msg: "既存品目と重複（上書き対象）",
  },
  {
    name: "下地補修",
    unit: "箇所",
    price: "0",
    status: "warn",
    msg: "単価が0です",
  },
  { name: "", unit: "m2", price: "1200", status: "error", msg: "品目名が空です" },
  {
    name: "コーキング打替",
    unit: "m",
    price: "応相談",
    status: "error",
    msg: "単価が数値ではありません",
  },
];

export function ImportWizard() {
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sheet, setSheet] = useState(SHEETS[0]);
  const [mapping, setMapping] = useState<Record<string, TargetField>>({
    品目名: "name",
    単位: "unit",
    金額: "price",
    区分: "ignore",
    備考: "ignore",
  });
  const [dupMode, setDupMode] = useState<"skip" | "overwrite" | "add">(
    "overwrite",
  );
  const [filter, setFilter] = useState<"all" | RowStatus>("all");

  const counts = {
    ok: PREVIEW.filter((r) => r.status === "ok").length,
    warn: PREVIEW.filter((r) => r.status === "warn").length,
    error: PREVIEW.filter((r) => r.status === "error").length,
  };
  const importable = counts.ok + counts.warn;

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div>
      <PageHeader
        className="mb-5"
        icon={<Spreadsheet className="text-xl" />}
        title="Excel取込"
        description="単価表のExcelを取り込んで単価マスターを更新します。"
      />

      <Stepper step={step} />

      <div className="mt-5">
        {step === 0 && (
          <UploadStep
            fileName={fileName}
            onPick={() => setFileName("単価表_2026.xlsx")}
            onClear={() => setFileName(null)}
          />
        )}
        {step === 1 && (
          <SheetStep sheet={sheet} onSelect={setSheet} />
        )}
        {step === 2 && (
          <MappingStep mapping={mapping} onChange={setMapping} />
        )}
        {step === 3 && (
          <PreviewStep counts={counts} filter={filter} onFilter={setFilter} />
        )}
        {step === 4 && (
          <SettingsStep
            dupMode={dupMode}
            onDupMode={setDupMode}
            counts={counts}
            importable={importable}
          />
        )}
        {step === 5 && <ResultStep counts={counts} importable={importable} />}
      </div>

      {/* ステップ操作 */}
      {step < 5 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className="btn-secondary disabled:opacity-40"
          >
            戻る
          </button>
          <button
            onClick={next}
            disabled={step === 0 && !fileName}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step === 4 ? "取り込みを実行" : "次へ"}
          </button>
        </div>
      )}
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
      {STEPS.map((label, i) => {
        const state = i < step ? "done" : i === step ? "active" : "todo";
        return (
          <li key={label} className="flex shrink-0 items-center gap-1">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full font-bold ${
                state === "done"
                  ? "bg-emerald-500 text-white"
                  : state === "active"
                    ? "bg-brand-600 text-white"
                    : "bg-slate-200 text-slate-400"
              }`}
            >
              {state === "done" ? <Check className="text-sm" /> : i + 1}
            </span>
            <span
              className={`whitespace-nowrap font-medium ${
                state === "active" ? "text-brand-700" : "text-slate-400"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-1 h-px w-4 bg-slate-200" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function UploadStep({
  fileName,
  onPick,
  onClear,
}: {
  fileName: string | null;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-4">
      {fileName ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <Spreadsheet className="text-2xl text-emerald-600" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-slate-800">{fileName}</div>
            <div className="text-xs text-emerald-700">
              読み取り完了・8行を検出しました
            </div>
          </div>
          <button onClick={onClear} className="btn-ghost h-9 min-h-0 w-9 px-0">
            <X className="text-lg" />
          </button>
        </div>
      ) : (
        <button
          onClick={onPick}
          className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center transition-colors hover:border-brand-300 hover:bg-brand-50/30"
        >
          <Upload className="text-4xl text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            ここにファイルをドロップ、またはタップして選択
          </p>
          <p className="mt-1 text-xs text-slate-400">
            対応形式：.xlsx / .xls（最大10MB）。先頭シートを自動で読み取ります。
          </p>
        </button>
      )}

      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
        <span className="text-slate-600">
          様式に迷う場合は標準テンプレートをご利用ください。
        </span>
        <button className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
          <Download className="text-sm" />
          テンプレート
        </button>
      </div>
    </div>
  );
}

function SheetStep({
  sheet,
  onSelect,
}: {
  sheet: string;
  onSelect: (s: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm text-slate-600">
        取り込むシートを選択してください。
      </p>
      <div className="space-y-2">
        {SHEETS.map((s) => (
          <label
            key={s}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
              sheet === s
                ? "border-brand-400 bg-brand-50/60 ring-1 ring-brand-300"
                : "border-slate-200 bg-white"
            }`}
          >
            <input
              type="radio"
              name="sheet"
              checked={sheet === s}
              onChange={() => onSelect(s)}
              className="h-4 w-4 accent-brand-600"
            />
            <Spreadsheet className="text-lg text-slate-400" />
            <span className="font-medium text-slate-700">{s}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function MappingStep({
  mapping,
  onChange,
}: {
  mapping: Record<string, TargetField>;
  onChange: (m: Record<string, TargetField>) => void;
}) {
  const required: TargetField[] = ["name", "unit", "price"];
  const mapped = new Set(Object.values(mapping));
  const missing = required.filter((r) => !mapped.has(r));

  return (
    <div>
      <p className="mb-3 text-sm text-slate-600">
        Excelの列を単価マスターの項目に対応づけます。
        <span className="text-slate-400">（候補は自動推定済み）</span>
      </p>
      {missing.length > 0 && (
        <p className="mb-3 flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
          <AlertTriangle className="text-sm" />
          必須項目が未割当：
          {missing.map((m) => TARGET_LABEL[m].replace("（必須）", "")).join("・")}
        </p>
      )}
      <div className="space-y-2">
        {SRC_COLUMNS.map((col) => {
          const guessed = col === "金額"; // 推定精度が低い列の例
          return (
            <div
              key={col}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-700">{col}</div>
                {guessed && mapping[col] === "price" && (
                  <div className="text-[11px] text-amber-600">
                    「金額」を単価として推定しました。ご確認ください。
                  </div>
                )}
              </div>
              <span className="text-slate-300">→</span>
              <select
                value={mapping[col]}
                onChange={(e) =>
                  onChange({ ...mapping, [col]: e.target.value as TargetField })
                }
                className="field-input h-10 min-h-0 w-44 py-0 text-sm"
              >
                {(Object.keys(TARGET_LABEL) as TargetField[]).map((t) => (
                  <option key={t} value={t}>
                    {TARGET_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PreviewStep({
  counts,
  filter,
  onFilter,
}: {
  counts: { ok: number; warn: number; error: number };
  filter: "all" | RowStatus;
  onFilter: (f: "all" | RowStatus) => void;
}) {
  const rows = PREVIEW.filter((r) => filter === "all" || r.status === filter);
  return (
    <div>
      <div className="mb-3 grid grid-cols-3 gap-2">
        <CountTile label="正常" value={counts.ok} tone="emerald" />
        <CountTile label="警告" value={counts.warn} tone="amber" />
        <CountTile label="エラー" value={counts.error} tone="rose" />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {(
          [
            ["all", "すべて"],
            ["ok", "正常のみ"],
            ["warn", "警告のみ"],
            ["error", "エラーのみ"],
          ] as ["all" | RowStatus, string][]
        ).map(([val, label]) => (
          <button
            key={val}
            onClick={() => onFilter(val)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              filter === val
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-500 ring-1 ring-inset ring-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
              <th className="px-3 py-2.5">状態</th>
              <th className="px-3 py-2.5">品目名</th>
              <th className="px-3 py-2.5">単位</th>
              <th className="px-3 py-2.5 text-right">単価</th>
              <th className="px-3 py-2.5">メモ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className={`border-b border-slate-100 last:border-0 ${
                  r.status === "error"
                    ? "bg-rose-50/50"
                    : r.status === "warn"
                      ? "bg-amber-50/50"
                      : ""
                }`}
              >
                <td className="px-3 py-2.5">
                  <StatusDot status={r.status} />
                </td>
                <td className="px-3 py-2.5 text-slate-700">
                  {r.name || (
                    <span className="text-rose-500">（空）</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-slate-600">{r.unit}</td>
                <td className="num px-3 py-2.5 text-right text-slate-700">
                  {r.price}
                </td>
                <td className="px-3 py-2.5 text-xs text-slate-500">
                  {r.msg ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        エラー行は取り込まれません。修正後に再アップロードしてください。
      </p>
    </div>
  );
}

function SettingsStep({
  dupMode,
  onDupMode,
  counts,
  importable,
}: {
  dupMode: "skip" | "overwrite" | "add";
  onDupMode: (m: "skip" | "overwrite" | "add") => void;
  counts: { ok: number; warn: number; error: number };
  importable: number;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-2 text-sm font-bold text-slate-700">
          重複品目（品目名・単位が一致）の扱い
        </h2>
        <div className="space-y-2">
          {(
            [
              ["overwrite", "上書きする", "既存の単価を新しい値で更新します。"],
              ["skip", "スキップする", "既存品目は変更せず、新規のみ追加します。"],
              ["add", "別品目として追加", "重複を気にせず新しい行として登録します。"],
            ] as ["skip" | "overwrite" | "add", string, string][]
          ).map(([val, label, desc]) => (
            <label
              key={val}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 ${
                dupMode === val
                  ? "border-brand-400 bg-brand-50/60 ring-1 ring-brand-300"
                  : "border-slate-200 bg-white"
              }`}
            >
              <input
                type="radio"
                name="dup"
                checked={dupMode === val}
                onChange={() => onDupMode(val)}
                className="mt-0.5 h-4 w-4 accent-brand-600"
              />
              <span>
                <span className="font-semibold text-slate-800">{label}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{desc}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="mb-2 text-sm font-bold text-slate-700">実行前の確認</h2>
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">取り込み予定</dt>
            <dd className="num font-semibold text-emerald-700">{importable} 件</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">うち警告あり</dt>
            <dd className="num font-semibold text-amber-700">{counts.warn} 件</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">除外（エラー）</dt>
            <dd className="num font-semibold text-rose-700">{counts.error} 件</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function ResultStep({
  counts,
  importable,
}: {
  counts: { ok: number; warn: number; error: number };
  importable: number;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100">
        <Check className="text-3xl" />
      </div>
      <h2 className="mt-3 text-base font-bold text-slate-800">
        取り込みが完了しました
      </h2>
      <div className="mx-auto mt-4 grid max-w-sm grid-cols-3 gap-2">
        <CountTile label="成功" value={importable} tone="emerald" />
        <CountTile label="警告" value={counts.warn} tone="amber" />
        <CountTile label="失敗" value={counts.error} tone="rose" />
      </div>
      {counts.error > 0 && (
        <button className="mx-auto mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
          <Download className="text-sm" />
          失敗した {counts.error} 件の理由をダウンロード
        </button>
      )}
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <Link href="/price-items" className="btn-primary">
          単価マスター一覧へ
        </Link>
        <Link href="/import" className="btn-secondary">
          別ファイルを取り込む
        </Link>
      </div>
    </div>
  );
}

function CountTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "amber" | "rose";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  return (
    <div
      className={`rounded-xl px-3 py-2.5 text-center ring-1 ring-inset ${tones[tone]}`}
    >
      <div className="num text-xl font-bold">{value}</div>
      <div className="text-[11px] font-medium">{label}</div>
    </div>
  );
}

function StatusDot({ status }: { status: RowStatus }) {
  if (status === "ok")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
        <Check className="text-sm" />
        正常
      </span>
    );
  if (status === "warn")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
        <AlertTriangle className="text-sm" />
        警告
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
      <X className="text-sm" />
      エラー
    </span>
  );
}
