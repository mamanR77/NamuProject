import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          PT Glico Manufacturing Indonesia
        </div>

        <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
          {APP_NAME}
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Visitor Management System — penerimaan, konfirmasi, monitoring, dan
          checkout tamu secara digital.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {/* Pintu masuk TAMU */}
          <Link
            href="/register"
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-rose-300 hover:shadow-md"
          >
            <div className="text-2xl">🧑‍💼</div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">
              Saya Tamu
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Daftar kunjungan & dapatkan badge digital. Scan QR di lobby atau
              tekan di sini.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-rose-600 group-hover:underline">
              Mulai daftar →
            </span>
          </Link>

          {/* Pintu masuk STAFF */}
          <Link
            href="/staff"
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-400 hover:shadow-md"
          >
            <div className="text-2xl">🛡️</div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">
              Staff / Security
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Login untuk approval, monitoring tamu real-time, dan check-in /
              checkout.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-slate-700 group-hover:underline">
              Masuk dashboard →
            </span>
          </Link>
        </div>

        <p className="mt-10 text-xs text-slate-400">
          Sistem internal — hanya dapat diakses dari jaringan perusahaan.
        </p>
      </div>
    </main>
  );
}
