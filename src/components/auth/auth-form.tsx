"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, User, Wrench } from "lucide-react";
import Link from "next/link";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "login" ? { email, password } : { name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 text-white">
            <Wrench className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-950">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "login"
              ? "Log in to see your repair history and continue fixing."
              : "Start generating AI repair videos in under a minute."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error ? (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
              {error}
            </div>
          ) : null}

          {mode === "register" ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Full name</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="Ananya Sharma"
                />
              </div>
            </div>
          ) : null}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-600/30 transition hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "login" ? "Log in" : "Create account"}
          </button>

          {mode === "login" ? (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
              Demo login: <span className="font-medium text-slate-700">demo@fixit.ai</span> / <span className="font-medium text-slate-700">demo1234</span>
            </p>
          ) : null}
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          {mode === "login" ? (
            <>
              New to FixIt AI?{" "}
              <Link href="/register" className="font-semibold text-orange-600 hover:underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-orange-600 hover:underline">
                Log in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
