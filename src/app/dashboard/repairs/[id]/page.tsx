import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getRepair } from "@/lib/data/repairs";
import { RepairDetailClient } from "@/components/repairs/repair-detail-client";

export const dynamic = "force-dynamic";

export default async function RepairDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const repair = await getRepair(user!.id, id);
  if (!repair) notFound();

  return <RepairDetailClient repair={repair} />;
}
