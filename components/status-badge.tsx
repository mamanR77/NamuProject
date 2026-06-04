import { VISIT_STATUS } from "@/lib/constants";

const MAP: Record<string, { label: string; cls: string }> = {
  [VISIT_STATUS.PENDING]: {
    label: "Menunggu",
    cls: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  [VISIT_STATUS.APPROVED]: {
    label: "Disetujui",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
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
