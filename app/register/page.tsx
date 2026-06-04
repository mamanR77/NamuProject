import Link from "next/link";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants";
import { RegisterForm, type HostOption } from "./register-form";

// Selalu ambil data host terbaru.
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const hosts = await prisma.user.findMany({
    where: { role: ROLES.HOST },
    include: { department: true },
    orderBy: { name: "asc" },
  });

  const hostOptions: HostOption[] = hosts.map((h) => ({
    id: h.id,
    name: h.name,
    department: h.department?.name ?? null,
  }));

  return (
    <main className="flex-1 px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="text-sm text-slate-500 hover:underline">
          ← Kembali
        </Link>

        <header className="mt-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Pendaftaran Tamu
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Isi data berikut. Setelah mendaftar, kunjungan Anda menunggu
            konfirmasi dari karyawan yang dituju.
          </p>
        </header>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {hostOptions.length === 0 ? (
            <p className="text-sm text-slate-600">
              Belum ada karyawan terdaftar sebagai tujuan kunjungan. Hubungi
              petugas resepsionis.
            </p>
          ) : (
            <RegisterForm hosts={hostOptions} />
          )}
        </div>
      </div>
    </main>
  );
}
