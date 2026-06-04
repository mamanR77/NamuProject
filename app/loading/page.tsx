import Link from "next/link";
import { LoadingForm } from "./loading-form";

export const dynamic = "force-dynamic";

export default function LoadingPage() {
  return (
    <main className="flex-1 px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="text-sm text-slate-500 hover:underline">
          ← Kembali
        </Link>

        <header className="mt-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Loading / Unloading
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pendaftaran kendaraan muat/bongkar barang menuju loading area.
            Tunggu konfirmasi petugas setelah mendaftar.
          </p>
        </header>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <LoadingForm />
        </div>
      </div>
    </main>
  );
}
