import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { VISIT_STATUS } from "@/lib/constants";
import { generateQrDataUrl } from "@/lib/qr";
import { AutoRefresh } from "./auto-refresh";

export const dynamic = "force-dynamic";

type StatusMeta = {
  label: string;
  desc: string;
  badgeClass: string;
  showBadge: boolean;
};

const STATUS_META: Record<string, StatusMeta> = {
  [VISIT_STATUS.PENDING]: {
    label: "Menunggu Konfirmasi",
    desc: "Pendaftaran Anda terkirim. Mohon tunggu persetujuan dari karyawan yang dituju. Halaman ini akan diperbarui otomatis.",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
    showBadge: false,
  },
  [VISIT_STATUS.APPROVED]: {
    label: "Disetujui",
    desc: "Kunjungan Anda disetujui. Tunjukkan badge QR di bawah kepada petugas security untuk check-in.",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    showBadge: true,
  },
  [VISIT_STATUS.CHECKED_IN]: {
    label: "Sedang Berkunjung",
    desc: "Anda sudah check-in. Simpan badge ini untuk proses checkout saat keluar.",
    badgeClass: "bg-sky-50 text-sky-700 ring-sky-200",
    showBadge: true,
  },
  [VISIT_STATUS.REJECTED]: {
    label: "Ditolak",
    desc: "Mohon maaf, kunjungan Anda tidak dapat disetujui. Silakan hubungi karyawan yang dituju atau petugas resepsionis.",
    badgeClass: "bg-rose-50 text-rose-700 ring-rose-200",
    showBadge: false,
  },
  [VISIT_STATUS.CHECKED_OUT]: {
    label: "Selesai",
    desc: "Kunjungan Anda telah selesai. Terima kasih atas kunjungannya.",
    badgeClass: "bg-slate-100 text-slate-600 ring-slate-200",
    showBadge: false,
  },
  [VISIT_STATUS.EXPIRED]: {
    label: "Kedaluwarsa",
    desc: "Pendaftaran kunjungan ini telah kedaluwarsa. Silakan mendaftar ulang.",
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

  const visit = await prisma.visit.findUnique({
    where: { qrToken: token },
    include: { visitor: true, host: { include: { department: true } } },
  });
  if (!visit) notFound();

  const meta = STATUS_META[visit.status] ?? STATUS_META[VISIT_STATUS.PENDING];
  const qr = meta.showBadge ? await generateQrDataUrl(visit.qrToken) : null;

  return (
    <main className="flex-1 px-5 py-8">
      {visit.status === VISIT_STATUS.PENDING && <AutoRefresh seconds={5} />}

      <div className="mx-auto w-full max-w-md space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Status Kunjungan
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${meta.badgeClass}`}
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
              <span className="mt-2 text-xs text-slate-400">
                Badge Digital Namu
              </span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Detail</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Nama" value={visit.visitor.fullName} />
            {visit.visitor.company && (
              <Row label="Perusahaan" value={visit.visitor.company} />
            )}
            <Row
              label="Menemui"
              value={`${visit.host.name}${
                visit.host.department ? ` (${visit.host.department.name})` : ""
              }`}
            />
            <Row label="Keperluan" value={visit.purpose} />
          </dl>
        </div>

        <Link
          href="/"
          className="block text-center text-sm text-slate-500 hover:underline"
        >
          Kembali ke beranda
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
