import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "./actions";
import { APP_NAME } from "@/lib/constants";
import { AdminNav } from "./nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-1 bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <div className="px-2 pb-4">
          <div className="text-lg font-bold text-slate-900">{APP_NAME}</div>
          <div className="text-xs text-slate-400">Super Admin</div>
        </div>
        <AdminNav />
        <div className="mt-auto border-t border-slate-100 pt-3">
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
          >
            ↗ Lihat situs publik
          </Link>
        </div>
      </aside>

      {/* Konten */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
          {/* Nav ringkas untuk mobile */}
          <div className="md:hidden">
            <AdminNav />
          </div>
          <div className="hidden md:block text-sm text-slate-400">
            Visitor Management System
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900">
                {user.name}
              </div>
              <div className="text-xs text-slate-400">{user.email}</div>
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
