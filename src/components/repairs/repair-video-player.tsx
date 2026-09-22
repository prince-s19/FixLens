"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  Languages,
  Loader2,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { RepairStep } from "@/lib/repairKnowledge";
import { generateRepairVideo } from "@/lib/canvas-video-generator";

export function RepairVideoPlayer({
  repairId,
  objectLabel,
  category = "loose_furniture_screws",
  damageSummary,
  damageBox,
  photoBefore,
  photoAfter,
  steps,
  tools = [],
  animationType = "screw_tighten",
  initialVideoUrl,
}: {
  repairId?: string;
  objectLabel: string;
  category?: string;
  damageSummary: string;
  damageBox: { x: number; y: number; w: number; h: number } | null | undefined;
  photoBefore: string;
  photoAfter: string | null;
  steps: RepairStep[];
  tools?: string[];
  animationType?: string;
  initialVideoUrl?: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl ?? null);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Auto-generate video on mount if not already available
  useEffect(() => {
    let active = true;

    async function generate(selectedLang: "en" | "ta") {
      setRendering(true);
      setRenderProgress(10);
      try {
        const blob = await generateRepairVideo({
          objectLabel,
          category,
          damageSummary,
          damageBox,
          photoBeforeUrl: photoBefore,
          photoAfterUrl: photoAfter,
          steps,
          tools,
          animationType,
          lang: selectedLang,
          onProgress: (pct) => {
            if (active) setRenderProgress(pct);
          },
        });

        if (!active) return;
        const objectUrl = URL.createObjectURL(blob);
        setVideoUrl(objectUrl);
        setRendering(false);

        // Upload to server to persist if repairId is available
        if (repairId) {
          const formData = new FormData();
          formData.append("video", blob, `repair-${repairId}.webm`);
          fetch(`/api/repairs/${repairId}/video`, {
            method: "POST",
            body: formData,
          }).catch((err) => console.warn("Failed to persist video to server:", err));
        }
      } catch (err) {
        console.error("Video generation failed:", err);
        if (active) setRendering(false);
      }
    }

    generate(lang);

    return () => {
      active = false;
    };
  }, [repairId, objectLabel, category, damageSummary, damageBox, photoBefore, photoAfter, steps, tools, animationType, lang]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = () => {
    if (!videoRef.current) return;
    const speeds = [1, 1.25, 1.5, 0.75];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackRate(nextSpeed);
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `FixLens-Repair-${objectLabel.replace(/\s+/g, "_")}-15s.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
      <div className="relative aspect-video w-full bg-slate-950">
        {rendering ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center">
            <div className="relative mb-4 h-16 w-16">
              <div className="absolute inset-0 animate-ping rounded-full bg-orange-500/20" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg shadow-orange-600/40">
                <Sparkles className="h-8 w-8 animate-pulse" />
              </div>
            </div>
            <h3 className="text-base font-bold text-white sm:text-lg">
              Rendering AI 15-Second Repair Video…
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-400 sm:text-sm">
              Synthesizing procedural motion graphics &amp; {lang === "ta" ? "Tamil" : "English"} neural voice narration.
            </p>

            <div className="mt-6 w-full max-w-xs">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-300"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-orange-400">{renderProgress}% complete</p>
            </div>
          </div>
        ) : null}

        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            className="h-full w-full object-cover"
            onTimeUpdate={() => {
              if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) setDuration(videoRef.current.duration || 15);
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        ) : null}

        {/* Video Watermark Badge */}
        <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          FixLens 15s AI Video
        </div>

        {/* Big Center Play Overlay when paused */}
        {!rendering && videoUrl && !isPlaying ? (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition hover:bg-black/40"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-white shadow-2xl transition hover:scale-105">
              <Play className="ml-1 h-8 w-8" />
            </div>
          </button>
        ) : null}
      </div>

      {/* Video Control Bar */}
      <div className="space-y-2 bg-slate-900/90 px-4 py-3 text-white backdrop-blur">
        {/* Scrubber */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={duration || 15}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            disabled={rendering}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-orange-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              disabled={rendering}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white transition hover:bg-orange-700 disabled:opacity-50"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
            </button>

            <button
              onClick={handleReplay}
              disabled={rendering}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50"
              title="Replay from start"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={toggleMute}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>

            <span className="text-xs font-mono text-slate-400">
              {currentTime.toFixed(0)}s / {duration.toFixed(0)}s
            </span>

            <button
              onClick={handleSpeedChange}
              className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-white/20"
              title="Playback speed"
            >
              {playbackRate}x
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher for Neural Voiceover */}
            <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 text-xs">
              <Languages className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
              <button
                disabled={rendering}
                onClick={() => setLang("en")}
                className={`rounded-full px-2.5 py-1 font-medium transition ${
                  lang === "en" ? "bg-orange-600 text-white shadow" : "text-slate-300 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                disabled={rendering}
                onClick={() => setLang("ta")}
                className={`rounded-full px-2.5 py-1 font-medium transition ${
                  lang === "ta" ? "bg-orange-600 text-white shadow" : "text-slate-300 hover:text-white"
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Download Video Button */}
            <button
              onClick={handleDownload}
              disabled={rendering || !videoUrl}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-orange-700 disabled:opacity-50"
              title="Download generated 15-second video file"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download Video (.webm)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
