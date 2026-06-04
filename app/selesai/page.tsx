import Link from "next/link";
import { Completion } from "./completion";

export const dynamic = "force-dynamic";

export default function SelesaiPage() {
  return (
    <main className="flex-1 px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="text-sm text-slate-500 hover:underline">
          ← Beranda
        </Link>
        <header className="mt-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Konfirmasi Selesai Bertamu
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Untuk penerima tamu. Pindai barcode tamu lalu isi nama, NIK, dan
            tanda tangan.
          </p>
        </header>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Completion />
        </div>
      </div>
    </main>
  );
}
