"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X } from "lucide-react";
import type { SavedRepairGuide } from "@/db/schema";
import { Button, Card } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { MVP_ALLOWED_CATEGORIES } from "@/lib/repairKnowledge";

export function GuideForm({ initialGuide }: { initialGuide?: SavedRepairGuide }) {
  const router = useRouter();
  const toast = useToast();
  const isEditing = !!initialGuide;

  const [title, setTitle] = useState(initialGuide?.title ?? "");
  const [category, setCategory] = useState(initialGuide?.category ?? "loose_furniture_screws");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(initialGuide?.difficulty ?? "easy");
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState(initialGuide?.estimatedTimeMinutes ?? 15);
  const [estimatedCostMin, setEstimatedCostMin] = useState(initialGuide?.estimatedCostMin ?? 20);
  const [estimatedCostMax, setEstimatedCostMax] = useState(initialGuide?.estimatedCostMax ?? 100);
  const [tools, setTools] = useState<string[]>(initialGuide?.tools ?? ["Phillips #2 screwdriver"]);
  const [newTool, setNewTool] = useState("");
  const [materials, setMaterials] = useState<string[]>(initialGuide?.materials ?? ["PVA Wood glue"]);
  const [newMaterial, setNewMaterial] = useState("");
  const [userNotes, setUserNotes] = useState(initialGuide?.userNotes ?? "");
  const [steps, setSteps] = useState<Array<{ order: number; title: string; description: string; durationSeconds: number }>>(
    initialGuide?.steps ?? [
      { order: 1, title: "Inspection & Setup", description: "Inspect the damaged item on a clean surface.", durationSeconds: 3 },
      { order: 2, title: "Apply Safe Repair Action", description: "Tighten, align, or stitch according to instructions.", durationSeconds: 3 },
      { order: 3, title: "Verification Check", description: "Confirm joint firmness and function.", durationSeconds: 3 },
    ],
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTool = () => {
    if (!newTool.trim()) return;
    if (!tools.includes(newTool.trim())) {
      setTools([...tools, newTool.trim()]);
    }
    setNewTool("");
  };

  const removeTool = (t: string) => {
    setTools(tools.filter((x) => x !== t));
  };

  const addMaterial = () => {
    if (!newMaterial.trim()) return;
    if (!materials.includes(newMaterial.trim())) {
      setMaterials([...materials, newMaterial.trim()]);
    }
    setNewMaterial("");
  };

  const removeMaterial = (m: string) => {
    setMaterials(materials.filter((x) => x !== m));
  };

  const addStep = () => {
    const nextOrder = steps.length + 1;
    setSteps([
      ...steps,
      { order: nextOrder, title: `Step ${nextOrder}`, description: "", durationSeconds: 3 },
    ]);
  };

  const removeStep = (index: number) => {
    const next = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    setSteps(next);
  };

  const updateStep = (index: number, field: "title" | "description", val: string) => {
    const next = [...steps];
    next[index] = { ...next[index], [field]: val };
    setSteps(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a guide title");
      return;
    }
    setError(null);
    setSubmitting(true);

    const payload = {
      title: title.trim(),
      category,
      difficulty,
      estimatedTimeMinutes: Number(estimatedTimeMinutes),
      estimatedCostMin: Number(estimatedCostMin),
      estimatedCostMax: Number(estimatedCostMax),
      tools,
      materials,
      steps,
      userNotes: userNotes.trim(),
      safetyNotes: [
        "Work in a well-lit, stable area.",
        "Keep small screws and needles away from children.",
      ],
      coverImageUrl: initialGuide?.coverImageUrl || "/images/hero-repair.jpg",
    };

    try {
      const url = isEditing ? `/api/guides/${initialGuide.id}` : "/api/guides";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save guide.");
        setSubmitting(false);
        return;
      }

      toast.show({
        kind: "success",
        title: isEditing ? "Guide updated!" : "Guide created!",
        description: `"${payload.title}" is saved in your library.`,
      });

      router.push(`/dashboard/guides/${data.guide.id}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      {error ? (
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
          {error}
        </div>
      ) : null}

      <Card className="space-y-4 p-6">
        <h2 className="text-base font-bold text-slate-900">Guide Essentials</h2>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Guide Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master Guide: Sagging Kitchen Cabinet Hinges"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              {MVP_ALLOWED_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="easy">Easy (Beginner friendly)</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Time (mins)</label>
            <input
              type="number"
              min={1}
              max={300}
              value={estimatedTimeMinutes}
              onChange={(e) => setEstimatedTimeMinutes(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Min Cost (₹)</label>
            <input
              type="number"
              min={0}
              value={estimatedCostMin}
              onChange={(e) => setEstimatedCostMin(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Max Cost (₹)</label>
            <input
              type="number"
              min={0}
              value={estimatedCostMax}
              onChange={(e) => setEstimatedCostMax(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </Card>

      {/* Tools & Materials */}
      <Card className="space-y-4 p-6">
        <h2 className="text-base font-bold text-slate-900">Tools &amp; Materials</h2>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Tools Required</label>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {tools.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800">
                {t}
                <button type="button" onClick={() => removeTool(t)} className="text-slate-400 hover:text-slate-700">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newTool}
              onChange={(e) => setNewTool(e.target.value)}
              placeholder="Add a tool (e.g. Hex key 4mm)..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTool();
                }
              }}
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
            <Button type="button" variant="outline" size="sm" onClick={addTool}>
              Add Tool
            </Button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Materials &amp; Consumables</label>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {materials.map((m) => (
              <span key={m} className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-800">
                {m}
                <button type="button" onClick={() => removeMaterial(m)} className="text-orange-400 hover:text-orange-700">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              placeholder="Add material (e.g. Blue threadlocker fluid)..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMaterial();
                }
              }}
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
            <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
              Add Material
            </Button>
          </div>
        </div>
      </Card>

      {/* Step by Step Instructions */}
      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Step-by-Step Instructions</h2>
          <Button type="button" variant="outline" size="sm" onClick={addStep}>
            <Plus className="h-3.5 w-3.5" /> Add Step
          </Button>
        </div>

        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                  {step.order}
                </span>
                {steps.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeStep(idx)}
                    className="text-slate-400 hover:text-rose-600"
                    title="Remove step"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              <input
                value={step.title}
                onChange={(e) => updateStep(idx, "title", e.target.value)}
                placeholder="Step title..."
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold outline-none focus:border-orange-500"
                required
              />

              <textarea
                value={step.description}
                onChange={(e) => updateStep(idx, "description", e.target.value)}
                placeholder="Detailed instructions for this step..."
                rows={2}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-orange-500"
                required
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Custom Notes */}
      <Card className="space-y-3 p-6">
        <h2 className="text-base font-bold text-slate-900">Personal Tips &amp; Field Notes</h2>
        <textarea
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          rows={3}
          placeholder="Any extra observations, recommended brands, or helpful tips for next time..."
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {isEditing ? "Update Guide" : "Save Guide to Library"}
        </Button>
      </div>
    </form>
  );
}
