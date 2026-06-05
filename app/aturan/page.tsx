import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AturanPage() {
  return (
    <main className="flex-1 px-5 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/register" className="text-sm text-slate-500 hover:underline">
          ← Kembali ke pendaftaran
        </Link>

        <header className="mt-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Aturan & Tata Tertib
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            PT Glico Manufacturing Indonesia — Karawang Factory
          </p>
        </header>

        <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-sm">
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-700 ring-1 ring-amber-200">
            Catatan: konten aturan ini masih sementara (placeholder). Teks resmi
            akan disisipkan kemudian.
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Tamu wajib mengikuti seluruh prosedur keselamatan (safety) yang
              berlaku di area perusahaan.
            </li>
            <li>
              Gunakan alat pelindung diri (APD) bila diperlukan dan ikuti arahan
              petugas.
            </li>
            <li>
              Tamu hanya berada di area yang diizinkan sesuai keperluan kunjungan.
            </li>
            <li>
              Dilarang mengambil foto/video tanpa izin di area produksi.
            </li>
            <li>
              Patuhi rambu, jalur pejalan kaki, dan batas kecepatan kendaraan di
              dalam area.
            </li>
            <li>
              Saat keadaan darurat, ikuti jalur evakuasi dan instruksi petugas.
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}
