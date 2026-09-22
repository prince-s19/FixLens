"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap";
  const variants: Record<string, string> = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-sm shadow-orange-600/20",
    secondary: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
      {icon ? <div className="mb-4 text-slate-300">{icon}</div> : null}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-shimmer rounded-lg ${className}`} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02] ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-slate-900">{children}</h2>
      {subtitle ? <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}
