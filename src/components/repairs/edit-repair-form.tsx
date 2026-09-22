"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { RepairRequest } from "@/db/schema";
import { Button, Card } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";

export function EditRepairForm({ repair }: { repair: RepairRequest }) {
  const [title, setTitle] = useState(repair.title);
  const [description, setDescription] = useState(repair.description);
  const [status, setStatus] = useState(repair.status);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/repairs/${repair.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, status }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      toast.show({ kind: "error", title: "Couldn't save changes", description: data.error });
      return;
    }
    toast.show({ kind: "success", title: "Repair updated" });
    router.push(`/dashboard/repairs/${repair.id}`);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-950">Edit repair</h1>
      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="analyzing">Analyzing</option>
              <option value="ready">Plan ready</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
