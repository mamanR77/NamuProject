import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col px-6 py-10">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            PT Glico Manufacturing Indonesia
          </div>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-sm font-medium uppercase tracking-wide text-slate-400">
            Visitor Management System
          </p>

          <p className="mt-8 text-base text-slate-600">
            Selamat datang 👋 <br /> Silakan pilih keperluan kunjungan Anda.
          </p>

          <div className="mt-6 grid gap-4">
            {/* Tamu umum */}
            <Link
              href="/register"
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-rose-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-2xl">
                👤
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900">Tamu</div>
                <div className="text-sm text-slate-500">
                  Meeting, audit, kunjungan umum
                </div>
              </div>
              <span className="text-rose-400 transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>

            {/* Loading / Unloading */}
            <Link
              href="/loading"
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-sky-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-2xl">
                🚚
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900">
                  Loading / Unloading
                </div>
                <div className="text-sm text-slate-500">
                  Muat / bongkar barang ke loading area
                </div>
              </div>
              <span className="text-sky-400 transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Sistem internal — hanya dapat diakses dari jaringan perusahaan.
          </p>
        </div>
      </div>

      {/* Link kecil & samar untuk staff (modul terpisah) */}
      <div className="pt-6 text-center">
        <Link
          href="/staff/login"
          className="text-xs text-slate-300 transition hover:text-slate-500"
        >
          Login Staff
        </Link>
      </div>
    </main>
  );
}
