"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, X } from "./icons";

export function FocusHeader({
  title,
  subtitle,
  trailing,
  variant = "back",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  variant?: "back" | "close";
}) {
  const router = useRouter();
  return (
    <div className="sticky top-14 z-10 -mx-4 mb-4 flex items-center gap-3 border-b border-slate-200 bg-slate-100/90 px-4 py-2.5 backdrop-blur lg:top-16 lg:-mx-8 lg:px-8">
      <button
        onClick={() => router.back()}
        className="btn-ghost h-10 min-h-0 w-10 px-0 text-slate-600"
        aria-label={variant === "close" ? "閉じる" : "戻る"}
      >
        {variant === "close" ? (
          <X className="text-xl" />
        ) : (
          <ArrowLeft className="text-xl" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-slate-800">{title}</div>
        {subtitle && (
          <div className="truncate text-xs text-slate-500">{subtitle}</div>
        )}
      </div>
      {trailing}
    </div>
  );
}
