import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ROLES, APP_NAME } from "@/lib/constants";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { denied } = await searchParams;

  const user = await getCurrentUser();
  if (user && user.role === ROLES.ADMIN) redirect("/admin");

  return (
    <main className="flex-1 flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Login Staff · PT Glico Manufacturing Indonesia
          </p>
        </div>

        {denied && (
          <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
            Akun Anda belum memiliki akses ke dashboard ini.
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Akun demo: admin@glico.local / password123
        </p>
        <Link
          href="/"
          className="mt-3 block text-center text-sm text-slate-500 hover:underline"
        >
          ← Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
