import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { logoutAction } from "../admin/actions";
import { ROLES, APP_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole([ROLES.SECURITY, ROLES.ADMIN]);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
        <div>
          <div className="text-lg font-bold text-slate-900">
            {APP_NAME}{" "}
            <span className="text-sm font-normal text-slate-400">· Security</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user.role === ROLES.ADMIN && (
            <Link
              href="/admin"
              className="text-sm text-slate-500 hover:underline"
            >
              ← Admin
            </Link>
          )}
          <div className="text-right">
            <div className="text-sm font-medium text-slate-900">{user.name}</div>
            <div className="text-xs text-slate-400">@{user.username}</div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Keluar
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-5">{children}</main>
    </div>
  );
}
