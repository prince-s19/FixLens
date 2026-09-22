"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, ImagePlus, Loader2, RefreshCcw } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function PhotoUploader({
  value,
  onChange,
  label = "Photo of the damage",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.show({ kind: "error", title: "Upload failed", description: data.error });
        return;
      }
      onChange(data.url);
    } catch {
      toast.show({ kind: "error", title: "Upload failed", description: "Please try again." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200">
          <div className="relative aspect-video w-full bg-slate-100">
            <Image src={value} alt="Uploaded photo" fill className="object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-slate-900"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Replace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-8 text-slate-500 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            <span className="text-sm font-medium">Upload photo</span>
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-8 text-slate-500 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
            <span className="text-sm font-medium">Use camera</span>
          </button>
        </div>
      )}
    </div>
  );
}
