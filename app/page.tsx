import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col px-6 py-10">
      {/* Konten utama: sambutan untuk TAMU */}
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

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="text-4xl">👋</div>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">
              Selamat Datang
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Silakan daftarkan kunjungan Anda. Pendaftaran cukup dilakukan dari
              perangkat ini.
            </p>

            <Link
              href="/register"
              className="mt-6 block w-full rounded-xl bg-rose-600 px-4 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-rose-700"
            >
              Daftar Kunjungan →
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
