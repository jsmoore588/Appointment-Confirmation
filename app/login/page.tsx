"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Login failed. Check your credentials.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-card backdrop-blur"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">Secure Access</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Dashboard login</h1>
        <p className="mt-3 text-sm leading-7 text-black/60">
          Use `DASHBOARD_EMAIL` and `DASHBOARD_PASSWORD` from your local environment.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-ink">
            Email
            <input
              name="email"
              type="email"
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#faf7f0] px-4 py-3"
              required
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            Password
            <input
              name="password"
              type="password"
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#faf7f0] px-4 py-3"
              required
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-[#8b3d34]">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-ink px-5 py-4 text-sm font-medium text-white"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
