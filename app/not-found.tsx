import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="rounded-[2rem] border border-black/5 bg-white/80 p-8 text-center shadow-card backdrop-blur">
        <p className="text-sm uppercase tracking-[0.2em] text-black/45">Not found</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Appointment page unavailable</h1>
        <p className="mt-3 text-sm leading-7 text-black/60">
          This appointment link may have expired or been entered incorrectly.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
