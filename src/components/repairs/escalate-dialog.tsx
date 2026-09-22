"use client";

import { useEffect, useState } from "react";
import { LifeBuoy, X } from "lucide-react";
import { Button } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import type { Technician } from "@/db/schema";

export function EscalateDialog({
  repairId,
  defaultReason,
  onEscalated,
}: {
  repairId: string;
  defaultReason: string;
  onEscalated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(defaultReason);
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("high");
  const [technicianId, setTechnicianId] = useState<string>("");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    fetch("/api/technicians")
      .then((r) => r.json())
      .then((d) => setTechnicians(d.technicians ?? []))
      .catch(() => {});
  }, [open]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/escalations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repairRequestId: repairId,
          reason,
          urgency,
          technicianId: technicianId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.show({ kind: "error", title: "Couldn't escalate", description: data.error });
        return;
      }
      toast.show({ kind: "success", title: "Escalated to a technician", description: "We'll route this to the right expert." });
      setOpen(false);
      onEscalated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        <LifeBuoy className="h-4 w-4" /> Escalate to technician
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="animate-fade-in-up w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                  <LifeBuoy className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Escalate to a technician</h3>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">What's the issue?</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Urgency</label>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUrgency(u)}
                      className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium capitalize transition ${
                        urgency === u
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Assign technician (optional)
                </label>
                <select
                  value={technicianId}
                  onChange={(e) => setTechnicianId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">Auto-assign later</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.specialty}
                    </option>
                  ))}
                </select>
                {technicians.length === 0 ? (
                  <p className="mt-1 text-xs text-slate-400">No technicians saved yet — you can add one in the Technicians tab.</p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={submit} loading={submitting} disabled={!reason.trim()}>
                Send escalation
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
