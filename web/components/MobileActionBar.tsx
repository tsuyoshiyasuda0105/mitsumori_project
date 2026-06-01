import type { ReactNode } from "react";

/** 集中作業画面の下部固定アクションバー（モバイルのみ）。 */
export function MobileActionBar({ children }: { children: ReactNode }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden"
      style={{ paddingBottom: "calc(0.625rem + var(--safe-bottom))" }}
    >
      <div className="mx-auto flex max-w-md items-center gap-2">{children}</div>
    </div>
  );
}
