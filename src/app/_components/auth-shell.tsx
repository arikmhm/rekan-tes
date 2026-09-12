import Link from "next/link";

export function AuthShell({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12 sm:py-20">
      <Link href="/" className="mb-8 flex items-center gap-3 font-semibold tracking-tight">
        <span className="grid size-9 place-items-center rounded-xl bg-brand text-sm font-bold text-white">
          RT
        </span>
        <span className="text-lg">Rekan Tes</span>
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>

      {children}

      <p className="mt-7 text-sm text-muted-foreground">{footer}</p>
    </main>
  );
}
