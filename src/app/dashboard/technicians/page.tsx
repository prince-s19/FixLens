import { getCurrentUser } from "@/lib/auth";
import { listTechnicians } from "@/lib/data/technicians";
import { TechniciansClient } from "@/components/technicians/technicians-client";

export const dynamic = "force-dynamic";

export default async function TechniciansPage() {
  const user = await getCurrentUser();
  const technicians = await listTechnicians(user!.id);
  return <TechniciansClient initialTechnicians={technicians} />;
}
