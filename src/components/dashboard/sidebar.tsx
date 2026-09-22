"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  History,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Users,
  Wrench,
  Plus,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/repairs", label: "Repair cases", icon: Wrench },
  { href: "/dashboard/guides", label: "Saved guides", icon: BookOpen },
  { href: "/dashboard/history", label: "Repair history", icon: History },
  { href: "/dashboard/escalations", label: "Escalations", icon: LifeBuoy },
  { href: "/dashboard/technicians", label: "Technicians", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-300">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/30">
          <Wrench className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-extrabold tracking-tight text-white">FixLens</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-400">for iQOO Users</span>
        </div>
      </div>

      <div className="px-4">
        <Link
          href="/dashboard/repairs/new"
          onClick={onNavigate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-950/40 transition hover:bg-orange-700"
        >
          <Plus className="h-4 w-4" /> New repair
        </Link>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4 text-xs text-slate-500">
        Built for iQOO &amp; everyday fixers.
        <br />
        AI guidance is not a substitute for professional repair.
      </div>
    </div>
  );
}
