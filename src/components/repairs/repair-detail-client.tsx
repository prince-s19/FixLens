"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertOctagon,
  BookmarkPlus,
  Calendar,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  Lock,
  Pencil,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Timer,
  Trash2,
  Wrench,
} from "lucide-react";
import type { RepairRequest } from "@/db/schema";
import { RepairVideoPlayer } from "@/components/repairs/repair-video-player";
import { DamageHighlight } from "@/components/repairs/damage-highlight";
import { BeforeAfter } from "@/components/repairs/before-after";
import { EscalateDialog } from "@/components/repairs/escalate-dialog";
import { StatusBadge, DifficultyBadge, SafetyBadge, SeverityBadge } from "@/components/ui/badges";
import { Button, Card, SectionTitle } from "@/components/ui/misc";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { getTemplate } from "@/lib/repairKnowledge";

export function RepairDetailClient({ repair: initialRepair }: { repair: RepairRequest }) {
  const [repair, setRepair] = useState(initialRepair);
  const [deleting, setDeleting] = useState(false);
  const [savingGuide, setSavingGuide] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const template = getTemplate(repair.category);
  const isDangerousOrUnsafe =
    repair.isDangerous || repair.safetyLevel === "unsafe" || !repair.isDiySafe;

  const markInProgress = async () => {
    setRepair((r) => ({ ...r, status: "in_progress" }));
    const res = await fetch(`/api/repairs/${repair.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_progress" }),
    });
    if (!res.ok) {
      setRepair(initialRepair);
      toast.show({ kind: "error", title: "Couldn't update status" });
    } else {
      toast.show({ kind: "success", title: "Marked as in progress" });
    }
  };

  const handleSaveToGuides = async () => {
    setSavingGuide(true);
    try {
      const res = await fetch("/api/guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repairRequestId: repair.id,
          title: repair.title,
          category: repair.category,
          difficulty: repair.difficulty,
          estimatedTimeMinutes: repair.estimatedTimeMinutes,
          estimatedCostMin: repair.estimatedCostMin,
          estimatedCostMax: repair.estimatedCostMax,
          tools: repair.tools,
          materials: repair.materials,
          steps: repair.steps,
          safetyNotes: repair.safetyNotes,
          videoUrl: repair.generatedVideoUrl,
          coverImageUrl: repair.photoBeforeUrl,
          userNotes: repair.description || `Saved from repair case: ${repair.title}`,
          tags: [repair.category, "diy-guide"],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.show({ kind: "error", title: "Failed to save guide", description: data.error });
        return;
      }

      toast.show({
        kind: "success",
        title: "Saved to Repair Guides!",
        description: "Guide is now in your reusable Guides Library.",
      });
      router.push(`/dashboard/guides/${data.guide.id}`);
    } catch {
      toast.show({ kind: "error", title: "Network error saving guide" });
    } finally {
      setSavingGuide(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete this repair?",
      description: "This will permanently remove the repair plan, photos and history. This cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    const res = await fetch(`/api/repairs/${repair.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.show({ kind: "success", title: "Repair deleted" });
      router.push("/dashboard/repairs");
      router.refresh();
    } else {
      setDeleting(false);
      toast.show({ kind: "error", title: "Couldn't delete repair" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {dialog}

      {/* Top Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={repair.status} />
            <DifficultyBadge difficulty={repair.difficulty} />
            <SafetyBadge level={repair.safetyLevel} />
            <SeverityBadge severity={repair.damageSeverity} />
          </div>
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">{repair.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {repair.objectLabel} · Created {new Date(repair.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {!isDangerousOrUnsafe ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveToGuides}
              loading={savingGuide}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <BookmarkPlus className="h-3.5 w-3.5" /> Save to Guides
            </Button>
          ) : null}
          <Link href={`/dashboard/repairs/${repair.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleDelete} loading={deleting}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* HARD SAFETY BLOCK FOR DANGEROUS REPAIRS */}
      {isDangerousOrUnsafe ? (
        <div className="space-y-6">
          <div className="rounded-3xl border-2 border-rose-500 bg-rose-50/80 p-6 shadow-xl sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-xl shadow-rose-600/30">
                <AlertOctagon className="h-8 w-8" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <span className="rounded-full bg-rose-200 px-3 py-1 text-xs font-black uppercase tracking-wider text-rose-950">
                    FixLens Safety Hard-Lock Active
                  </span>
                  <h2 className="mt-2 text-2xl font-bold text-rose-950">
                    {template.dangerAlert?.title || "High-Risk Repair Blocked for Safety"}
                  </h2>
                </div>

                <p className="text-sm leading-relaxed text-rose-900 sm:text-base">
                  {template.dangerAlert?.explanation ||
                    "This repair involves hazardous high-voltage, explosive gas, vehicle brake mechanics, or structural building compromise. FixLens strictly restricts DIY execution to prevent injury or property damage."}
                </p>

                <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
                    <ShieldAlert className="h-4 w-4 text-rose-600" /> Immediate Emergency Actions:
                  </h4>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                    {template.dangerAlert?.emergencyAction ||
                      "1. Disconnect any power/gas source immediately.\n2. Keep people and children clear of the area.\n3. Escalate to a certified specialist."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-rose-600 p-5 text-white shadow-lg">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-rose-200">
                      Required Professional:
                    </p>
                    <p className="text-lg font-bold">
                      {template.dangerAlert?.requiredSpecialist || "Certified Licensed Specialist"}
                    </p>
                  </div>
                  <EscalateDialog
                    repairId={repair.id}
                    defaultReason={`${repair.title}: ${repair.damageSummary}. Blocked by FixLens Safety Gate.`}
                    onEscalated={() => setRepair((r) => ({ ...r, status: "escalated" }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Locked DIY Instructions State */}
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">DIY Instructions &amp; Video Locked</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              In accordance with safety guidelines for {repair.category.replace(/_/g, " ")}, DIY video generation
              and step-by-step procedures are locked. Please contact the technician assigned above.
            </p>
          </Card>
        </div>
      ) : (
        /* SAFE DIY REPAIR INTERFACE */
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <div>
              <SectionTitle subtitle="15-second procedural visual repair walkthrough with AI voice narration">
                15-Second AI Repair Video
              </SectionTitle>
              <RepairVideoPlayer
                repairId={repair.id}
                objectLabel={repair.objectLabel}
                category={repair.category}
                damageSummary={repair.damageSummary}
                damageBox={repair.damageBox}
                photoBefore={repair.photoBeforeUrl}
                photoAfter={repair.photoAfterUrl}
                steps={repair.steps}
                tools={repair.tools}
                animationType={template.animationType}
                initialVideoUrl={repair.generatedVideoUrl}
              />
            </div>

            <div>
              <SectionTitle>Visual damage detection &amp; locus</SectionTitle>
              <DamageHighlight photoUrl={repair.photoBeforeUrl} box={repair.damageBox} label={repair.objectLabel} />
              <p className="mt-2 text-sm text-slate-600">{repair.damageSummary}</p>
            </div>

            <div>
              <SectionTitle>Before &amp; After Comparison</SectionTitle>
              <BeforeAfter
                repairId={repair.id}
                photoBeforeUrl={repair.photoBeforeUrl}
                photoAfterUrl={repair.photoAfterUrl}
                onSaved={(url) => setRepair((r) => ({ ...r, photoAfterUrl: url, status: "completed" }))}
              />
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Card className="p-4">
              <SectionTitle>Quick facts</SectionTitle>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                  <Timer className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="font-semibold text-slate-900">{repair.estimatedTimeMinutes} min</p>
                    <p className="text-xs text-slate-500">Estimated time</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                  <IndianRupee className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      ₹{repair.estimatedCostMin}–{repair.estimatedCostMax}
                    </p>
                    <p className="text-xs text-slate-500">Estimated cost</p>
                  </div>
                </div>
              </div>
              {repair.status === "ready" ? (
                <Button className="mt-4 w-full" onClick={markInProgress}>
                  <Wrench className="h-4 w-4" /> Start repairing
                </Button>
              ) : null}
            </Card>

            <Card className="p-4">
              <SectionTitle>DIY Safety Verification</SectionTitle>
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" /> Low-risk everyday repair. Safe for DIY.
              </div>
              <ul className="space-y-2">
                {repair.safetyNotes.map((note, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-600">
                    <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    {note}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-4">
              <SectionTitle>Step-by-step instructions</SectionTitle>
              <ol className="space-y-3">
                {repair.steps.map((step) => (
                  <li key={step.order} className="flex gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                      {step.order}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800">{step.title}</p>
                      <p className="text-xs leading-relaxed text-slate-500">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="p-4">
              <SectionTitle>Tools &amp; materials</SectionTitle>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <ClipboardList className="h-3.5 w-3.5" /> Everyday Tools Needed
              </div>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {repair.tools.map((t) => (
                  <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <ClipboardList className="h-3.5 w-3.5" /> Materials / Replacements
              </div>
              <div className="flex flex-wrap gap-1.5">
                {repair.materials.map((m) => (
                  <span key={m} className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                    {m}
                  </span>
                ))}
              </div>
            </Card>

            {repair.description ? (
              <Card className="p-4">
                <SectionTitle>Your notes</SectionTitle>
                <p className="flex gap-2 text-sm text-slate-600">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  {repair.description}
                </p>
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
