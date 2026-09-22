import { getCurrentUser } from "@/lib/auth";
import { listGuides } from "@/lib/data/guides";
import { GuidesListClient } from "@/components/guides/guides-list-client";

export const dynamic = "force-dynamic";

export default async function GuidesPage() {
  const user = await getCurrentUser();
  const guides = await listGuides(user!.id);
  return <GuidesListClient initialGuides={guides} />;
}
