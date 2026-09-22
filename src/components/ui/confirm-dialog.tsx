"use client";

import { useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/misc";

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    danger?: boolean;
    resolve?: (value: boolean) => void;
  }>({ open: false, title: "" });

  const confirm = (opts: { title: string; description?: string; confirmLabel?: string; danger?: boolean }) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...opts, open: true, resolve });
    });
  };

  const dialog: ReactNode = state.open ? (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="animate-fade-in-up w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              state.danger ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{state.title}</h3>
            {state.description ? <p className="mt-1 text-sm text-slate-500">{state.description}</p> : null}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              state.resolve?.(false);
              setState((s) => ({ ...s, open: false }));
            }}
          >
            Cancel
          </Button>
          <Button
            variant={state.danger ? "danger" : "primary"}
            size="sm"
            onClick={() => {
              state.resolve?.(true);
              setState((s) => ({ ...s, open: false }));
            }}
          >
            {state.confirmLabel ?? "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, dialog };
}
