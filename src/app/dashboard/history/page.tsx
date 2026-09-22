import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock3, History as HistoryIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listActivity, listRepairs } from "@/lib/data/repairs";
import { EmptyState, Card, SectionTitle } from "@/components/ui/misc";
import { DifficultyBadge } from "@/components/ui/badges";

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

export default async function HistoryPage() {
  const user = await getCurrentUser();
  const [repairs, activity] = await Promise.all([listRepairs(user!.id), listActivity(user!.id, 60)]);
  const completed = (repairs as any[]).filter((r: any) => r.status === "completed");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Repair history</h1>
        <p className="mt-1 text-sm text-slate-500">A record of everything you've fixed with FixLens.</p>
      </div>

      <div>
        <SectionTitle subtitle="Before-and-after proof of your completed repairs">Completed repairs</SectionTitle>
        {completed.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="h-10 w-10" />}
            title="No completed repairs yet"
            description="Once you finish a repair and add an after photo, it will show up here."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((r: any) => (
              <Link
                key={r.id}
                href={`/dashboard/repairs/${r.id}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="grid grid-cols-2 gap-0.5 bg-slate-100">
                  <div className="relative aspect-square">
                    <Image src={r.photoBeforeUrl} alt="Before" fill className="object-cover" />
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      Before
                    </span>
                  </div>
                  <div className="relative aspect-square">
                    <Image src={r.photoAfterUrl!} alt="After" fill className="object-cover" />
                    <span className="absolute bottom-1 left-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      After
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="truncate text-sm font-semibold text-slate-900">{r.title}</h3>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{r.objectLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionTitle>Full activity timeline</SectionTitle>
        <Card className="p-5">
          {activity.length === 0 ? (
            <EmptyState icon={<HistoryIcon className="h-10 w-10" />} title="No activity yet" />
          ) : (
            <ol className="relative space-y-6 border-l border-slate-200 pl-5">
              {(activity as any[]).map((a: any) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white bg-orange-500 shadow" />
                  <p className="text-sm text-slate-700">{a.detail}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                    <Clock3 className="h-3 w-3" /> {timeAgo(a.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}
