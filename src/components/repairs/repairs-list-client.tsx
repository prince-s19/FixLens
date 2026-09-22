"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Trash2, Wrench } from "lucide-react";
import type { RepairRequest } from "@/db/schema";
import { StatusBadge, DifficultyBadge, TimeCostPill } from "@/components/ui/badges";
import { Button, EmptyState } from "@/components/ui/misc";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { CATEGORY_OPTIONS } from "@/lib/repairKnowledge";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "analyzing", label: "Analyzing" },
  { value: "ready", label: "Plan ready" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "escalated", label: "Escalated" },
];

export function RepairsListClient({ initialRepairs }: { initialRepairs: RepairRequest[] }) {
  const [repairs, setRepairs] = useState(initialRepairs);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const { confirm, dialog } = useConfirm();
  const toast = useToast();

  const filtered = useMemo(() => {
    return repairs.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (category !== "all" && r.category !== category) return false;
      if (query && !`${r.title} ${r.objectLabel}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [repairs, query, status, category]);

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm({
      title: `Delete "${title}"?`,
      description: "This will permanently remove this repair and its history.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    const previous = repairs;
    setRepairs((prev) => prev.filter((r) => r.id !== id));

    const res = await fetch(`/api/repairs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setRepairs(previous);
      toast.show({ kind: "error", title: "Couldn't delete repair" });
    } else {
      toast.show({ kind: "success", title: "Repair deleted" });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {dialog}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Repair requests</h1>
          <p className="mt-1 text-sm text-slate-500">All the repairs FixIt AI has generated for you.</p>
        </div>
        <Link href="/dashboard/repairs/new">
          <Button>
            <Plus className="h-4 w-4" /> New repair
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repairs…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">All categories</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              status === f.value ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-10 w-10" />}
          title={repairs.length === 0 ? "No repairs yet" : "No repairs match your filters"}
          description={
            repairs.length === 0
              ? "Start by uploading a photo of something broken — FixIt AI will do the rest."
              : "Try adjusting your search or filters."
          }
          action={
            repairs.length === 0 ? (
              <Link href="/dashboard/repairs/new">
                <Button>
                  <Plus className="h-4 w-4" /> Create your first repair
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Link href={`/dashboard/repairs/${r.id}`} className="relative aspect-video w-full bg-slate-100">
                <Image src={r.photoBeforeUrl} alt={r.title} fill className="object-cover" />
                <div className="absolute left-2 top-2">
                  <StatusBadge status={r.status} />
                </div>
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <Link href={`/dashboard/repairs/${r.id}`}>
                  <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-orange-600">{r.title}</h3>
                </Link>
                <p className="mt-0.5 truncate text-xs text-slate-500">{r.objectLabel || "Analyzing…"}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <DifficultyBadge difficulty={r.difficulty} />
                </div>
                <div className="mt-3">
                  <TimeCostPill minutes={r.estimatedTimeMinutes} costMin={r.estimatedCostMin} costMax={r.estimatedCostMax} />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleDelete(r.id, r.title)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
