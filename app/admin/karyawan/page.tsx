import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants";
import { ImportForm } from "./import-form";
import { AddEmployeeButton, type DeptOption } from "./add-form";
import { EditEmployeeButton } from "./edit-form";
import { deleteEmployeeAction } from "./actions";
import { ConfirmSubmit } from "@/components/confirm-submit";

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

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {employees.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            Belum ada karyawan. Import dari Excel atau tambah manual.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">NIK</th>
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">Jabatan</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Entitas</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {u.nik ?? "-"}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {u.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.jabatan ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.department?.name ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      {u.entitas ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          {u.entitas}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <EditEmployeeButton
                          departments={deptOptions}
                          employee={{
                            id: u.id,
                            nik: u.nik ?? "",
                            name: u.name,
                            jabatan: u.jabatan ?? "",
                            departmentId: u.departmentId ?? "",
                            entitas: u.entitas ?? "",
                          }}
                        />
                        <form action={deleteEmployeeAction}>
                          <input type="hidden" name="userId" value={u.id} />
                          <ConfirmSubmit
                            message={`Yakin hapus karyawan "${u.name}"?`}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                          >
                            Hapus
                          </ConfirmSubmit>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
