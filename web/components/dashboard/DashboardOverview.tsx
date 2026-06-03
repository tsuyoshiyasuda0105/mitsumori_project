import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileText,
  Mic,
  Sparkles,
  TagIcon,
} from "@/components/icons";
import {
  dashboardKpis,
  memoSamples,
  priceMasterChecks,
  recentDashboardEstimates,
  voiceToEstimateFlow,
  type DashboardEstimate,
  type DashboardKpiTone,
} from "@/lib/demo-data";

const kpiToneClass: Record<DashboardKpiTone, string> = {
  brand: "from-brand-600 to-brand-800 text-white",
  amber: "from-amber-400 to-orange-500 text-white",
  sky: "from-sky-400 to-cyan-600 text-white",
  emerald: "from-emerald-400 to-teal-600 text-white",
};

const statusToneClass: Record<DashboardEstimate["statusTone"], string> = {
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-panel">
        <div className="relative grid gap-6 bg-gradient-to-br from-slate-950 via-brand-900 to-slate-900 p-5 text-white lg:grid-cols-[1.25fr_0.75fr] lg:p-7">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
              <Sparkles className="text-sm" />
              ログイン後デモ管理画面
            </div>
            <h1 className="text-2xl font-bold leading-tight lg:text-3xl">
              音声から見積書まで、今日の作業をここから進めます。
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
              最近の見積、AI確認、単価マスター、社内メモ分離をひと目で確認できる静的デモです。
              実バックエンド接続前でも商談で操作イメージを伝えられるようにしています。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/estimates/demo-001/voice" className="btn bg-white text-brand-800 hover:bg-brand-50">
                <Mic className="text-lg" />
                音声から見積作成
              </Link>
              <Link href="/estimates" className="btn border border-white/25 bg-white/10 text-white hover:bg-white/15">
                <FileText className="text-lg" />
                見積一覧を見る
              </Link>
            </div>
          </div>

          <div className="relative rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-white/60">次にやること</p>
                <p className="mt-1 text-lg font-bold">確認待ち 5件を解消</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-amber-950">
                <AlertTriangle className="text-xl" />
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-white/80">
              <p>・AI抽出結果の数量確認</p>
              <p>・単価マスターとの差分確認</p>
              <p>・PDFに出さない社内メモの確認</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardKpis.map((kpi) => (
          <div key={kpi.label} className={`rounded-2xl bg-gradient-to-br p-4 shadow-card ${kpiToneClass[kpi.tone]}`}>
            <p className="text-xs font-semibold opacity-80">{kpi.label}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="num text-3xl font-bold">{kpi.value}</p>
              <span className="rounded-full bg-white/20 px-2 py-1 text-[11px] font-semibold">
                {kpi.hint}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="card overflow-hidden">
          <SectionHeader icon={<FileText />} title="最近の見積" href="/estimates" cta="すべて見る" />
          <div className="divide-y divide-slate-100">
            {recentDashboardEstimates.map((estimate) => (
              <EstimateRow key={estimate.id} estimate={estimate} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card overflow-hidden">
            <SectionHeader icon={<Mic />} title="音声入力から明細化" href="/estimates/demo-001/voice" cta="開始" />
            <div className="space-y-3 p-4">
              {voiceToEstimateFlow.map((step, index) => (
                <Link
                  key={step.title}
                  href={step.href}
                  className="group flex gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-brand-700 shadow-card">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-800">{step.title}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">{step.description}</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                      {step.cta}
                      <ChevronRight className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <QuickAction
              href="/price-items"
              icon={<TagIcon />}
              title="単価マスター確認"
              description="頻出項目と更新候補を確認"
            />
            <QuickAction
              href="/estimates/demo-002/export"
              icon={<Download />}
              title="Excel/PDF出力待ち"
              description="社内メモを除外して出力"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <SectionHeader icon={<TagIcon />} title="単価マスターの確認ポイント" href="/price-items" cta="単価一覧へ" />
          <div className="space-y-3 p-4">
            {priceMasterChecks.map((item) => (
              <div key={item.item} className="rounded-2xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.item}</p>
                    <p className="num mt-1 text-sm font-semibold text-slate-600">{item.unitPrice}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${
                      item.risk === "更新候補"
                        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                        : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    }`}
                  >
                    {item.risk === "更新候補" ? <AlertTriangle /> : <Check />}
                    {item.risk}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <SectionHeader icon={<EyeOff />} title="社内メモ分離" href="/estimates/demo-001/edit" cta="編集画面へ" />
          <div className="space-y-3 p-4">
            {memoSamples.map((memo) => (
              <div key={memo.estimateNo} className="rounded-2xl border border-slate-200 p-3">
                <p className="num text-xs font-bold text-slate-400">{memo.estimateNo}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <MemoBox icon={<Eye />} label="顧客向け / PDF表示" text={memo.customerMemo} tone="customer" />
                  <MemoBox icon={<EyeOff />} label="社内メモ / PDF非表示" text={memo.internalMemo} tone="internal" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ icon, title, href, cta }: { icon: ReactNode; title: string; href: string; cta: string }) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <span className="text-brand-600">{icon}</span>
        {title}
      </h2>
      <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">
        {cta}
        <ChevronRight />
      </Link>
    </header>
  );
}

function EstimateRow({ estimate }: { estimate: DashboardEstimate }) {
  return (
    <Link
      href={`/estimates/${estimate.id}/edit`}
      className="group grid gap-3 p-4 transition-colors hover:bg-brand-50/35 sm:grid-cols-[1fr_auto] sm:items-center"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${statusToneClass[estimate.statusTone]}`}>
            {estimate.status}
          </span>
          <span className="num text-xs font-semibold text-slate-400">{estimate.estimateNo}</span>
          <span className="text-xs text-slate-400">{estimate.updatedAt}</span>
        </div>
        <p className="mt-2 truncate text-sm font-bold text-slate-800">{estimate.title}</p>
        <p className="mt-1 truncate text-xs text-slate-500">{estimate.customer}</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">{estimate.nextAction}</p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <span className="num text-base font-bold text-slate-900">{estimate.amount}</span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
          開く
          <ChevronRight className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function QuickAction({ href, icon, title, description }: { href: string; icon: ReactNode; title: string; description: string }) {
  return (
    <Link href={href} className="card flex items-center gap-3 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/35">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-xl text-brand-700">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-slate-800">{title}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
      </span>
      <ChevronRight className="text-slate-300" />
    </Link>
  );
}

function MemoBox({
  icon,
  label,
  text,
  tone,
}: {
  icon: ReactNode;
  label: string;
  text: string;
  tone: "customer" | "internal";
}) {
  const toneClass =
    tone === "customer"
      ? "border-sky-200 bg-sky-50/70 text-sky-800"
      : "border-amber-200 bg-amber-50/75 text-amber-900";

  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <p className="flex items-center gap-1.5 text-[11px] font-bold">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-xs leading-5">{text}</p>
    </div>
  );
}
