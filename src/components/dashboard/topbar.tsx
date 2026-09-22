"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, User as UserIcon } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function Topbar({
  userName,
  title,
  onMenuClick,
}: {
  userName: string;
  title?: string;
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    toast.show({ kind: "info", title: "Signed out", description: "See you again soon!" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title ? <h1 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h1> : null}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 sm:flex">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-700">
            <UserIcon className="h-3.5 w-3.5" />
          </div>
          {userName}
        </div>
        <button
          onClick={logout}
          disabled={loggingOut}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </header>
  );
}
