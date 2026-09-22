"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bookmark,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  Pencil,
  Printer,
  Share2,
  ShieldAlert,
  Sparkles,
  Timer,
  Trash2,
  Wrench,
} from "lucide-react";
import type { SavedRepairGuide } from "@/db/schema";
import { DifficultyBadge } from "@/components/ui/badges";
import { Button, Card, SectionTitle } from "@/components/ui/misc";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { RepairVideoPlayer } from "@/components/repairs/repair-video-player";
import { getTemplate } from "@/lib/repairKnowledge";

export function GuideDetailClient({ guide: initialGuide }: { guide: SavedRepairGuide }) {
  const [guide, setGuide] = useState(initialGuide);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [checkedTools, setCheckedTools] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const template = getTemplate(guide.category);

  const toggleStep = (stepOrder: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepOrder) ? prev.filter((s) => s !== stepOrder) : [...prev, stepOrder],
    );
  };

  const toggleTool = (tool: string) => {
    setCheckedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool],
    );
  };

  const toggleBookmark = async () => {
    const next = !guide.isBookmarked;
    setGuide((g) => ({ ...g, isBookmarked: next }));
    try {
      await fetch(`/api/guides/${guide.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBookmarked: next }),
      });
      toast.show({
        kind: "success",
        title: next ? "Bookmarked guide" : "Removed bookmark",
      });
    } catch {
      setGuide(initialGuide);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: `Delete "${guide.title}"?`,
      description: "This will permanently remove this guide from your library.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    setDeleting(true);
    const res = await fetch(`/api/guides/${guide.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.show({ kind: "success", title: "Guide deleted" });
      router.push("/dashboard/guides");
      router.refresh();
    } else {
      setDeleting(false);
      toast.show({ kind: "error", title: "Failed to delete guide" });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {dialog}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-3 py-0.5 text-xs font-bold text-orange-800">
              Saved Guide
            </span>
            <DifficultyBadge difficulty={guide.difficulty} />
          </div>
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">{guide.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Category: {guide.category.replace(/_/g, " ")} · Saved on{" "}
            {new Date(guide.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={toggleBookmark}>
            <Bookmark className={`h-3.5 w-3.5 ${guide.isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
            {guide.isBookmarked ? "Bookmarked" : "Bookmark"}
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>

          <Link href={`/dashboard/guides/${guide.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-3.5 w-3.5" /> Edit Guide
            </Button>
          </Link>

          <Button variant="outline" size="sm" onClick={handleDelete} loading={deleting}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {/* 15s Video Player */}
          <div>
            <SectionTitle subtitle="Visual walkthrough for this repair guide">
              15-Second Video Demonstration
            </SectionTitle>
            <RepairVideoPlayer
              repairId={guide.repairRequestId || undefined}
              objectLabel={guide.title}
              category={guide.category}
              damageSummary={guide.userNotes || guide.title}
              damageBox={{ x: 25, y: 25, w: 40, h: 40 }}
              photoBefore={guide.coverImageUrl || "/images/hero-repair.jpg"}
              photoAfter={null}
              steps={guide.steps}
              tools={guide.tools}
              animationType={template.animationType}
              initialVideoUrl={guide.videoUrl}
            />
          </div>

          {/* Interactive Checklist */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <SectionTitle>Interactive Step-by-Step Checklist</SectionTitle>
              <span className="text-xs font-bold text-orange-600">
                {completedSteps.length}/{guide.steps.length} Completed
              </span>
            </div>

            <ol className="mt-3 space-y-3">
              {guide.steps.map((step) => {
                const done = completedSteps.includes(step.order);
                return (
                  <li
                    key={step.order}
                    onClick={() => toggleStep(step.order)}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                      done
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                        done ? "bg-emerald-600 text-white" : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : step.order}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold transition ${
                          done ? "text-emerald-950 line-through opacity-80" : "text-slate-900"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{step.description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-4">
            <SectionTitle>Quick Facts</SectionTitle>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                <Timer className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="font-semibold text-slate-900">{guide.estimatedTimeMinutes} min</p>
                  <p className="text-xs text-slate-500">Estimated time</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                <IndianRupee className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="font-semibold text-slate-900">
                    ₹{guide.estimatedCostMin}–{guide.estimatedCostMax}
                  </p>
                  <p className="text-xs text-slate-500">Estimated cost</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tools Checklist */}
          <Card className="p-4">
            <SectionTitle>Tools Needed (Tap to check)</SectionTitle>
            <div className="space-y-2">
              {guide.tools.map((t) => {
                const checked = checkedTools.includes(t);
                return (
                  <label
                    key={t}
                    onClick={() => toggleTool(t)}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg p-2 text-xs font-medium transition ${
                      checked ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="rounded text-orange-600"
                    />
                    <span className={checked ? "line-through" : ""}>{t}</span>
                  </label>
                );
              })}
            </div>
          </Card>

          {/* Materials */}
          {guide.materials && guide.materials.length > 0 ? (
            <Card className="p-4">
              <SectionTitle>Materials / Supplies</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {guide.materials.map((m) => (
                  <span key={m} className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                    {m}
                  </span>
                ))}
              </div>
            </Card>
          ) : null}

          {/* Safety Notes */}
          {guide.safetyNotes && guide.safetyNotes.length > 0 ? (
            <Card className="p-4">
              <SectionTitle>Safety Notes</SectionTitle>
              <ul className="space-y-2">
                {guide.safetyNotes.map((note, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-600">
                    <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    {note}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {/* Custom Notes */}
          {guide.userNotes ? (
            <Card className="p-4">
              <SectionTitle>Personal Tips &amp; Notes</SectionTitle>
              <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600">
                {guide.userNotes}
              </p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
