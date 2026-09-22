import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Camera,
  ClipboardList,
  Languages,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
  Video,
  Wrench,
} from "lucide-react";

const FEATURES = [
  {
    icon: Camera,
    title: "Instant Camera & Photo Capture",
    desc: "Snap a photo of the damaged object directly on your iQOO smartphone or upload an existing picture.",
  },
  {
    icon: Sparkles,
    title: "Real AI Object & Damage Detection",
    desc: "FixLens AI detects the object, pinpoints the damage locus, and visually marks the bounding box.",
  },
  {
    icon: Video,
    title: "15-Second AI Repair Video",
    desc: "Procedural motion walkthrough demonstrating the safe mechanical fix, with downloadable WebM video file.",
  },
  {
    icon: Languages,
    title: "Tamil & English AI Voiceover",
    desc: "Authentic neural voice narration in both English and Tamil synchronized directly into the repair video.",
  },
  {
    icon: ShieldCheck,
    title: "Strict DIY Safety Gate",
    desc: "Scoped for low-risk repairs (cabinet hinges, loose screws, drawer handles, torn bags, bike chains).",
  },
  {
    icon: ShieldAlert,
    title: "Dangerous Repair Hard-Lock",
    desc: "Blocks electrical, gas, vehicle-brake, structural, and medical repairs with emergency safety protocols.",
  },
  {
    icon: Users,
    title: "Technician Escalation",
    desc: "Direct 1-click dispatch to certified local electricians, gas technicians, and civil engineers when unsafe.",
  },
  {
    icon: BookOpen,
    title: "Saved Repair Guides Library",
    desc: "Full CRUD reusable guides library with interactive step checklists, required tools, and personal notes.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/30">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900">FixLens</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">for iQOO Users</span>
          </div>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-orange-600/30 hover:bg-orange-700"
          >
            Get started free
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-10 md:grid-cols-2 md:items-center md:py-16">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-inset ring-orange-200">
            <Sparkles className="h-3.5 w-3.5" /> Built for iQOO smartphone users &amp; everyday fixers
          </span>
          <h1 className="mt-4 text-[clamp(2.1rem,4.6vw,3.2rem)] font-bold leading-[1.1] tracking-tight text-slate-950">
            Snap a photo. Get a 15-second AI repair video.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600">
            FixLens empowers students, renters, households, DIY beginners, and small shop owners
            to fix everyday items — loose furniture screws, cabinet hinges, drawer handles, torn bags,
            and bicycle chains — with procedural animated videos and Tamil &amp; English narration.
          </p>

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              <strong>Safety Guardrail:</strong> Electrical, gas, vehicle-brake, structural, and medical repairs are strictly hard-locked with immediate technician escalation.
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700"
            >
              Start repairing with FixLens
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Demo login (demo@fixit.ai)
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
            <div>
              <p className="text-xl font-bold text-slate-900">15s</p>
              <p className="text-xs">Generated Videos</p>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">5 Low-Risk</p>
              <p className="text-xs">MVP Categories</p>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">Tamil &amp; EN</p>
              <p className="text-xs">AI Voice Narration</p>
            </div>
            <div>
              <p className="text-xl font-bold text-rose-600">Strict Lock</p>
              <p className="text-xs">Hazard Protection</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-orange-200 via-amber-100 to-teal-100 blur-2xl" />
          <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-2xl shadow-slate-900/20">
            <Image
              src="/images/hero-repair.jpg"
              alt="FixLens AI Visual Repair Platform"
              width={900}
              height={900}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-10 max-w-xl">
          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Comprehensive Repair Guidance</h2>
          <p className="mt-2 text-slate-600">
            Built from the ground up for iQOO users with real AI computer vision, generated video walkthroughs, and robust safety protocols.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-slate-950 px-8 py-12 text-center sm:px-16">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to fix your everyday items?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-300">
            Use demo login <span className="font-mono text-orange-400">demo@fixit.ai</span> with password <span className="font-mono text-orange-400">demo1234</span> or register a free account.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700"
          >
            Create free account
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} FixLens. Empowering iQOO users and everyday DIY fixers.
      </footer>
    </main>
  );
}
