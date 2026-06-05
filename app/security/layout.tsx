import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { logoutAction } from "../admin/actions";
import { ROLES, APP_NAME } from "@/lib/constants";
import { SecurityNav } from "./nav";

export const dynamic = "force-dynamic";

export default async function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole([ROLES.SECURITY, ROLES.ADMIN]);

  return (
    <div className="flex min-h-screen flex-1 bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <div className="px-2 pb-4">
          <div className="text-lg font-bold text-slate-900">{APP_NAME}</div>
          <div className="text-xs text-slate-400">Security</div>
        </div>
        <SecurityNav />
        <div className="mt-auto border-t border-slate-100 pt-3">
          {user.role === ROLES.ADMIN && (
            <Link
              href="/admin"
              className="block rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
            >
              ← Admin
            </Link>
          )}
        </div>
      </aside>

      {/* Konten */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
          {/* Nav ringkas mobile */}
          <div className="md:hidden">
            <SecurityNav />
          </div>
          <div className="hidden text-sm text-slate-400 md:block">
            Visitor Management System
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900">
                {user.name}
              </div>
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
    </div>
  );
}
