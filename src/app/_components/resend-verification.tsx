"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";

import { submitClass } from "./auth-form";

export function ResendVerification({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "pending" | "sent" | "failed">("idle");

  if (state === "sent") {
    return (
      <p className="mt-7 rounded-xl bg-mint px-4 py-3 text-sm leading-6 text-brand-dark">
        Email verifikasi sudah dikirim ulang. Periksa kotak masuk Anda.
      </p>
    );
  }

  return (
    <div className="mt-7 space-y-3">
      <button
        type="button"
        disabled={state === "pending"}
        className={submitClass}
        onClick={async () => {
          setState("pending");
          const { error } = await authClient.sendVerificationEmail({ email, callbackURL: "/" });
          setState(error ? "failed" : "sent");
        }}
      >
        {state === "pending" ? "Mengirim…" : "Kirim ulang email verifikasi"}
      </button>
      {state === "failed" && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Pengiriman gagal. Coba lagi beberapa saat lagi.
        </p>
      )}
    </div>
  );
}
