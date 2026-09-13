import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

/**
 * Kepala halaman admin. Kerangka aplikasinya sendiri (sidebar dan header)
 * berada di `src/app/admin/layout.tsx`, sehingga bagian ini hanya mengurus
 * judul, penjelasan, dan aksi utama halaman.
 */
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
    <div className="flex flex-1 flex-col gap-6 p-4 pt-2 sm:p-6 sm:pt-3">
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

      {children}
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

/** Status transaksi punya arti berbeda dari status konten, jadi warnanya sendiri. */
export function OrderBadge({ status }: { status: string }) {
  if (status === "paid") return <Badge>{status}</Badge>;
  if (status === "refunded" || status === "cancelled") {
    return <Badge variant="secondary">{status}</Badge>;
  }
  if (status === "expired") return <Badge variant="outline">{status}</Badge>;

  return (
    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
      {status}
    </Badge>
  );
}
