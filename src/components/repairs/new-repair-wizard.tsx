"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Loader2,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { PhotoUploader } from "@/components/repairs/photo-uploader";
import { Button, Card } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import type { VisionDetectionResult } from "@/lib/aiVision";
import { EscalateDialog } from "@/components/repairs/escalate-dialog";

export function NewRepairWizard() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detection, setDetection] = useState<VisionDetectionResult | null>(null);
  const [editableTitle, setEditableTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Trigger Real AI Detection
  const handleAnalyzePhoto = async () => {
    if (!photoUrl) return;
    setError(null);
    setAnalyzing(true);

    try {
      const res = await fetch("/api/ai/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl, notes: userNotes }),
      });
      const data = await res.json();

      if (!res.ok || !data.detection) {
        setError(data.error || "Failed to analyze photo. Please try again.");
        setAnalyzing(false);
        return;
      }

      setDetection(data.detection);
      setEditableTitle(data.detection.objectLabel + " Repair");
      setStep(2);
    } catch {
      setError("Network connection issue while contacting AI vision service.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Submit Safe Repair
  const handleCreateRepair = async () => {
    if (!detection || !photoUrl) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editableTitle.trim() || `${detection.objectLabel} Repair`,
          category: detection.category,
          description: userNotes,
          photoBeforeUrl: photoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create repair case.");
        setSubmitting(false);
        return;
      }

      toast.show({
        kind: "success",
        title: "Repair plan created!",
        description: "Your 15-second visual repair video is ready.",
      });
      router.push(`/dashboard/repairs/${data.repair.id}`);
    } catch {
      setError("Network error while creating repair.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
            <Sparkles className="h-3.5 w-3.5 text-orange-600" /> FixLens AI Engine
          </span>
          <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">Capture &amp; Repair</h1>
          <p className="mt-1 text-sm text-slate-500">
            Real computer vision object identification, DIY safety gate, and 15-second video solution.
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
            step >= 1 ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-500"
          }`}
        >
          1
        </div>
        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-orange-600" : "bg-slate-200"}`} />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
            step >= 2 ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-500"
          }`}
        >
          2
        </div>
      </div>

      {error ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
          <AlertOctagon className="h-5 w-5 shrink-0 text-rose-600" />
          {error}
        </div>
      ) : null}

      {/* STEP 1: Capture or Upload Photo */}
      {step === 1 ? (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                1. Capture or upload a photo of the damaged object
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Take a clear photo with your iQOO camera. FixLens AI will automatically detect the object, visible damage, and verify DIY safety.
              </p>
            </div>

            <PhotoUploader value={photoUrl} onChange={setPhotoUrl} label="Item photo" />

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">
                Optional note or symptom (e.g. &ldquo;drawer handle is loose&rdquo;, &ldquo;chain slipped off cycle&rdquo;)
              </label>
              <input
                type="text"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Describe what happened or leave empty for pure visual detection..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleAnalyzePhoto}
                disabled={!photoUrl || analyzing}
                className="w-full sm:w-auto"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing Photo with FixLens AI…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Run AI Object &amp; Damage Detection
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {/* STEP 2: AI Detection Results & Safety Gate */}
      {step === 2 && detection ? (
        <div className="space-y-6">
          {/* Visual Damage Highlighting on Uploaded Photo */}
          <Card className="overflow-hidden p-0">
            <div className="relative aspect-video w-full bg-slate-950">
              {photoUrl ? (
                <Image src={photoUrl} alt="Analyzed Damage" fill className="object-cover opacity-90" />
              ) : null}

              {/* Real Damage Bounding Box */}
              {detection.damageBox ? (
                <div
                  className="animate-pulse-ring absolute rounded-lg border-2 border-orange-500 bg-orange-500/10 shadow-lg"
                  style={{
                    left: `${detection.damageBox.x}%`,
                    top: `${detection.damageBox.y}%`,
                    width: `${detection.damageBox.w}%`,
                    height: `${detection.damageBox.h}%`,
                  }}
                >
                  <span className="absolute -top-7 left-0 inline-flex items-center gap-1 rounded bg-orange-600 px-2 py-0.5 text-[11px] font-bold text-white shadow">
                    <Sparkles className="h-3 w-3" /> Damage Locus: {detection.damageSeverity.toUpperCase()}
                  </span>
                </div>
              ) : null}

              {/* AI Detection Info Badge */}
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-950/80 p-3 text-xs text-white backdrop-blur">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-orange-400" />
                  <span className="font-semibold">{detection.aiModelUsed}</span>
                  <span className="text-slate-400">· {detection.confidenceScore}% confidence</span>
                </div>
                <div className="font-mono text-slate-300">
                  Box: {detection.damageBox.w}% × {detection.damageBox.h}%
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                    Detected Object &amp; Diagnosis
                  </span>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">{detection.objectLabel}</h3>
                  <p className="mt-1 text-sm text-slate-600">{detection.damageSummary}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* DANGEROUS REPAIR HARD SAFETY LOCK */}
          {detection.isDangerous ? (
            <div className="rounded-2xl border-2 border-rose-500 bg-rose-50 p-6 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="rounded-full bg-rose-200 px-3 py-1 text-xs font-extrabold tracking-wide text-rose-900">
                      SAFETY HARD-LOCK ACTIVE
                    </span>
                    <h2 className="mt-2 text-xl font-bold text-rose-950">
                      {detection.dangerAlert?.title || "High-Risk Repair Blocked for Safety"}
                    </h2>
                  </div>

                  <p className="text-sm leading-relaxed text-rose-900">
                    {detection.dangerAlert?.explanation ||
                      "FixLens is restricted strictly to low-risk household DIY repairs. This object involves hazardous electrical, gas, vehicle-braking, structural, or medical risks that require certified professionals."}
                  </p>

                  <div className="rounded-xl border border-rose-200 bg-white p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                      Immediate Emergency Instructions:
                    </h4>
                    <p className="mt-1 whitespace-pre-line text-xs font-medium text-slate-700">
                      {detection.dangerAlert?.emergencyAction ||
                        "Do not touch or operate this item. Disconnect power/gas source if safe to do so."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <EscalateDialog
                      repairId="temp-escalate"
                      defaultReason={`${detection.objectLabel}: ${detection.damageSummary}. Flagged dangerous by FixLens safety gate.`}
                      onEscalated={() => {
                        toast.show({
                          kind: "success",
                          title: "Escalated to Technician",
                          description: "A certified specialist has been notified.",
                        });
                        router.push("/dashboard/escalations");
                      }}
                    />
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Upload a Different Item
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SAFE DIY REPAIR FLOW */
            <Card className="space-y-5 p-6">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">DIY Safety Check Passed</h4>
                  <p className="text-xs text-emerald-700">
                    This item belongs to an approved low-risk MVP category. It is safe for DIY repair with everyday tools.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Repair Title</label>
                <input
                  type="text"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">Estimated Time</p>
                  <p className="text-base font-bold text-slate-900">{detection.estimatedTimeMinutes} min</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">Estimated Cost</p>
                  <p className="text-base font-bold text-slate-900">
                    ₹{detection.estimatedCostMin}–{detection.estimatedCostMax}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">Difficulty</p>
                  <p className="text-base font-bold capitalize text-slate-900">{detection.difficulty}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <Button variant="outline" onClick={() => setStep(1)} disabled={submitting}>
                  Back to Photo
                </Button>
                <Button onClick={handleCreateRepair} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating Repair Video &amp; Plan…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate 15s AI Repair Video
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}
