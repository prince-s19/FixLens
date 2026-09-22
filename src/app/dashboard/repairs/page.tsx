import { getCurrentUser } from "@/lib/auth";
import { listRepairs } from "@/lib/data/repairs";
import { RepairsListClient } from "@/components/repairs/repairs-list-client";

export const dynamic = "force-dynamic";

export default async function RepairsPage() {
  const user = await getCurrentUser();
  const repairs = await listRepairs(user!.id);
  return <RepairsListClient initialRepairs={repairs} />;
}
