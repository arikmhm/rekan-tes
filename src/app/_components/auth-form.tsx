"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

type Mode = "daftar" | "masuk";

const labelClass = "block text-sm font-semibold text-ink";
const fieldClass =
  "mt-2 w-full rounded-xl border border-black/12 bg-white px-4 py-3 text-base outline-none transition focus:border-brand/40";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const data = new FormData(event.currentTarget);
    const usernameValue = String(data.get("username") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const result =
      mode === "daftar"
        ? await authClient.signUp.email({
            // `name` mengikuti username. Role tidak pernah dikirim dari browser.
            name: usernameValue,
            username: usernameValue,
            email: String(data.get("email") ?? "").trim(),
            password,
          })
        : await authClient.signIn.username({ username: usernameValue, password });

    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Permintaan gagal. Coba lagi.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <div>
        <label className={labelClass} htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          required
          minLength={3}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          className={fieldClass}
        />
      </div>

      {mode === "daftar" && (
        <div>
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "daftar" ? "new-password" : "current-password"}
          className={fieldClass}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Memproses…" : mode === "daftar" ? "Buat akun" : "Masuk"}
      </button>
    </form>
  );
}
