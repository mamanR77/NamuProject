import Link from "next/link";
import { prisma } from "@/lib/db";
import { VISIT_STATUS, VISIT_TYPE } from "@/lib/constants";
import { StatusBadge, TypeBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";
import { AutoRefresh } from "@/components/auto-refresh";
import {
  reviewOkAction,
  confirmAcceptAction,
  rejectAction,
  issueCardAction,
  gateCheckInAction,
  checkOutAction,
} from "../actions";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "ACTIVE", label: "Perlu Tindakan" },
  { key: VISIT_STATUS.PENDING_REVIEW, label: "Menunggu Review" },
  { key: VISIT_STATUS.PENDING_CONFIRM, label: "Menunggu Konfirmasi" },
  { key: VISIT_STATUS.APPROVED, label: "Siap Terbit Kartu" },
  { key: VISIT_STATUS.CARD_ISSUED, label: "Menunggu Scan Masuk" },
  { key: VISIT_STATUS.CHECKED_IN, label: "Di Dalam" },
  { key: VISIT_STATUS.CHECKED_OUT, label: "Selesai" },
];

const ACTIVE_STATUSES = [
  VISIT_STATUS.PENDING_REVIEW,
  VISIT_STATUS.PENDING_CONFIRM,
  VISIT_STATUS.APPROVED,
  VISIT_STATUS.CARD_ISSUED,
  VISIT_STATUS.CHECKED_IN,
];

function ActionBtn({
  action,
  visitId,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  visitId: string;
  label: string;
  tone: "ok" | "reject" | "neutral";
}) {
  const cls =
    tone === "ok"
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

export default async function AntrianPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = status ?? "ACTIVE";

  const where =
    active === "ACTIVE"
      ? { status: { in: ACTIVE_STATUSES } }
      : { status: active };

  const visits = await prisma.visit.findMany({
    where,
    orderBy: { createdAt: "asc" },
    include: { visitor: true, host: { include: { department: true } } },
    take: 200,
  });

  return (
    <div className="space-y-5">
      <AutoRefresh seconds={10} />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Antrian Kunjungan</h1>
        <p className="text-sm text-slate-500">
          Review, konfirmasi, terbitkan kartu, dan check-out tamu.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const isActive = active === f.key;
          return (
            <Link
              key={f.key}
              href={`/security/antrian?status=${f.key}`}
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
              const confirmTarget = isLoading
                ? "Warehouse"
                : v.host
                  ? `${v.host.name}${v.host.department ? ` (${v.host.department.name})` : ""}`
                  : "-";
              return (
                <div
                  key={v.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-900 px-1.5 text-xs font-bold text-white">
                        {v.queueNo ?? "-"}
                      </span>
                      <Link
                        href={`/security/visit/${v.qrToken}`}
                        className="font-semibold text-slate-900 hover:underline"
                      >
                        {v.visitor.fullName}
                      </Link>
                      <StatusBadge status={v.status} />
                      <TypeBadge type={v.visitType} loadingType={v.loadingType} />
                    </div>
                    <div className="mt-0.5 text-sm text-slate-500">
                      {v.visitor.company ? `${v.visitor.company} · ` : ""}
                      {isLoading
                        ? `${v.vehiclePlate ?? "-"}${v.docNumber ? ` · ${v.docNumber}` : ""}`
                        : v.purpose}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      Konfirmasi ke: {confirmTarget} · daftar{" "}
                      {formatDateTime(v.createdAt)}
                      {v.cardNo ? ` · Kartu: ${v.cardNo}` : ""}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {v.status === VISIT_STATUS.PENDING_REVIEW && (
                      <>
                        <ActionBtn
                          action={reviewOkAction}
                          visitId={v.id}
                          label="Review OK"
                          tone="ok"
                        />
                        <ActionBtn
                          action={rejectAction}
                          visitId={v.id}
                          label="Tolak"
                          tone="reject"
                        />
                      </>
                    )}

                    {v.status === VISIT_STATUS.PENDING_CONFIRM && (
                      <>
                        <ActionBtn
                          action={confirmAcceptAction}
                          visitId={v.id}
                          label="Tandai Diterima"
                          tone="ok"
                        />
                        <ActionBtn
                          action={rejectAction}
                          visitId={v.id}
                          label="Tolak"
                          tone="reject"
                        />
                      </>
                    )}

                    {v.status === VISIT_STATUS.APPROVED && (
                      <form action={issueCardAction} className="flex items-center gap-2">
                        <input type="hidden" name="visitId" value={v.id} />
                        <input
                          name="cardNo"
                          required
                          placeholder="No. Kartu Tamu"
                          className="w-32 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-slate-500"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Terbitkan Kartu
                        </button>
                      </form>
                    )}

                    {v.status === VISIT_STATUS.CARD_ISSUED && (
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-200">
                          Menunggu scan masuk
                        </span>
                        <ActionBtn
                          action={gateCheckInAction}
                          visitId={v.id}
                          label="Tandai Masuk"
                          tone="neutral"
                        />
                      </div>
                    )}

                    {v.status === VISIT_STATUS.CHECKED_IN &&
                      (v.signedAt ? (
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            ✔ Selesai: {v.signedName ?? "-"}
                          </span>
                          <ActionBtn
                            action={checkOutAction}
                            visitId={v.id}
                            label="Check-out"
                            tone="neutral"
                          />
                        </div>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                          Menunggu konfirmasi penerima tamu
                        </span>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
