import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { VISIT_STATUS, VISIT_TYPE, LOADING_TYPE } from "@/lib/constants";
import { generateQrDataUrl } from "@/lib/qr";
import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";
import { AutoRefresh } from "./auto-refresh";

export const dynamic = "force-dynamic";

// Gaya & apakah badge ditampilkan, per status. Label/desc diambil dari kamus bahasa.
const STATUS_STYLE: Record<string, { badgeClass: string; showBadge: boolean }> = {
  [VISIT_STATUS.PENDING_REVIEW]: {
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
    showBadge: false,
  },
  [VISIT_STATUS.PENDING_CONFIRM]: {
    badgeClass: "bg-violet-50 text-violet-700 ring-violet-200",
    showBadge: false,
  },
  [VISIT_STATUS.APPROVED]: {
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    showBadge: true,
  },
  [VISIT_STATUS.CHECKED_IN]: {
    badgeClass: "bg-sky-50 text-sky-700 ring-sky-200",
    showBadge: true,
  },
  [VISIT_STATUS.REJECTED]: {
    badgeClass: "bg-rose-50 text-rose-700 ring-rose-200",
    showBadge: false,
  },
  [VISIT_STATUS.CHECKED_OUT]: {
    badgeClass: "bg-slate-100 text-slate-600 ring-slate-200",
    showBadge: false,
  },
  [VISIT_STATUS.EXPIRED]: {
    badgeClass: "bg-slate-100 text-slate-600 ring-slate-200",
    showBadge: false,
  },
};

export default async function VisitStatusPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const locale = await getLocale();
  const t = getDict(locale).visit;

  const visit = await prisma.visit.findUnique({
    where: { qrToken: token },
    include: { visitor: true, host: { include: { department: true } } },
  });
  if (!visit) notFound();

  const style =
    STATUS_STYLE[visit.status] ?? STATUS_STYLE[VISIT_STATUS.PENDING_REVIEW];
  const meta = t.status[visit.status] ?? t.status[VISIT_STATUS.PENDING_REVIEW];
  const isLive = (
    [
      VISIT_STATUS.PENDING_REVIEW,
      VISIT_STATUS.PENDING_CONFIRM,
      VISIT_STATUS.APPROVED,
    ] as string[]
  ).includes(visit.status);
  const qr = style.showBadge ? await generateQrDataUrl(visit.qrToken) : null;
  const isLoading = visit.visitType === VISIT_TYPE.LOADING;
  const activityLabel =
    visit.loadingType === LOADING_TYPE.UNLOADING ? t.actUnloading : t.actLoading;

  return (
    <main className="flex-1 px-5 py-8">
      {isLive && <AutoRefresh seconds={5} />}

      <div className="mx-auto w-full max-w-md space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {t.statusTitle}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${style.badgeClass}`}
            >
              {meta.label}
            </span>
          </div>

          <p className="mt-3 text-sm text-slate-600">{meta.desc}</p>

          {qr && (
            <div className="mt-5 flex flex-col items-center rounded-xl bg-slate-50 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr}
                alt="Badge QR"
                width={200}
                height={200}
                className="rounded-lg bg-white p-2 shadow-sm"
              />
              <span className="mt-2 text-xs text-slate-400">{t.badge}</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">{t.detail}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row
              label={t.f.type}
              value={isLoading ? t.typeLoading : t.typeGeneral}
            />
            {isLoading ? (
              <>
                <Row label={t.f.driver} value={visit.visitor.fullName} />
                {visit.visitor.company && (
                  <Row label={t.f.transporter} value={visit.visitor.company} />
                )}
                {visit.loadingType && (
                  <Row label={t.f.activity} value={activityLabel} />
                )}
                {visit.vehiclePlate && (
                  <Row label={t.f.plate} value={visit.vehiclePlate} />
                )}
                {visit.docNumber && (
                  <Row label={t.f.doc} value={visit.docNumber} />
                )}
              </>
            ) : (
              <>
                <Row label={t.f.name} value={visit.visitor.fullName} />
                {visit.visitor.company && (
                  <Row label={t.f.company} value={visit.visitor.company} />
                )}
                {visit.host && (
                  <Row
                    label={t.f.meeting}
                    value={`${visit.host.name}${
                      visit.host.department
                        ? ` (${visit.host.department.name})`
                        : ""
                    }`}
                  />
                )}
                <Row label={t.f.purpose} value={visit.purpose} />
              </>
            )}
          </dl>
        </div>

        <Link
          href="/"
          className="block text-center text-sm text-slate-500 hover:underline"
        >
          {t.back}
        </Link>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}
