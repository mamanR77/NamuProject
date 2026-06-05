import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants";
import { ImportForm } from "./import-form";
import { AddEmployeeButton, type DeptOption } from "./add-form";
import { deleteEmployeeAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function KaryawanPage() {
  const [employees, departments] = await Promise.all([
    prisma.user.findMany({
      where: { role: ROLES.HOST },
      include: { department: true, _count: { select: { hostedVisits: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);
  const deptOptions: DeptOption[] = departments.map((d) => ({
    id: d.id,
    name: d.name,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Karyawan</h1>
          <p className="text-sm text-slate-500">
            Database karyawan yang dapat menjadi host/penerima tamu (total{" "}
            {employees.length}).
          </p>
        </div>
        <AddEmployeeButton departments={deptOptions} />
      </div>

      {/* Import Excel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 font-semibold text-slate-900">Import dari Excel</h2>
        <ImportForm />
      </div>

      {/* Daftar */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {employees.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            Belum ada karyawan. Import dari Excel atau tambah manual.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {employees.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{u.name}</span>
                    {u.entitas && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {u.entitas}
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    NIK {u.nik ?? "-"}
                    {u.jabatan ? ` · ${u.jabatan}` : ""}
                    {u.department ? ` · ${u.department.name}` : ""}
                  </div>
                </div>
                {u._count.hostedVisits === 0 && (
                  <form action={deleteEmployeeAction}>
                    <input type="hidden" name="userId" value={u.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      Hapus
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
