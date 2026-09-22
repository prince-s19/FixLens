"use client";

import Image from "next/image";
import { AlertTriangle } from "lucide-react";

export function DamageHighlight({
  photoUrl,
  box,
  label,
}: {
  photoUrl: string;
  box: { x: number; y: number; w: number; h: number } | null | undefined;
  label?: string;
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
      <Image src={photoUrl} alt={label ?? "Damage photo"} fill className="object-cover" />
      {box ? (
        <div
          className="animate-pulse-ring absolute rounded-md border-2 border-orange-500"
          style={{
            left: `${box.x}%`,
            top: `${box.y}%`,
            width: `${box.w}%`,
            height: `${box.h}%`,
          }}
        >
          <span className="absolute -top-6 left-0 inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-orange-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow">
            <AlertTriangle className="h-3 w-3" /> Damage detected
          </span>
        </div>
      ) : null}
    </div>
  );
}
