import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ROLES, VISIT_STATUS } from "@/lib/constants";
import { StatusBadge, TypeBadge } from "@/components/status-badge";
import { LiveDuration } from "@/components/live-duration";
import { AutoRefresh } from "@/components/auto-refresh";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "ALL", label: "Semua" },
  { key: VISIT_STATUS.CHECKED_IN, label: "Di Dalam" },
  { key: VISIT_STATUS.CHECKED_OUT, label: "Selesai" },
];

export default async function MonitoringPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole([ROLES.SECURITY, ROLES.ADMIN]);
  const { status } = await searchParams;
  const active = status ?? "ALL";

  const where =
    active === VISIT_STATUS.CHECKED_IN
      ? { status: VISIT_STATUS.CHECKED_IN }
      : active === VISIT_STATUS.CHECKED_OUT
        ? { status: VISIT_STATUS.CHECKED_OUT }
        : { checkInAt: { not: null } };

  const [visits, insideCount] = await Promise.all([
    prisma.visit.findMany({
      where,
      orderBy: { checkInAt: "desc" },
      include: { visitor: true },
      take: 200,
    }),
    prisma.visit.count({ where: { status: VISIT_STATUS.CHECKED_IN } }),
  ]);

  return (
    <div className="space-y-5">
      <AutoRefresh seconds={15} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monitoring</h1>
          <p className="text-sm text-slate-500">
            Durasi kunjungan (check-in → check-out). Tamu yang belum keluar
            berjalan otomatis.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-center shadow-sm">
          <div className="text-2xl font-bold text-sky-600">{insideCount}</div>
          <div className="text-xs text-slate-500">Sedang di Dalam</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/security/monitoring?status=${f.key}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              active === f.key
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {visits.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            Belum ada data check-in.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">No</th>
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Check-in</th>
                  <th className="px-4 py-3 font-semibold">Check-out</th>
                  <th className="px-4 py-3 font-semibold">Durasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-700">
                      {v.queueNo ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {v.visitor.fullName}
                        </span>
                        <TypeBadge
                          type={v.visitType}
                          loadingType={v.loadingType}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {v.checkInAt ? formatDateTime(v.checkInAt) : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {v.checkOutAt ? formatDateTime(v.checkOutAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {v.checkInAt ? (
                        <LiveDuration
                          start={v.checkInAt.toISOString()}
                          end={v.checkOutAt ? v.checkOutAt.toISOString() : null}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
