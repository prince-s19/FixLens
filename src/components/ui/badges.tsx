import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Wrench,
} from "lucide-react";

function Pill({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: ReactNode }> = {
    analyzing: {
      label: "Analyzing",
      cls: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    ready: {
      label: "Plan ready",
      cls: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    in_progress: {
      label: "In progress",
      cls: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
      icon: <Wrench className="h-3 w-3" />,
    },
    completed: {
      label: "Completed",
      cls: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    escalated: {
      label: "Escalated",
      cls: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
      icon: <AlertTriangle className="h-3 w-3" />,
    },
  };
  const item = map[status] ?? map.ready;
  return (
    <Pill className={item.cls}>
      {item.icon}
      {item.label}
    </Pill>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, string> = {
    easy: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    medium: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    hard: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  };
  return (
    <Pill className={map[difficulty] ?? map.medium}>
      <Wrench className="h-3 w-3" />
      {difficulty[0].toUpperCase() + difficulty.slice(1)}
    </Pill>
  );
}

export function SafetyBadge({ level }: { level: string }) {
  const map: Record<string, { label: string; cls: string; icon: ReactNode }> = {
    safe: {
      label: "Safe for DIY",
      cls: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
      icon: <ShieldCheck className="h-3 w-3" />,
    },
    caution: {
      label: "Use caution",
      cls: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
      icon: <ShieldQuestion className="h-3 w-3" />,
    },
    unsafe: {
      label: "Unsafe — escalate",
      cls: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
      icon: <ShieldAlert className="h-3 w-3" />,
    },
  };
  const item = map[level] ?? map.safe;
  return (
    <Pill className={item.cls}>
      {item.icon}
      {item.label}
    </Pill>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    minor: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
    moderate: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
    severe: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  };
  return <Pill className={map[severity] ?? map.moderate}>{severity[0].toUpperCase() + severity.slice(1)} damage</Pill>;
}

export function UrgencyBadge({ urgency }: { urgency: string }) {
  const map: Record<string, string> = {
    low: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
    medium: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    high: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  };
  return <Pill className={map[urgency] ?? map.medium}>{urgency[0].toUpperCase() + urgency.slice(1)} urgency</Pill>;
}

export function EscalationStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200" },
    accepted: { label: "Accepted", cls: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200" },
    in_progress: { label: "In progress", cls: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200" },
    resolved: { label: "Resolved", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200" },
    cancelled: { label: "Cancelled", cls: "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200" },
  };
  const item = map[status] ?? map.pending;
  return <Pill className={item.cls}>{item.label}</Pill>;
}

export function TimeCostPill({ minutes, costMin, costMax }: { minutes: number; costMin: number; costMax: number }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" /> ~{minutes} min
      </span>
      <span className="inline-flex items-center gap-1">
        ₹{costMin}–₹{costMax}
      </span>
    </div>
  );
}
