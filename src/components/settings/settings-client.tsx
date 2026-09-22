"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Languages, Lock, User } from "lucide-react";
import { Button, Card, SectionTitle } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import type { SessionUser } from "@/lib/auth";

export function SettingsClient({ user }: { user: SessionUser }) {
  const [name, setName] = useState(user.name);
  const [lang, setLang] = useState(user.preferredLanguage as "en" | "ta");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const router = useRouter();
  const toast = useToast();

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, preferredLanguage: lang }),
    });
    setSavingProfile(false);
    if (!res.ok) {
      const data = await res.json();
      toast.show({ kind: "error", title: "Couldn't save profile", description: data.error });
      return;
    }
    toast.show({ kind: "success", title: "Profile updated" });
    router.refresh();
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    const res = await fetch("/api/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSavingPassword(false);
    if (!res.ok) {
      toast.show({ kind: "error", title: "Couldn't change password", description: data.error });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    toast.show({ kind: "success", title: "Password updated" });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your profile, narration language, and password.</p>
      </div>

      <Card className="p-6">
        <SectionTitle subtitle="Your name and preferred narration language">
          <span className="inline-flex items-center gap-2">
            <User className="h-4 w-4 text-orange-600" /> Profile
          </span>
        </SectionTitle>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Email</label>
            <input
              disabled
              value={user.email}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              <Languages className="mr-1 inline h-3.5 w-3.5" /> Default narration language
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  lang === "en" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("ta")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  lang === "ta" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                தமிழ் (Tamil)
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={savingProfile}>
              Save profile
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <SectionTitle subtitle="Choose a strong password you don't use elsewhere">
          <span className="inline-flex items-center gap-2">
            <Lock className="h-4 w-4 text-orange-600" /> Password
          </span>
        </SectionTitle>
        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Current password</label>
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">New password</label>
            <input
              required
              minLength={6}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={savingPassword}>
              Update password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
