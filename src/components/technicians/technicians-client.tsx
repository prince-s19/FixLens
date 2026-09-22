"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Mail, MapPin, Phone, Plus, Star, Trash2, Users, X } from "lucide-react";
import type { Technician } from "@/db/schema";
import { Button, Card, EmptyState } from "@/components/ui/misc";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

type FormState = {
  name: string;
  specialty: string;
  phone: string;
  email: string;
  city: string;
  yearsExperience: string;
  notes: string;
};

const EMPTY_FORM: FormState = { name: "", specialty: "", phone: "", email: "", city: "", yearsExperience: "3", notes: "" };

export function TechniciansClient({ initialTechnicians }: { initialTechnicians: Technician[] }) {
  const [technicians, setTechnicians] = useState(initialTechnicians);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { confirm, dialog } = useConfirm();
  const toast = useToast();

  const createTechnician = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/technicians", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, yearsExperience: Number(form.yearsExperience) || 1 }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast.show({ kind: "error", title: "Couldn't add technician", description: data.error });
      return;
    }
    setTechnicians((prev) => [data.technician, ...prev]);
    setForm(EMPTY_FORM);
    setShowForm(false);
    toast.show({ kind: "success", title: "Technician added" });
  };

  const toggleAvailable = async (t: Technician) => {
    const previous = technicians;
    setTechnicians((prev) => prev.map((x) => (x.id === t.id ? { ...x, available: !x.available } : x)));
    const res = await fetch(`/api/technicians/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !t.available }),
    });
    if (!res.ok) {
      setTechnicians(previous);
      toast.show({ kind: "error", title: "Couldn't update availability" });
    }
  };

  const remove = async (t: Technician) => {
    const ok = await confirm({
      title: `Remove ${t.name}?`,
      description: "This technician will no longer be available for escalations.",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;
    const previous = technicians;
    setTechnicians((prev) => prev.filter((x) => x.id !== t.id));
    const res = await fetch(`/api/technicians/${t.id}`, { method: "DELETE" });
    if (!res.ok) {
      setTechnicians(previous);
      toast.show({ kind: "error", title: "Couldn't remove technician" });
    } else {
      toast.show({ kind: "success", title: "Technician removed" });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {dialog}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Technicians</h1>
          <p className="mt-1 text-sm text-slate-500">Your trusted directory for complex or unsafe repair escalations.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus className="h-4 w-4" /> Add technician
        </Button>
      </div>

      {showForm ? (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Add a technician</h2>
            <button onClick={() => setShowForm(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={createTechnician} className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name">
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Specialty">
              <input
                required
                placeholder="e.g. Electronics & appliances"
                value={form.specialty}
                onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Phone">
              <input required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Email (optional)">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="City">
              <input required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Years of experience">
              <input
                type="number"
                min={0}
                value={form.yearsExperience}
                onChange={(e) => setForm((f) => ({ ...f, yearsExperience: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes (optional)">
                <textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className={inputCls} />
              </Field>
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Save technician
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {technicians.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="No technicians yet"
          description="Add trusted technicians so you can escalate unsafe or complex repairs instantly."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Add your first technician
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technicians.map((t) => (
            <Card key={t.id} className="flex flex-col p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.specialty}</p>
                  </div>
                </div>
                <button onClick={() => remove(t)} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-1 text-xs text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(t.rating / 10) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                ))}
                <span className="ml-1 text-slate-500">{(t.rating / 10).toFixed(1)} · {t.yearsExperience} yrs exp</span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {t.phone}
                </p>
                {t.email ? (
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {t.email}
                  </p>
                ) : null}
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {t.city}
                </p>
              </div>

              {t.notes ? <p className="mt-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-500">{t.notes}</p> : null}

              <button
                onClick={() => toggleAvailable(t)}
                className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  t.available ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${t.available ? "bg-emerald-500" : "bg-slate-400"}`} />
                {t.available ? "Available now" : "Unavailable"}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
