import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { AdminNav } from "./nav";

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
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto w-full max-w-6xl px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/admin" className="flex items-center gap-2.5 font-semibold">
              <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg text-xs font-bold">
                RT
              </span>
              <span>Panel admin</span>
            </Link>
            <Link
              href="/"
              className="text-muted-foreground text-sm transition hover:text-foreground"
            >
              Lihat situs
            </Link>
          </div>
          <AdminNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-6">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>

        <Separator className="my-6" />
        {children}
      </main>
    </div>
  );
}

/** Menampilkan pesan galat dari Server Action. */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <Alert variant="destructive" role="alert">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

/** Warna status konten: terbit menonjol, arsip meredup, draft menunggu. */
export function StatusBadge({ status }: { status: string }) {
  if (status === "published") return <Badge>{status}</Badge>;
  if (status === "archived") return <Badge variant="secondary">{status}</Badge>;

  return (
    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
      {status}
    </Badge>
  );
}

/** Kotak kosong yang menjelaskan langkah berikutnya, bukan sekadar "kosong". */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
      {children}
    </div>
  );
}
