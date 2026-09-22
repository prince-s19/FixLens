import { GuideForm } from "@/components/guides/guide-form";

export const dynamic = "force-dynamic";

export default function NewGuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Create New Repair Guide</h1>
        <p className="mt-1 text-sm text-slate-500">
          Document your custom DIY repair procedures into a reusable guide for your library.
        </p>
      </div>
      <GuideForm />
    </div>
  );
}
