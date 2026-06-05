import Link from "next/link";
import { prisma } from "@/lib/db";
import { VISIT_STATUS, VISIT_TYPE } from "@/lib/constants";
import { TypeBadge } from "@/components/status-badge";
import { formatTime } from "@/lib/format";
import { AutoRefresh } from "@/components/auto-refresh";

export const dynamic = "force-dynamic";

// Tahap progres (urut kiri → kanan). Nama tamu berpindah kolom saat status maju.
const STAGES = [
  { key: VISIT_STATUS.PENDING_REVIEW, label: "Menunggu Review", dot: "bg-amber-400" },
  { key: VISIT_STATUS.PENDING_CONFIRM, label: "Menunggu Konfirmasi", dot: "bg-violet-400" },
  { key: VISIT_STATUS.APPROVED, label: "Diterima", dot: "bg-emerald-400" },
  { key: VISIT_STATUS.CARD_ISSUED, label: "Kartu Terbit", dot: "bg-indigo-400" },
  { key: VISIT_STATUS.CHECKED_IN, label: "Di Dalam", dot: "bg-sky-400" },
];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function SecurityDashboard() {
  const stageKeys = STAGES.map((s) => s.key);

  const [visits, insideCount, todayCount] = await Promise.all([
    prisma.visit.findMany({
      where: { status: { in: stageKeys } },
      orderBy: { createdAt: "asc" },
      include: { visitor: true, host: true },
      take: 300,
    }),
    prisma.visit.count({ where: { status: VISIT_STATUS.CHECKED_IN } }),
    prisma.visit.count({ where: { createdAt: { gte: startOfToday() } } }),
  ]);

  const byStage = Object.fromEntries(
    STAGES.map((s) => [s.key, visits.filter((v) => v.status === s.key)])
  );

  return (
    <div className="space-y-5">
      <AutoRefresh seconds={8} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Papan progres kunjungan — diperbarui otomatis.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-center shadow-sm">
            <div className="text-2xl font-bold text-sky-600">{insideCount}</div>
            <div className="text-xs text-slate-500">Di Dalam</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-center shadow-sm">
            <div className="text-2xl font-bold text-slate-900">{todayCount}</div>
            <div className="text-xs text-slate-500">Hari Ini</div>
          </div>
        </div>
      </div>

      {/* Papan progres */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STAGES.map((s) => {
          const items = byStage[s.key] ?? [];
          return (
            <div
              key={s.key}
              className="flex w-64 shrink-0 flex-col rounded-2xl border border-slate-200 bg-slate-50"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                  <span className="text-sm font-semibold text-slate-700">
                    {s.label}
                  </span>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-sm font-bold text-slate-900 ring-1 ring-slate-200">
                  {items.length}
                </span>
              </div>

              <div className="flex-1 space-y-2 p-2">
                {items.length === 0 ? (
                  <p className="px-1 py-6 text-center text-xs text-slate-400">—</p>
                ) : (
                  items.map((v) => (
                    <Link
                      key={v.id}
                      href={`/security/visit/${v.qrToken}`}
                      className="block rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold text-slate-900">
                          {v.visitor.fullName}
                        </span>
                        <span className="shrink-0 text-xs text-slate-400">
                          {formatTime(v.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <TypeBadge type={v.visitType} loadingType={v.loadingType} />
                      </div>
                      <div className="mt-1 truncate text-xs text-slate-500">
                        {v.visitType === VISIT_TYPE.LOADING
                          ? `${v.visitor.company ?? "-"}${v.vehiclePlate ? ` · ${v.vehiclePlate}` : ""}`
                          : v.host
                            ? `→ ${v.host.name}`
                            : v.purpose}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400">
        Klik kartu tamu untuk membuka tindakan, atau buka{" "}
        <Link href="/security/antrian" className="text-slate-600 underline">
          Antrian
        </Link>{" "}
        untuk daftar lengkap.
      </p>
    </div>
  );
}
