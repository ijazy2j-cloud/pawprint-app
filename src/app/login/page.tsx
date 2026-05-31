"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { PawPrint, Siren } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const error = params.get("error");

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (error === "CredentialsSignin") setFormError("Invalid email or password.");
  }, [error]);

  function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    startTransition(async () => {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { setFormError(data.error ?? "Could not create account."); return; }
      }
      const result = await signIn("credentials", { email, password, redirect: false, callbackUrl });
      if (result?.error) { setFormError("Invalid email or password."); return; }
      router.push(callbackUrl);
    });
  }

  function handleGoogle() {
    startTransition(async () => {
      await signIn("google", { callbackUrl });
    });
  }

  return (
    <main className="warm-shell flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,#FFE8B5,transparent_35%),#FBF6EC] px-4 py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-[#241712] text-[#FBF6EC]">
            <PawPrint className="size-8" aria-hidden />
          </span>
          <h1 className="font-display text-3xl font-bold text-[#241712]">PawPrint Sri Lanka</h1>
          <p className="text-sm text-[#6B5847]">Free rescue network — sign in to help animals</p>
        </div>

        <div className="paw-card bg-white p-8 shadow-lg">
          {/* Mode toggle */}
          <div className="mb-6 flex rounded-2xl border border-stone-200 bg-stone-50 p-1">
            {(["signin", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setFormError(null); }}
                aria-pressed={mode === m}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${mode === m ? "bg-white shadow-sm text-[#241712]" : "text-[#6B5847] hover:text-[#241712]"}`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleCredentials} className="space-y-4">
            {mode === "register" && (
              <div>
                <label htmlFor="login-name" className="block text-sm font-bold text-[#4A3527]">Name</label>
                <input
                  id="login-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-[#E4D9C6] bg-white px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label htmlFor="login-email" className="block text-sm font-bold text-[#4A3527]">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                inputMode="email"
                className="mt-1.5 w-full rounded-2xl border border-[#E4D9C6] bg-white px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-bold text-[#4A3527]">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="mt-1.5 w-full rounded-2xl border border-[#E4D9C6] bg-white px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
              />
            </div>

            {formError && (
              <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-semibold text-[#BE123C]">{formError}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="min-h-12 w-full rounded-2xl bg-[#B45309] py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-900/20 transition hover:scale-[1.01] hover:bg-[#92400E] disabled:opacity-60"
            >
              {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 border-t border-stone-200" />
            <span className="text-xs text-stone-400 font-bold">or</span>
            <div className="flex-1 border-t border-stone-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={pending}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[#E4D9C6] bg-white py-3.5 text-sm font-bold text-[#4A3527] shadow-sm transition hover:bg-[#F4EEE2] hover:shadow-md disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-xs text-[#6B5847]">
            By signing in you agree to use PawPrint only for{" "}
            <strong className="text-stone-700">non-commercial</strong> animal welfare.{" "}
            <Link href="/" className="text-amber-700 underline">Back to home</Link>
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-xs font-bold text-amber-800"><Siren className="mr-1 inline size-3.5" />No account needed to report an emergency</p>
          <Link href="/sos-report" className="mt-1 inline-block text-xs text-amber-700 underline underline-offset-2">Report an animal in need →</Link>
        </div>
      </div>
    </main>
  );
}
