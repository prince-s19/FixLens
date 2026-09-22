import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Clock3, ListChecks, Plus, ShieldAlert, Sparkles, Wrench } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listRepairs, listActivity } from "@/lib/data/repairs";
import { listEscalations } from "@/lib/data/escalations";
import { StatusBadge, DifficultyBadge } from "@/components/ui/badges";
import { Card, EmptyState } from "@/components/ui/misc";

export const dynamic = "force-dynamic";

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.345, "w"],
    [12, "mo"],
  ];
  let value = seconds;
  let unit = "s";
  for (const [size, label] of units) {
    if (value < size) {
      unit = label;
      break;
    }
    value = Math.floor(value / size);
    unit = label;
  }
  return `${value}${unit} ago`;
}

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  const [repairs, activity, escalations] = await Promise.all([
    listRepairs(user!.id),
    listActivity(user!.id, 8),
    listEscalations(user!.id),
  ]);

  const repairList = repairs as any[];
  const activityList = activity as any[];
  const escalationList = escalations as any[];

  const completed = repairList.filter((r: any) => r.status === "completed").length;
  const active = repairList.filter((r: any) => r.status === "ready" || r.status === "in_progress").length;
  const escalated = repairList.filter((r: any) => r.status === "escalated").length;
  const totalMinutesSaved = repairList.reduce((sum: number, r: any) => sum + (r.estimatedTimeMinutes || 0), 0);

  const stats = [
    { label: "Total repairs", value: repairList.length, icon: Wrench, tint: "bg-orange-50 text-orange-600" },
    { label: "Completed", value: completed, icon: CheckCircle2, tint: "bg-emerald-50 text-emerald-600" },
    { label: "Active plans", value: active, icon: ListChecks, tint: "bg-sky-50 text-sky-600" },
    { label: "Escalated", value: escalated, icon: ShieldAlert, tint: "bg-rose-50 text-rose-600" },
  ];

  const pendingEscalations = escalationList.filter((e: any) => e.status === "pending" || e.status === "accepted");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950 p-6 text-white sm:flex-row sm:items-center">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> Welcome back, {user!.name.split(" ")[0]}
          </p>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">What are we fixing today?</h1>
          <p className="mt-1 max-w-lg text-sm text-slate-300">
            Upload a photo and get an AI-generated repair video with steps, tools, safety checks, and cost
            estimates in seconds.
          </p>
        </div>
        <Link
          href="/dashboard/repairs/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/40 hover:bg-orange-500"
        >
          <Plus className="h-4 w-4" /> New AI repair
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${s.tint}`}>
              <s.icon className="h-4.5 w-4.5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </Card>
        ))}
      </div>

      {pendingEscalations.length > 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-800">
              {pendingEscalations.length} repair{pendingEscalations.length > 1 ? "s" : ""} waiting on a technician
            </p>
            <p className="text-sm text-rose-700">
              Some of your repairs were flagged as unsafe or complex for DIY.{" "}
              <Link href="/dashboard/escalations" className="font-semibold underline">
                Review escalations
              </Link>
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent repairs</h2>
            <Link href="/dashboard/repairs" className="text-sm font-medium text-orange-600 hover:underline">
              View all
            </Link>
          </div>

          {repairs.length === 0 ? (
            <EmptyState
              icon={<Wrench className="h-10 w-10" />}
              title="No repairs yet"
              description="Start by uploading a photo of something broken — FixIt AI will do the rest."
              action={
                <Link
                  href="/dashboard/repairs/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4" /> Create your first repair
                </Link>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {repairList.slice(0, 4).map((r: any) => (
                <Link
                  key={r.id}
                  href={`/dashboard/repairs/${r.id}`}
                  className="group flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image src={r.photoBeforeUrl} alt={r.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-orange-600">
                      {r.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{r.objectLabel || "Analyzing…"}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={r.status} />
                      <DifficultyBadge difficulty={r.difficulty} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Activity feed</h2>
          <Card className="p-4">
            {activityList.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No activity yet.</p>
            ) : (
              <ol className="space-y-4">
                {activityList.map((a: any) => (
                  <li key={a.id} className="flex gap-3 text-sm">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                    <div>
                      <p className="text-slate-700">{a.detail}</p>
                      <p className="text-xs text-slate-400">
                        <Clock3 className="mr-1 inline h-3 w-3" />
                        {timeAgo(a.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
