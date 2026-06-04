import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col px-6 py-10">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-md text-center">
          {/* Logo Glico (ganti public/glico-logo.svg dengan logo resmi) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/glico-logo.svg"
            alt="Glico"
            className="mx-auto h-20 w-auto"
          />

          <div className="mt-8">
            <p className="text-base text-slate-700">Selamat Datang di</p>
            <p className="text-lg font-bold text-slate-900">
              PT Glico Manufacturing Indonesia
            </p>
            <p className="text-base text-slate-700">Karawang Factory</p>
            <p className="mt-2 text-sm italic text-rose-600">
              &ldquo;Healthier days, Wellbeing for life&rdquo;
            </p>
          </div>

          <p className="mt-5 text-sm text-slate-600">
            Silakan pilih keperluan kunjungan Anda.
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
                <div className="font-semibold text-slate-900">
                  Kunjungan Umum
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

      {/* Branding aplikasi (kecil) + link staff */}
      <div className="space-y-1 pt-6 text-center">
        <p className="text-xs text-slate-400">
          <span className="font-semibold text-slate-500">{APP_NAME}</span> ·
          Visitor Management System
        </p>
        <Link
          href="/staff/login"
          className="inline-block text-xs text-slate-300 transition hover:text-slate-500"
        >
          Login Staff
        </Link>
      </div>
    </main>
  );
}
