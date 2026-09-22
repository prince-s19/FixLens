import { getCurrentUser } from "@/lib/auth";
import { listEscalations } from "@/lib/data/escalations";
import { EscalationsClient } from "@/components/escalations/escalations-client";

export const dynamic = "force-dynamic";

export default async function EscalationsPage() {
  const user = await getCurrentUser();
  const escalations = await listEscalations(user!.id);
  return <EscalationsClient initialEscalations={escalations} />;
}
