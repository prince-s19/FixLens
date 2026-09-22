import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getRepair } from "@/lib/data/repairs";
import { EditRepairForm } from "@/components/repairs/edit-repair-form";

export const dynamic = "force-dynamic";

export default async function EditRepairPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const repair = await getRepair(user!.id, id);
  if (!repair) notFound();

  return <EditRepairForm repair={repair} />;
}
