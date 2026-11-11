"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-serif text-2xl font-bold">Algo salió mal</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        {error.message || "Ocurrió un error inesperado."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Reintentar
      </button>
    </main>
  );
}
