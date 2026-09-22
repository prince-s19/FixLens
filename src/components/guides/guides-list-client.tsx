"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  Clock,
  IndianRupee,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Wrench,
} from "lucide-react";
import type { SavedRepairGuide } from "@/db/schema";
import { DifficultyBadge, TimeCostPill } from "@/components/ui/badges";
import { Button, Card, EmptyState } from "@/components/ui/misc";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { MVP_ALLOWED_CATEGORIES } from "@/lib/repairKnowledge";

export function GuidesListClient({ initialGuides }: { initialGuides: SavedRepairGuide[] }) {
  const [guides, setGuides] = useState(initialGuides);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const { confirm, dialog } = useConfirm();
  const toast = useToast();

  const filtered = useMemo(() => {
    return guides.filter((g) => {
      if (category !== "all" && g.category !== category) return false;
      if (bookmarkedOnly && !g.isBookmarked) return false;
      if (query) {
        const text = `${g.title} ${g.userNotes} ${g.tools.join(" ")}`.toLowerCase();
        if (!text.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [guides, query, category, bookmarkedOnly]);

  const toggleBookmark = async (id: string, current: boolean) => {
    setGuides((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isBookmarked: !current } : g)),
    );

    try {
      const res = await fetch(`/api/guides/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBookmarked: !current }),
      });
      if (!res.ok) {
        setGuides(initialGuides);
        toast.show({ kind: "error", title: "Couldn't update bookmark" });
      }
    } catch {
      setGuides(initialGuides);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm({
      title: `Delete guide "${title}"?`,
      description: "This will permanently remove this reusable guide from your library.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    const previous = guides;
    setGuides((prev) => prev.filter((g) => g.id !== id));

    try {
      const res = await fetch(`/api/guides/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setGuides(previous);
        toast.show({ kind: "error", title: "Couldn't delete guide" });
      } else {
        toast.show({ kind: "success", title: "Guide deleted from library" });
      }
    } catch {
      setGuides(previous);
      toast.show({ kind: "error", title: "Network error" });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {dialog}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
            <BookOpen className="h-3.5 w-3.5 text-orange-600" /> Reusable Knowledge Base
          </span>
          <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">Saved Repair Guides</h1>
          <p className="mt-1 text-sm text-slate-500">
            Bookmark, customize, and revisit step-by-step DIY solutions for everyday items.
          </p>
        </div>

        <Link href="/dashboard/guides/new">
          <Button>
            <Plus className="h-4 w-4" /> Create Custom Guide
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides by title, tools, or notes…"
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">All MVP Categories</option>
          {MVP_ALLOWED_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
            bookmarkedOnly
              ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
              : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Bookmark className="h-4 w-4" />
          <span>Bookmarked</span>
        </button>
      </div>

      {/* Guides Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-10 w-10 text-orange-600" />}
          title={guides.length === 0 ? "No saved repair guides yet" : "No guides match your filter"}
          description={
            guides.length === 0
              ? "Save a guide from any AI repair plan, or create your own custom reusable repair guide."
              : "Try adjusting your search terms or category filter."
          }
          action={
            guides.length === 0 ? (
              <div className="flex gap-2">
                <Link href="/dashboard/guides/new">
                  <Button>
                    <Plus className="h-4 w-4" /> Create Custom Guide
                  </Button>
                </Link>
                <Link href="/dashboard/repairs">
                  <Button variant="outline">Browse Repair Cases</Button>
                </Link>
              </div>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <div
              key={g.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Link href={`/dashboard/guides/${g.id}`} className="relative aspect-video w-full bg-slate-100">
                {g.coverImageUrl ? (
                  <Image src={g.coverImageUrl} alt={g.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-400">
                    <Wrench className="h-10 w-10 text-orange-500/60" />
                  </div>
                )}
                <div className="absolute left-2.5 top-2.5">
                  <DifficultyBadge difficulty={g.difficulty} />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleBookmark(g.id, g.isBookmarked);
                  }}
                  className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition ${
                    g.isBookmarked
                      ? "bg-amber-500 text-white shadow"
                      : "bg-black/40 text-white hover:bg-black/60"
                  }`}
                  title={g.isBookmarked ? "Remove bookmark" : "Bookmark guide"}
                >
                  <Bookmark className="h-4 w-4 fill-current" />
                </button>
              </Link>

              <div className="flex flex-1 flex-col p-4">
                <Link href={`/dashboard/guides/${g.id}`}>
                  <h3 className="line-clamp-1 text-base font-bold text-slate-900 transition group-hover:text-orange-600">
                    {g.title}
                  </h3>
                </Link>

                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {g.userNotes || `${g.steps.length} verified steps · ${g.tools.length} tools needed`}
                </p>

                <div className="mt-3">
                  <TimeCostPill
                    minutes={g.estimatedTimeMinutes}
                    costMin={g.estimatedCostMin}
                    costMax={g.estimatedCostMax}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                  <span>{g.steps.length} Steps</span>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/guides/${g.id}/edit`}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      title="Edit guide"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(g.id, g.title)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Delete guide"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
