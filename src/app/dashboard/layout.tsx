import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return <DashboardShell userName={user.name}>{children}</DashboardShell>;
}
