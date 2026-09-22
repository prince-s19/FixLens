import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getGuide } from "@/lib/data/guides";
import { GuideForm } from "@/components/guides/guide-form";

export const dynamic = "force-dynamic";

export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;
  const guide = await getGuide(user!.id, id);

  if (!guide) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Edit Repair Guide</h1>
        <p className="mt-1 text-sm text-slate-500">Update steps, tools, and personal notes for this guide.</p>
      </div>
      <GuideForm initialGuide={guide} />
    </div>
  );
}
