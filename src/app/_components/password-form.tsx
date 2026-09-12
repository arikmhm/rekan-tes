"use client";

import Link from "next/link";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

import { fieldClass, labelClass, submitClass } from "./form";

/**
 * Dua langkah pemulihan password. Token, kedaluwarsa, sifat sekali pakai, dan
 * jaminan tidak membocorkan apakah email terdaftar seluruhnya ditangani Better
 * Auth; komponen ini hanya menyediakan formulirnya.
 */
export function PasswordForm({ token, error }: { token?: string; error?: string }) {
  const mode = token || error ? "reset" : "minta";
  const [pending, setPending] = useState(false);
  const [problem, setProblem] = useState<string | null>(
    error ? "Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru." : null,
  );
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProblem(null);
    setPending(true);

    const data = new FormData(event.currentTarget);

    const result =
      mode === "minta"
        ? await authClient.requestPasswordReset({
            email: String(data.get("email") ?? "").trim(),
            redirectTo: "/reset-password",
          })
        : await authClient.resetPassword({
            token: token!,
            newPassword: String(data.get("password") ?? ""),
          });

    setPending(false);

    if (result.error) {
      setProblem(result.error.message ?? "Permintaan gagal. Coba lagi.");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="mt-8 space-y-5">
        <p className="rounded-xl bg-mint px-4 py-3 text-sm leading-6 text-brand-dark">
          {mode === "minta"
            ? "Jika email tersebut terdaftar, tautan reset sudah dikirim. Periksa kotak masuk Anda."
            : "Password berhasil diganti. Seluruh sesi lama sudah dikeluarkan."}
        </p>
        <Link href="/masuk" className={`${submitClass} block text-center`}>
          Ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      {mode === "minta" ? (
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
      ) : (
        <div>
          <label className={labelClass} htmlFor="password">
            Password baru
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={fieldClass}
          />
        </div>
      )}

      {problem && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {problem}
        </p>
      )}

      {mode === "reset" && !token ? (
        <Link href="/lupa-password" className={`${submitClass} block text-center`}>
          Minta tautan baru
        </Link>
      ) : (
        <button type="submit" disabled={pending} className={submitClass}>
          {pending ? "Memproses…" : mode === "minta" ? "Kirim tautan reset" : "Simpan password"}
        </button>
      )}
    </form>
  );
}
