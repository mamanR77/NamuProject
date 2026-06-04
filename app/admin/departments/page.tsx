import { prisma } from "@/lib/db";
import { CreateDeptForm } from "./dept-form";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Departemen</h1>
        <p className="text-sm text-slate-500">
          Divisi/departemen tempat karyawan (host) bernaung.
        </p>
      </div>

      <div className="max-w-xl space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <CreateDeptForm />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {departments.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">
              Belum ada departemen.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {departments.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <span className="font-medium text-slate-900">{d.name}</span>
                  <span className="text-xs text-slate-400">
                    {d._count.users} pengguna
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
