import Link from "next/link";
import { EstimateCard } from "@/components/EstimateCard";
import {
  ChevronRight,
  Mic,
  Plus,
  Spreadsheet,
  Users,
} from "@/components/icons";
import { SectionCard, StatTile } from "@/components/ui";
import { currentUser, estimates } from "@/lib/mock";

export default function DashboardPage() {
  const draft = estimates.filter((e) => e.status === "draft");
  const aiUnconfirmed = estimates.filter((e) => e.hasUnconfirmedAi);
  const submitted = estimates.filter((e) => e.status === "submitted");
  const won = estimates.filter((e) => e.status === "won");

  const resume = estimates
    .filter((e) => e.status === "draft" || e.hasUnconfirmedAi)
    .slice(0, 3);
  const recent = [...estimates]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          こんにちは、{currentUser.name} さん
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          現場で話すだけ。AIが見積の下書きを作ります。
        </p>
      </div>

      {/* 主役CTA: 音声で見積作成 */}
      <Link
        href="/estimates/new/edit"
        className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-panel"
      >
        <div className="relative z-10 flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
            <Mic className="text-3xl" />
          </span>
          <div className="min-w-0">
            <div className="text-lg font-bold">音声で見積作成</div>
            <div className="mt-0.5 text-sm text-white/80">
              顧客を選んで、聞いた内容を話すだけ
            </div>
          </div>
          <ChevronRight className="ml-auto text-2xl text-white/70 transition-transform group-hover:translate-x-1" />
        </div>
        <div className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/10" />
      </Link>

      {/* サマリー */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="下書き" value={draft.length} accent="brand" hint="作成途中の見積" />
        <StatTile
          label="AI未確認"
          value={aiUnconfirmed.length}
          accent="amber"
          hint="確認待ちの解析結果"
        />
        <StatTile label="提出済み" value={submitted.length} accent="sky" hint="顧客へ提出" />
        <StatTile label="受注" value={won.length} accent="emerald" hint="成約した見積" />
      </div>

      {/* ショートカット */}
      <div className="grid grid-cols-3 gap-3">
        <ShortcutTile href="/estimates/new/edit" icon={<Plus />} label="新規見積" />
        <ShortcutTile href="/import" icon={<Spreadsheet />} label="Excel取込" />
        <ShortcutTile href="/customers" icon={<Users />} label="顧客管理" />
      </div>

      {/* 再開導線 */}
      {resume.length > 0 && (
        <SectionCard
          title="作業を再開"
          trailing={
            <Link
              href="/estimates"
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              すべて見る
            </Link>
          }
        >
          <div className="space-y-3">
            {resume.map((e) => (
              <EstimateCard key={e.id} estimate={e} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* 最近の見積 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700">最近の見積</h2>
          <Link
            href="/estimates"
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            見積一覧へ
          </Link>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {recent.map((e) => (
            <EstimateCard key={e.id} estimate={e} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ShortcutTile({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="card flex flex-col items-center justify-center gap-2 px-2 py-4 text-center transition-colors hover:border-brand-200 hover:bg-brand-50/40"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-xl text-brand-600">
        {icon}
      </span>
      <span className="text-xs font-semibold text-slate-700">{label}</span>
    </Link>
  );
}
