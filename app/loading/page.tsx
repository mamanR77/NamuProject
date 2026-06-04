import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";
import { LoadingForm } from "./loading-form";

export const dynamic = "force-dynamic";

export default async function LoadingPage() {
  const locale = await getLocale();
  const t = getDict(locale).loading;

  return (
    <main className="flex-1 px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="text-sm text-slate-500 hover:underline">
          {t.back}
        </Link>

        <header className="mt-4">
          <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
        </header>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <LoadingForm t={t} />
        </div>
      </div>
    </main>
  );
}
