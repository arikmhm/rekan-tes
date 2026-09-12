import Link from "next/link";

const tab = "rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-cream";

export function AdminShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:py-14">
      <nav aria-label="Navigasi admin" className="flex flex-wrap items-center gap-1 text-muted">
        <Link className={tab} href="/admin">
          Ringkasan
        </Link>
        <Link className={tab} href="/admin/kategori">
          Kategori
        </Link>
        <Link className={tab} href="/admin/soal">
          Bank soal
        </Link>
        <Link className={tab} href="/admin/subtes">
          Subtes
        </Link>
        <Link className={tab} href="/admin/tes">
          Produk tes
        </Link>
      </nav>

      <div className="mt-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-2 text-sm leading-6 text-muted">{description}</p>}
        </div>
        {action}
      </div>

      <div className="mt-8">{children}</div>
    </main>
  );
}

/** Menampilkan pesan galat dari Server Action. */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </p>
  );
}

const badgeBase = "rounded-full px-2.5 py-1 text-xs font-semibold";

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "published"
      ? "bg-mint text-brand-dark"
      : status === "archived"
        ? "bg-black/6 text-muted"
        : "bg-amber-100 text-amber-800";

  return <span className={`${badgeBase} ${tone}`}>{status}</span>;
}
