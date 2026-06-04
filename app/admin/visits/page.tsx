import Link from "next/link";
import { prisma } from "@/lib/db";
import { VISIT_STATUS, VISIT_TYPE } from "@/lib/constants";
import { StatusBadge, TypeBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "ALL", label: "Semua" },
  { key: VISIT_STATUS.PENDING_REVIEW, label: "Menunggu Review" },
  { key: VISIT_STATUS.PENDING_CONFIRM, label: "Menunggu Konfirmasi" },
  { key: VISIT_STATUS.APPROVED, label: "Diterima" },
  { key: VISIT_STATUS.CHECKED_IN, label: "Di Dalam" },
  { key: VISIT_STATUS.CHECKED_OUT, label: "Selesai" },
  { key: VISIT_STATUS.REJECTED, label: "Ditolak" },
];

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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kunjungan</h1>
          <p className="text-sm text-slate-500">
            Pantau seluruh kunjungan. Operasi (review/check-in) di Antrian
            Security.
          </p>
        </div>
        <Link
          href="/security"
          className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Antrian Security →
        </Link>
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
            {visits.map((v) => {
              const isLoading = v.visitType === VISIT_TYPE.LOADING;
              return (
                <div
                  key={v.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {v.visitor.fullName}
                      </span>
                      <StatusBadge status={v.status} />
                      <TypeBadge type={v.visitType} loadingType={v.loadingType} />
                    </div>
                    <div className="mt-0.5 text-sm text-slate-500">
                      {isLoading ? (
                        <>
                          {v.visitor.company ? `${v.visitor.company} · ` : ""}
                          {v.vehiclePlate ?? "-"}
                          {v.docNumber ? ` · ${v.docNumber}` : ""}
                        </>
                      ) : (
                        <>
                          {v.visitor.company ? `${v.visitor.company} · ` : ""}
                          {v.host ? `Menemui ${v.host.name}` : "Warehouse"}
                          {v.host?.department
                            ? ` (${v.host.department.name})`
                            : ""}
                        </>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {v.purpose} · daftar {formatDateTime(v.createdAt)}
                      {v.cardNo ? ` · Kartu: ${v.cardNo}` : ""}
                      {v.checkInAt
                        ? ` · masuk ${formatDateTime(v.checkInAt)}`
                        : ""}
                      {v.checkOutAt
                        ? ` · keluar ${formatDateTime(v.checkOutAt)}`
                        : ""}
                    </div>
                  </div>

                  <Link
                    href={`/visit/${v.qrToken}`}
                    target="_blank"
                    className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Detail
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
