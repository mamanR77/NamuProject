import Link from "next/link";
import { prisma } from "@/lib/db";
import { VISIT_STATUS } from "@/lib/constants";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";
import {
  approveVisitAction,
  rejectVisitAction,
  checkInVisitAction,
  checkOutVisitAction,
} from "../actions";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "ALL", label: "Semua" },
  { key: VISIT_STATUS.PENDING, label: "Menunggu" },
  { key: VISIT_STATUS.APPROVED, label: "Disetujui" },
  { key: VISIT_STATUS.CHECKED_IN, label: "Di Dalam" },
  { key: VISIT_STATUS.CHECKED_OUT, label: "Selesai" },
];

function SubmitBtn({
  action,
  visitId,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  visitId: string;
  label: string;
  tone: "approve" | "reject" | "neutral";
}) {
  const cls =
    tone === "approve"
      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
      : tone === "reject"
        ? "border border-rose-300 text-rose-600 hover:bg-rose-50"
        : "bg-slate-900 hover:bg-slate-800 text-white";
  return (
    <form action={action}>
      <input type="hidden" name="visitId" value={visitId} />
      <button
        type="submit"
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${cls}`}
      >
        {label}
      </button>
    </form>
  );
}

export default async function VisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = status && status !== "ALL" ? status : "ALL";

  const visits = await prisma.visit.findMany({
    where: active === "ALL" ? {} : { status: active },
    orderBy: { createdAt: "desc" },
    include: { visitor: true, host: { include: { department: true } } },
    take: 100,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kunjungan</h1>
        <p className="text-sm text-slate-500">
          Kelola seluruh aktivitas kunjungan tamu.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const isActive = active === f.key;
          return (
            <Link
              key={f.key}
              href={`/admin/visits?status=${f.key}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {visits.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            Tidak ada kunjungan pada filter ini.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {visits.map((v) => (
              <div
                key={v.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {v.visitor.fullName}
                    </span>
                    <StatusBadge status={v.status} />
                  </div>
                  <div className="mt-0.5 text-sm text-slate-500">
                    {v.visitor.company ? `${v.visitor.company} · ` : ""}
                    Menemui {v.host.name}
                    {v.host.department ? ` (${v.host.department.name})` : ""}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">
                    {v.purpose} · daftar {formatDateTime(v.createdAt)}
                    {v.checkInAt ? ` · masuk ${formatDateTime(v.checkInAt)}` : ""}
                    {v.checkOutAt
                      ? ` · keluar ${formatDateTime(v.checkOutAt)}`
                      : ""}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {v.status === VISIT_STATUS.PENDING && (
                    <>
                      <SubmitBtn
                        action={approveVisitAction}
                        visitId={v.id}
                        label="Setujui"
                        tone="approve"
                      />
                      <SubmitBtn
                        action={rejectVisitAction}
                        visitId={v.id}
                        label="Tolak"
                        tone="reject"
                      />
                    </>
                  )}
                  {v.status === VISIT_STATUS.APPROVED && (
                    <SubmitBtn
                      action={checkInVisitAction}
                      visitId={v.id}
                      label="Check-in"
                      tone="neutral"
                    />
                  )}
                  {v.status === VISIT_STATUS.CHECKED_IN && (
                    <SubmitBtn
                      action={checkOutVisitAction}
                      visitId={v.id}
                      label="Check-out"
                      tone="neutral"
                    />
                  )}
                  <Link
                    href={`/visit/${v.qrToken}`}
                    target="_blank"
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Badge
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
