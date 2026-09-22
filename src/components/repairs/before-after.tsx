"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, ImagePlus } from "lucide-react";
import { PhotoUploader } from "@/components/repairs/photo-uploader";
import { Button } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";

export function BeforeAfter({
  repairId,
  photoBeforeUrl,
  photoAfterUrl,
  onSaved,
}: {
  repairId: string;
  photoBeforeUrl: string;
  photoAfterUrl: string | null;
  onSaved: (url: string) => void;
}) {
  const [showUploader, setShowUploader] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const save = async () => {
    if (!pendingUrl) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/repairs/${repairId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoAfterUrl: pendingUrl, status: "completed" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.show({ kind: "error", title: "Couldn't save", description: data.error });
        return;
      }
      onSaved(pendingUrl);
      toast.show({ kind: "success", title: "Repair marked complete", description: "Great job — your after photo has been saved." });
      setShowUploader(false);
      setPendingUrl(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Before</p>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <Image src={photoBeforeUrl} alt="Before repair" fill className="object-cover" />
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">After</p>
        {photoAfterUrl ? (
          <div className="relative aspect-video overflow-hidden rounded-xl border border-emerald-200 bg-slate-100">
            <Image src={photoAfterUrl} alt="After repair" fill className="object-cover" />
            <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">
              <CheckCircle2 className="h-3 w-3" /> Fixed
            </div>
          </div>
        ) : showUploader ? (
          <div className="space-y-3">
            <PhotoUploader value={pendingUrl} onChange={setPendingUrl} label="" />
            <div className="flex gap-2">
              <Button size="sm" onClick={save} loading={saving} disabled={!pendingUrl}>
                Save &amp; mark complete
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowUploader(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowUploader(true)}
            className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-sm font-medium">Add after photo</span>
          </button>
        )}
      </div>
    </div>
  );
}
