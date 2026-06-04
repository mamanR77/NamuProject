import { VISIT_STATUS, VISIT_TYPE } from "@/lib/constants";

const MAP: Record<string, { label: string; cls: string }> = {
  [VISIT_STATUS.PENDING_REVIEW]: {
    label: "Menunggu Review",
    cls: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  [VISIT_STATUS.PENDING_CONFIRM]: {
    label: "Menunggu Konfirmasi",
    cls: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  [VISIT_STATUS.APPROVED]: {
    label: "Diterima",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  [VISIT_STATUS.CARD_ISSUED]: {
    label: "Kartu Terbit",
    cls: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  [VISIT_STATUS.REJECTED]: {
    label: "Ditolak",
    cls: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  [VISIT_STATUS.CHECKED_IN]: {
    label: "Di Dalam",
    cls: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  [VISIT_STATUS.CHECKED_OUT]: {
    label: "Selesai",
    cls: "bg-slate-100 text-slate-600 ring-slate-200",
  },
  [VISIT_STATUS.EXPIRED]: {
    label: "Kedaluwarsa",
    cls: "bg-slate-100 text-slate-500 ring-slate-200",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = MAP[status] ?? { label: status, cls: "bg-slate-100 text-slate-600 ring-slate-200" };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
}

export function TypeBadge({
  type,
  loadingType,
}: {
  type: string;
  loadingType?: string | null;
}) {
  if (type === VISIT_TYPE.LOADING) {
    const label =
      loadingType === "UNLOADING"
        ? "Unloading"
        : loadingType === "LOADING"
          ? "Loading"
          : "Loading/Unloading";
    return (
      <span className="inline-block rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
        🚚 {label}
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
      Kunjungan Umum
    </span>
  );
}
