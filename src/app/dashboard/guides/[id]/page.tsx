import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getGuide } from "@/lib/data/guides";
import { GuideDetailClient } from "@/components/guides/guide-detail-client";

export const dynamic = "force-dynamic";

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;
  const guide = await getGuide(user!.id, id);

  if (!guide) notFound();

  return <GuideDetailClient guide={guide} />;
}
