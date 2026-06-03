"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Bell,
  Building,
  FileText,
  HelpCircle,
  Home,
  Plus,
  Settings,
  Spreadsheet,
  TagIcon,
  Users,
} from "./icons";
import { company, currentUser } from "@/lib/mock";

interface NavItem {
  href: string;
  label: string;
  icon: (p: { className?: string }) => ReactNode;
}

const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "ダッシュボード", icon: Home },
  { href: "/estimates", label: "見積", icon: FileText },
  { href: "/customers", label: "顧客", icon: Users },
  { href: "/price-items", label: "単価マスター", icon: TagIcon },
  { href: "/import", label: "Excel取込", icon: Spreadsheet },
  { href: "/settings", label: "会社設定", icon: Settings },
];

const MOBILE_NAV: NavItem[] = [
  { href: "/dashboard", label: "ホーム", icon: Home },
  { href: "/estimates", label: "見積", icon: FileText },
  { href: "/customers", label: "顧客", icon: Users },
  { href: "/price-items", label: "単価", icon: TagIcon },
];

function useIsActive() {
  const path = usePathname();
  return (href: string) =>
    href === "/dashboard" ? path === "/dashboard" : path.startsWith(href);
}

const FOCUS_LEAVES = ["edit", "voice", "ai-review", "meeting", "export"];

/** 見積の集中作業画面ではモバイルのグローバルタブを隠す（各画面が独自の下部バーを持つ）。 */
function useIsFocused() {
  const path = usePathname();
  const seg = path.split("/").filter(Boolean);
  return (
    seg[0] === "estimates" &&
    seg.length >= 3 &&
    FOCUS_LEAVES.includes(seg[seg.length - 1])
  );
}

function Sidebar() {
  const isActive = useIsActive();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Building className="text-lg" />
        </span>
        <div className="leading-tight">
          <div className="text-[13px] font-bold text-slate-800">ボイス見積</div>
          <div className="text-[10px] text-slate-400">AI Estimate</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {PRIMARY_NAV.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="text-lg" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
            {currentUser.name.slice(0, 1)}
          </span>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[13px] font-semibold text-slate-700">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-slate-400">
              {currentUser.role === "admin" ? "管理者" : "一般担当者"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:h-16 lg:pl-8">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Building className="text-base" />
        </span>
        <span className="text-sm font-bold text-slate-800">ボイス見積</span>
      </div>
      <div className="hidden text-sm font-semibold text-slate-500 lg:block">
        {company.name}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <button className="btn-ghost h-10 min-h-0 w-10 px-0" aria-label="ヘルプ">
          <HelpCircle className="text-xl" />
        </button>
        <button
          className="btn-ghost relative h-10 min-h-0 w-10 px-0"
          aria-label="通知"
        >
          <Bell className="text-xl" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
        </button>
        <span className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600 lg:hidden">
          {currentUser.name.slice(0, 1)}
        </span>
      </div>
    </header>
  );
}

function BottomNav() {
  const isActive = useIsActive();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-end">
        {MOBILE_NAV.slice(0, 2).map((item) => (
          <NavTab key={item.href} item={item} active={isActive(item.href)} />
        ))}

        <div className="flex justify-center">
          <Link
            href="/estimates/new/edit"
            className="-mt-5 flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-brand-600 text-white shadow-panel active:bg-brand-700"
            aria-label="新規見積"
          >
            <Plus className="text-2xl" />
            <span className="text-[10px] font-semibold">新規</span>
          </Link>
        </div>

        {MOBILE_NAV.slice(2).map((item) => (
          <NavTab key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </div>
    </nav>
  );
}

function NavTab({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
        active ? "text-brand-700" : "text-slate-500"
      }`}
    >
      <Icon className="text-xl" />
      {item.label}
    </Link>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const focused = useIsFocused();
  return (
    <div className="min-h-screen lg:pl-60">
      <Sidebar />
      <TopBar />
      <main
        className={`mx-auto w-full max-w-6xl px-4 pt-4 lg:px-8 lg:pb-10 lg:pt-6 ${
          focused ? "pb-24" : "pb-28"
        }`}
      >
        {children}
      </main>
      {!focused && <BottomNav />}
    </div>
  );
}
