"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LifeBuoy, Trash2 } from "lucide-react";
import { EscalationStatusBadge, UrgencyBadge } from "@/components/ui/badges";
import { Button, Card, EmptyState } from "@/components/ui/misc";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

export type EscalationRow = {
  id: string;
  repairRequestId: string;
  technicianId: string | null;
  reason: string;
  urgency: "low" | "medium" | "high";
  status: "pending" | "accepted" | "in_progress" | "resolved" | "cancelled";
  notes: string;
  createdAt: string | Date;
  repairTitle: string | null;
  repairCategory: string | null;
  repairPhoto: string | null;
  technicianName: string | null;
  technicianPhone: string | null;
};

const STATUS_FLOW: Record<EscalationRow["status"], EscalationRow["status"] | null> = {
  pending: "accepted",
  accepted: "in_progress",
  in_progress: "resolved",
  resolved: null,
  cancelled: null,
};

const NEXT_LABEL: Record<string, string> = {
  accepted: "Mark accepted",
  in_progress: "Start work",
  resolved: "Mark resolved",
};

export function EscalationsClient({ initialEscalations }: { initialEscalations: EscalationRow[] }) {
  const [escalations, setEscalations] = useState(initialEscalations);
  const { confirm, dialog } = useConfirm();
  const toast = useToast();

  const advance = async (row: EscalationRow) => {
    const next = STATUS_FLOW[row.status];
    if (!next) return;
    const previous = escalations;
    setEscalations((prev) => prev.map((e) => (e.id === row.id ? { ...e, status: next } : e)));
    const res = await fetch(`/api/escalations/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      setEscalations(previous);
      toast.show({ kind: "error", title: "Couldn't update escalation" });
    } else {
      toast.show({ kind: "success", title: `Escalation ${next.replace("_", " ")}` });
    }
  };

  const cancel = async (row: EscalationRow) => {
    const ok = await confirm({
      title: "Cancel this escalation?",
      description: "The repair will remain in your list, but this escalation will be closed.",
      confirmLabel: "Cancel escalation",
      danger: true,
    });
    if (!ok) return;
    const previous = escalations;
    setEscalations((prev) => prev.map((e) => (e.id === row.id ? { ...e, status: "cancelled" } : e)));
    const res = await fetch(`/api/escalations/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    if (!res.ok) {
      setEscalations(previous);
      toast.show({ kind: "error", title: "Couldn't cancel escalation" });
    }
  };

  const remove = async (row: EscalationRow) => {
    const ok = await confirm({
      title: "Delete this escalation record?",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const previous = escalations;
    setEscalations((prev) => prev.filter((e) => e.id !== row.id));
    const res = await fetch(`/api/escalations/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      setEscalations(previous);
      toast.show({ kind: "error", title: "Couldn't delete escalation" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {dialog}
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Technician escalations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Repairs flagged as unsafe or too complex for DIY, routed to your trusted technicians.
        </p>
      </div>

      {escalations.length === 0 ? (
        <EmptyState
          icon={<LifeBuoy className="h-10 w-10" />}
          title="No escalations yet"
          description="When a repair is flagged as unsafe or complex, you can escalate it to a technician from the repair's detail page."
        />
      ) : (
        <div className="space-y-3">
          {escalations.map((e) => {
            const next = STATUS_FLOW[e.status];
            return (
              <Card key={e.id} className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    {e.repairPhoto ? (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <Image src={e.repairPhoto} alt={e.repairTitle ?? ""} fill className="object-cover" />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <EscalationStatusBadge status={e.status} />
                        <UrgencyBadge urgency={e.urgency} />
                      </div>
                      <Link
                        href={`/dashboard/repairs/${e.repairRequestId}`}
                        className="mt-1 block text-sm font-semibold text-slate-900 hover:text-orange-600"
                      >
                        {e.repairTitle ?? "Repair"}
                      </Link>
                      <p className="mt-0.5 text-sm text-slate-500">{e.reason}</p>
                      {e.technicianName ? (
                        <p className="mt-1 text-xs text-slate-400">
                          Assigned to <span className="font-medium text-slate-600">{e.technicianName}</span>
                          {e.technicianPhone ? ` · ${e.technicianPhone}` : ""}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400">Not yet assigned to a technician</p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {next ? (
                      <Button size="sm" onClick={() => advance(e)}>
                        {NEXT_LABEL[next]}
                      </Button>
                    ) : null}
                    {e.status !== "resolved" && e.status !== "cancelled" ? (
                      <Button size="sm" variant="outline" onClick={() => cancel(e)}>
                        Cancel
                      </Button>
                    ) : null}
                    <button onClick={() => remove(e)} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
