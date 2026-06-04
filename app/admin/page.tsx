import Link from "next/link";
import { prisma } from "@/lib/db";
import { VISIT_STATUS, VISIT_TYPE, LOADING_TYPE_LABEL } from "@/lib/constants";
import { StatusBadge, TypeBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminDashboard() {
  const [todayCount, pendingCount, insideCount, totalVisitors, recent] =
    await Promise.all([
      prisma.visit.count({ where: { createdAt: { gte: startOfToday() } } }),
      prisma.visit.count({
        where: {
          status: {
            in: [VISIT_STATUS.PENDING_REVIEW, VISIT_STATUS.PENDING_CONFIRM],
          },
        },
      }),
      prisma.visit.count({ where: { status: VISIT_STATUS.CHECKED_IN } }),
      prisma.visitor.count(),
      prisma.visit.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { visitor: true, host: true },
      }),
    ]);

  const stats = [
    { label: "Tamu Hari Ini", value: todayCount, icon: "📅", tone: "text-slate-900" },
    { label: "Menunggu Approval", value: pendingCount, icon: "⏳", tone: "text-amber-600" },
    { label: "Sedang di Dalam", value: insideCount, icon: "🟢", tone: "text-sky-600" },
    { label: "Total Tamu", value: totalVisitors, icon: "👤", tone: "text-slate-900" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Ringkasan aktivitas kunjungan.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{s.label}</span>
              <span>{s.icon}</span>
            </div>
            <div className={`mt-2 text-3xl font-bold ${s.tone}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="font-semibold text-slate-900">Aktivitas Terbaru</h2>
          <Link
            href="/admin/visits"
            className="text-sm font-medium text-rose-600 hover:underline"
          >
            Lihat semua →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            Belum ada kunjungan.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-900">
                    {v.visitor.fullName}
                    {v.visitor.company && (
                      <span className="font-normal text-slate-400">
                        {" "}
                        · {v.visitor.company}
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {v.visitType === VISIT_TYPE.LOADING
                      ? `${LOADING_TYPE_LABEL[v.loadingType ?? ""] ?? "Loading/Unloading"}${v.vehiclePlate ? ` · ${v.vehiclePlate}` : ""}`
                      : v.host
                        ? `Menemui ${v.host.name}`
                        : "Tanpa host"}{" "}
                    · {formatDateTime(v.createdAt)}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={v.status} />
                  <TypeBadge type={v.visitType} loadingType={v.loadingType} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
