"use client";

import { useActionState } from "react";

import { startAttempt, submitSubtest } from "@/lib/attempt";

/** Memulai attempt; timer subtes pertama baru berjalan setelah ini ditekan. */
export function StartAttemptButton({ attemptId }: { attemptId: string }) {
  return (
    <AttemptForm
      attemptId={attemptId}
      action={startAttempt}
      label="Mulai mengerjakan"
      pendingLabel="Memulai…"
      className="bg-brand text-white hover:bg-brand-dark"
    />
  );
}

/** Menyubmit subtes berjalan dan melanjutkan ke subtes berikutnya. */
export function SubmitSubtestButton({ attemptId }: { attemptId: string }) {
  return (
    <AttemptForm
      attemptId={attemptId}
      action={submitSubtest}
      label="Kumpulkan subtes"
      pendingLabel="Mengumpulkan…"
      className="border border-brand/30 bg-white text-brand-dark hover:bg-mint"
    />
  );
}

function AttemptForm({
  attemptId,
  action: aksi,
  label,
  pendingLabel,
  className,
}: {
  attemptId: string;
  action: (prev: string | null, form: FormData) => Promise<string | null>;
  label: string;
  pendingLabel: string;
  className: string;
}) {
  const [pesan, action, pending] = useActionState(aksi, null);

  return (
    <form action={action}>
      <input type="hidden" name="attemptId" value={attemptId} />
      <button
        type="submit"
        disabled={pending}
        className={`w-full rounded-full px-6 py-3.5 text-sm font-bold transition disabled:opacity-60 sm:w-auto ${className}`}
      >
        {pending ? pendingLabel : label}
      </button>
      {pesan && (
        <p role="status" className="mt-3 text-sm leading-6 text-muted-foreground">
          {pesan}
        </p>
      )}
    </form>
  );
}
