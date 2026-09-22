"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export function DashboardShell({ userName, children }: { userName: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">
          <Sidebar />
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <div className="relative w-64 max-w-[80%]">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-lg bg-white/10 p-1.5 text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <Topbar userName={userName} onMenuClick={() => setOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
