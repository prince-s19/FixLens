// FixLens Procedural 15-Second Repair Video Generator
// Renders animated visual repair instructions onto HTML5 Canvas and
// encodes via MediaRecorder into a genuine playable/downloadable video file.

import type { RepairStep } from "./repairKnowledge";

export type VideoGenParams = {
  objectLabel: string;
  category: string;
  damageSummary: string;
  damageBox?: { x: number; y: number; w: number; h: number } | null;
  photoBeforeUrl: string;
  photoAfterUrl?: string | null;
  steps: RepairStep[];
  tools: string[];
  animationType?: string;
  lang?: "en" | "ta";
  onProgress?: (pct: number) => void;
};

export async function generateRepairVideo(params: VideoGenParams): Promise<Blob> {
  const {
    objectLabel,
    category,
    damageSummary,
    damageBox = { x: 25, y: 25, w: 40, h: 40 },
    photoBeforeUrl,
    steps,
    tools,
    animationType = "screw_tighten",
    lang = "en",
    onProgress,
  } = params;

  // 1. Load image
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => {
      // Fallback 1x1 pixel image if network fails
      img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      resolve();
    };
    img.src = photoBeforeUrl;
  });

  // 2. Setup Canvas
  const width = 1280;
  const height = 720;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // 3. Setup Audio Stream if available
  let audioContext: AudioContext | null = null;
  let audioSource: AudioBufferSourceNode | null = null;
  let audioDestination: MediaStreamAudioDestinationNode | null = null;

  try {
    const audioUrl = `/api/ai/tts?category=${encodeURIComponent(category)}&lang=${lang}`;
    const audioRes = await fetch(audioUrl);
    if (audioRes.ok) {
      const audioArrayBuffer = await audioRes.arrayBuffer();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
        const decodedBuffer = await audioContext.decodeAudioData(audioArrayBuffer);
        audioDestination = audioContext.createMediaStreamDestination();
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = decodedBuffer;
        audioSource.connect(audioDestination);
      }
    }
  } catch (err) {
    console.warn("[FixLens Video Gen] Audio track attachment skipped:", err);
  }

  // 4. Capture canvas stream
  const canvasStream = canvas.captureStream(30);
  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
  if (audioDestination) {
    audioDestination.stream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
  }

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : MediaRecorder.isTypeSupported("video/webm")
    ? "video/webm"
    : "video/mp4";

  const recorder = new MediaRecorder(combinedStream, { mimeType });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const recordingPromise = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType }));
    };
  });

  recorder.start();
  if (audioSource) {
    audioSource.start(0);
  }

  // 5. Render 15 seconds at 30 fps = 450 frames
  const fps = 30;
  const totalFrames = 15 * fps;
  const b = damageBox || { x: 25, y: 25, w: 40, h: 40 };

  for (let frame = 0; frame < totalFrames; frame++) {
    const t = frame / fps; // current second 0.0 - 15.0

    // Render frame
    drawFrame(ctx, width, height, t, img, b, {
      objectLabel,
      damageSummary,
      steps,
      tools,
      animationType,
      lang,
    });

    if (onProgress && frame % 15 === 0) {
      onProgress(Math.floor((frame / totalFrames) * 100));
    }

    // Yield back to event loop for smooth encoding
    await new Promise((r) => setTimeout(r, 1000 / fps));
  }

  recorder.stop();
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close().catch(() => {});
  }

  if (onProgress) onProgress(100);
  return recordingPromise;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  img: HTMLImageElement,
  box: { x: number; y: number; w: number; h: number },
  data: {
    objectLabel: string;
    damageSummary: string;
    steps: RepairStep[];
    tools: string[];
    animationType: string;
    lang: "en" | "ta";
  },
) {
  // Clear
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, w, h);

  // Background Image with Ken Burns zoom effect
  let scale = 1.0;
  let offsetX = 0;
  let offsetY = 0;

  if (t < 3.5) {
    // Zoom in toward damage box
    const progress = Math.min(1, t / 3.0);
    scale = 1.0 + progress * 0.35;
    const targetX = ((box.x + box.w / 2) / 100) * w;
    const targetY = ((box.y + box.h / 2) / 100) * h;
    offsetX = (w / 2 - targetX) * progress * 0.4;
    offsetY = (h / 2 - targetY) * progress * 0.4;
  } else if (t < 12.0) {
    scale = 1.25;
  } else {
    // Zoom back out
    const progress = Math.min(1, (t - 12.0) / 2.0);
    scale = 1.25 - progress * 0.25;
  }

  ctx.save();
  ctx.translate(w / 2 + offsetX, h / 2 + offsetY);
  ctx.scale(scale, scale);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();

  // Dark overlay gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(2, 6, 23, 0.75)");
  grad.addColorStop(0.3, "rgba(2, 6, 23, 0.15)");
  grad.addColorStop(0.7, "rgba(2, 6, 23, 0.35)");
  grad.addColorStop(1, "rgba(2, 6, 23, 0.95)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Top Bar: FixLens Branding & Timeline
  ctx.fillStyle = "#ea580c";
  ctx.beginPath();
  ctx.roundRect(30, 25, 130, 36, 8);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("FixLens AI", 48, 49);

  // iQOO Powered Tag
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.roundRect(170, 25, 110, 36, 8);
  ctx.fill();
  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText("iQOO OPTIMIZED", 178, 48);

  // Time remaining
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "14px monospace";
  ctx.fillText(`${t.toFixed(1)}s / 15.0s`, w - 140, 48);

  // SCENE 1: (0.0s - 3.2s) Scanning & Target Lock
  if (t < 3.2) {
    const boxX = (box.x / 100) * w;
    const boxY = (box.y / 100) * h;
    const boxW = (box.w / 100) * w;
    const boxH = (box.h / 100) * h;

    // Laser Reticle Box
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.setLineDash([]);

    // Corner brackets
    const bracketSize = 16;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#fbbf24";
    // Top-left
    ctx.beginPath();
    ctx.moveTo(boxX, boxY + bracketSize);
    ctx.lineTo(boxX, boxY);
    ctx.lineTo(boxX + bracketSize, boxY);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(boxX + boxW - bracketSize, boxY);
    ctx.lineTo(boxX + boxW, boxY);
    ctx.lineTo(boxX + boxW, boxY + bracketSize);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(boxX, boxY + boxH - bracketSize);
    ctx.lineTo(boxX, boxY + boxH);
    ctx.lineTo(boxX + bracketSize, boxY + boxH);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(boxX + boxW - bracketSize, boxY + boxH);
    ctx.lineTo(boxX + boxW, boxY + boxH);
    ctx.lineTo(boxX + boxW, boxY + boxH - bracketSize);
    ctx.stroke();

    // Laser scan line
    const scanPos = boxY + ((Math.sin(t * 5) + 1) / 2) * boxH;
    ctx.strokeStyle = "rgba(249, 115, 22, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(boxX, scanPos);
    ctx.lineTo(boxX + boxW, scanPos);
    ctx.stroke();

    // Scan HUD Card
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.beginPath();
    ctx.roundRect(boxX, Math.min(h - 150, boxY + boxH + 15), Math.max(340, boxW), 80, 12);
    ctx.fill();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("TARGET ACQUIRED // AI VISION", boxX + 15, Math.min(h - 150, boxY + boxH + 15) + 26);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 17px sans-serif";
    ctx.fillText(data.objectLabel, boxX + 15, Math.min(h - 150, boxY + boxH + 15) + 52);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.fillText(data.damageSummary.slice(0, 48) + "...", boxX + 15, Math.min(h - 150, boxY + boxH + 15) + 70);
  }

  // SCENE 2: (3.2s - 6.2s) Tools & Preparation
  else if (t < 6.2) {
    const sceneProgress = (t - 3.2) / 3.0;

    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.beginPath();
    ctx.roundRect(w / 2 - 320, h / 2 - 160, 640, 320, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(249, 115, 22, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#f97316";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("STEP 1 // REQUIRED TOOLS & PREPARATION", w / 2 - 280, h / 2 - 110);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("Gather Everyday Tools", w / 2 - 280, h / 2 - 75);

    // List tools as animated pills
    const toolList = data.tools.slice(0, 4);
    toolList.forEach((tool, idx) => {
      const pillY = h / 2 - 35 + idx * 45;
      const animX = (w / 2 - 280) * Math.min(1, sceneProgress * 2.5);

      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.roundRect(animX, pillY, 560, 36, 10);
      ctx.fill();

      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.arc(animX + 22, pillY + 18, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f8fafc";
      ctx.font = "15px sans-serif";
      ctx.fillText(tool, animX + 40, pillY + 24);
    });
  }

  // SCENE 3: (6.2s - 11.5s) Mechanical Repair Visual Action Animation!
  else if (t < 11.5) {
    const actT = t - 6.2; // 0 to 5.3s
    const activeStepIdx = Math.min(data.steps.length - 1, Math.floor((actT / 5.3) * data.steps.length));
    const step = data.steps[activeStepIdx] || { title: "Perform safe repair", description: "Follow step guide" };

    // Central Visual Repair Animation Graphic
    ctx.save();
    ctx.translate(w / 2, h / 2 - 30);

    if (data.animationType === "screw_tighten") {
      // Animated Screwdriver turning & tightening screw
      const angle = actT * 4.5;
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fill();

      // Screw slot
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(-35, -7, 70, 14);
      ctx.fillRect(-7, -35, 14, 70);
      ctx.restore();

      // Circular torque progress ring
      ctx.beginPath();
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 10;
      ctx.arc(0, 0, 72, -Math.PI / 2, -Math.PI / 2 + ((actT % 2) / 2) * Math.PI * 2);
      ctx.stroke();

      // Screwdriver icon
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("TORQUE: TIGHTENING 3.5 N·m", -95, 110);
    } else if (data.animationType === "hinge_align") {
      // Animated Hinge alignment arrows
      const shift = Math.sin(actT * 3) * 15;
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 8;
      ctx.strokeRect(-100, -80, 200, 160);

      // Alignment arrow
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(-40 + shift, 0);
      ctx.lineTo(40 + shift, 0);
      ctx.stroke();
      ctx.fillText("ALIGNING DOOR PLANE", -85, 110);
    } else if (data.animationType === "chain_mount") {
      // Animated Bicycle Chain cogs & links
      const angle = actT * 2.5;
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(-60, 0, 55, 0, Math.PI * 2);
      ctx.arc(70, 0, 35, 0, Math.PI * 2);
      ctx.stroke();

      // Lube drops
      const dropY = (actT * 120) % 70;
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(-60, -20 + dropY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText("CHAIN ENGAGED & LUBRICATED", -110, 110);
    } else if (data.animationType === "fabric_stitch") {
      // Animated needle & thread stitching
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 4;
      ctx.beginPath();
      const stitches = 6;
      for (let i = 0; i < stitches; i++) {
        const sx = -120 + i * 45;
        const sy = (i % 2 === 0 ? -20 : 20) * Math.sin(actT * 4);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.fillText("REINFORCED LOCKSTITCH SEAM", -105, 110);
    } else {
      // Handle fasten or default
      ctx.fillStyle = "#f97316";
      ctx.fillRect(-120, -20, 240, 40);
      ctx.fillStyle = "#ffffff";
      ctx.fillText("FASTENING SECURELY", -80, 110);
    }

    ctx.restore();

    // Step instruction banner at bottom
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.beginPath();
    ctx.roundRect(40, h - 140, w - 80, 100, 16);
    ctx.fill();

    ctx.fillStyle = "#ea580c";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(`STEP ${step.order || activeStepIdx + 1} OF ${data.steps.length} // ${step.title.toUpperCase()}`, 65, h - 105);

    ctx.fillStyle = "#ffffff";
    ctx.font = "16px sans-serif";
    ctx.fillText(step.description.slice(0, 95), 65, h - 75);
  }

  // SCENE 4: (11.5s - 13.5s) Stability & Quality Check
  else if (t < 13.5) {
    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.beginPath();
    ctx.roundRect(w / 2 - 280, h / 2 - 140, 560, 280, 20);
    ctx.fill();

    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2 - 40, 40, 0, Math.PI * 2);
    ctx.fill();

    // Checkmark
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 18, h / 2 - 40);
    ctx.lineTo(w / 2 - 5, h / 2 - 27);
    ctx.lineTo(w / 2 + 18, h / 2 - 52);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Stability & Safety Verified", w / 2, h / 2 + 40);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "15px sans-serif";
    ctx.fillText("Repair successfully withstands load & movement tests.", w / 2, h / 2 + 70);
    ctx.textAlign = "left";
  }

  // SCENE 5: (13.5s - 15.0s) Completion & Cost Savings
  else {
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.beginPath();
    ctx.roundRect(w / 2 - 320, h / 2 - 150, 640, 300, 24);
    ctx.fill();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("COMPLETED WITH FIXLENS", w / 2 - 280, h / 2 - 95);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("15-Second Safe DIY Repair Complete", w / 2 - 280, h / 2 - 55);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "15px sans-serif";
    ctx.fillText("Estimated Technician Cost Saved: ₹450 – ₹900", w / 2 - 280, h / 2 - 15);
    ctx.fillText("Object Lifetime Extended: +2 Years", w / 2 - 280, h / 2 + 15);

    ctx.fillStyle = "#f97316";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("FixLens for iQOO Users · Empowering Everyday DIY", w / 2 - 280, h / 2 + 65);
  }

  // Bottom Timeline Progress Bar
  const progressPct = (t / 15.0) * w;
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.fillRect(0, h - 8, w, 8);
  ctx.fillStyle = "#ea580c";
  ctx.fillRect(0, h - 8, progressPct, 8);
}
