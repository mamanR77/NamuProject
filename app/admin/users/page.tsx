import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { deleteUserAction } from "../actions";
import { CreateUserForm, type DeptOption } from "./user-form";
import { ChangePassword } from "./change-password";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Super Admin",
  SECURITY: "Security",
};

const ROLE_CLS: Record<string, string> = {
  ADMIN: "bg-slate-900 text-white",
  SECURITY: "bg-sky-100 text-sky-700",
};

export default async function UsersPage() {
  const me = await getCurrentUser();
  const [users, departments] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: [ROLES.ADMIN, ROLES.SECURITY] } },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      include: { department: true, _count: { select: { hostedVisits: true } } },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  const deptOptions: DeptOption[] = departments.map((d) => ({
    id: d.id,
    name: d.name,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengguna</h1>
        <p className="text-sm text-slate-500">
          Kelola akun staff: Super Admin & Security. (Karyawan/host dikelola di
          menu Karyawan.)
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Daftar */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-100">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {u.name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          ROLE_CLS[u.role] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ROLE_LABEL[u.role] ?? u.role}
                      </span>
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      @{u.username}
                      {u.department ? ` · ${u.department.name}` : ""}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <ChangePassword userId={u.id} />
                    {me?.id !== u.id && u._count.hostedVisits === 0 && (
                      <form action={deleteUserAction}>
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
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form tambah */}
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-slate-900">
              Tambah Pengguna
            </h2>
            <CreateUserForm departments={deptOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
