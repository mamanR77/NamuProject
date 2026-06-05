import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ResumeVisit } from "./resume-visit";

export const dynamic = "force-dynamic";

export default async function Home() {
  const locale = await getLocale();
  const t = getDict(locale).landing;

  return (
    <main className="flex-1 flex flex-col px-6 py-6">
      {/* Pemilih bahasa di pojok atas */}
      <div className="flex justify-end">
        <LanguageSwitcher current={locale} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-md text-center">
          {/* Logo resmi Glico */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Glico.png" alt="Glico" className="mx-auto h-20 w-auto" />

          <div className="mt-8">
            <p className="text-base text-slate-700">{t.welcome}</p>
            <p className="text-lg font-bold text-slate-900">
              PT Glico Manufacturing Indonesia
            </p>
            <p className="text-base text-slate-700">{t.factory}</p>
            <p className="mt-2 text-sm italic text-rose-600">
              &ldquo;{t.tagline}&rdquo;
            </p>
          </div>

          <p className="mt-5 text-sm text-slate-600">{t.choose}</p>

          <div className="mt-6">
            <ResumeVisit label={t.myVisit} />
          </div>

          <div className="grid gap-4">
            {/* Kunjungan Umum */}
            <Link
              href="/register"
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-rose-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-2xl">
                👤
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900">{t.general}</div>
              </div>
              <span className="text-rose-400 transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>

            {/* Loading / Unloading */}
            <Link
              href="/loading"
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-sky-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-2xl">
                🚚
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900">{t.loading}</div>
              </div>
              <span className="text-sky-400 transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-400">{t.internalNote}</p>
        </div>
      </div>

      {/* Branding aplikasi (kecil) + link staff */}
      <div className="space-y-1 pt-6 text-center">
        <p className="text-sm font-bold text-slate-600">{APP_NAME}</p>
        <p className="text-xs text-slate-400">{t.vms}</p>
        <Link
          href="/staff/login"
          className="inline-block text-xs text-slate-300 transition hover:text-slate-500"
        >
          {t.loginStaff}
        </Link>
      </div>
    </main>
  );
}
