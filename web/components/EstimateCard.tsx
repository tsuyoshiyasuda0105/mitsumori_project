import Link from "next/link";
import { ChevronRight, Sparkles } from "./icons";
import { AiTag, StatusBadge } from "./ui";
import { computeTotals } from "@/lib/calc";
import { fmtDate } from "@/lib/format";
import { yen } from "@/lib/format";
import { customerName } from "@/lib/mock";
import type { Estimate } from "@/lib/types";

export function EstimateCard({ estimate }: { estimate: Estimate }) {
  const { total } = computeTotals(estimate.lines);
  return (
    <Link
      href={`/estimates/${estimate.id}/edit`}
      className="card flex items-center gap-3 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/30"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <StatusBadge status={estimate.status} />
          {estimate.hasUnconfirmedAi && <AiTag>AI未確認</AiTag>}
        </div>
        <div className="mt-1.5 truncate text-sm font-bold text-slate-800">
          {estimate.title || "（件名未入力）"}
        </div>
        <div className="mt-0.5 truncate text-xs text-slate-500">
          {customerName(estimate.customerId)} ・ {estimate.estimateNo}
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
          <span>見積日 {fmtDate(estimate.estimateDate)}</span>
          <span>担当 {estimate.assignee}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 text-right">
        <span className="num text-base font-bold text-slate-800">
          {estimate.lines.length ? yen(total) : "—"}
        </span>
        <ChevronRight className="text-lg text-slate-300" />
      </div>
    </Link>
  );
}
