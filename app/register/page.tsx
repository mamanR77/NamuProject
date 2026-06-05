import Link from "next/link";
import { prisma } from "@/lib/db";
import { RegisterForm, type DeptOption } from "./register-form";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });
  const deptOptions: DeptOption[] = departments.map((d) => ({
    id: d.id,
    name: d.name,
  }));

  return (
    <main className="flex-1 px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="text-sm text-slate-500 hover:underline">
          ← Kembali
        </Link>

        <header className="mt-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Pendaftaran Kunjungan Umum
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Lengkapi data berikut. Setelah mendaftar, kunjungan Anda akan ditinjau
            oleh petugas Security.
          </p>
        </header>

        <div className="mt-6">
          {deptOptions.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
              Belum ada department terdaftar. Hubungi petugas resepsionis.
            </p>
          ) : (
            <RegisterForm departments={deptOptions} />
          )}
        </div>
      </div>
    </main>
  );
}
