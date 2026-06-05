import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import {
  ROLES,
  VISIT_STATUS,
  VISIT_STATUS_LABEL,
  VISIT_TYPE,
  VISIT_TYPE_LABEL,
  LOADING_TYPE_LABEL,
  ID_TYPE_LABEL,
  VEHICLE_TYPE_LABEL,
} from "@/lib/constants";
import { StatusBadge, TypeBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";
import {
  reviewOkAction,
  confirmAcceptAction,
  rejectAction,
  issueCardAction,
  gateCheckInAction,
  checkOutAction,
  assignHostAction,
} from "../../actions";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}

export default async function SecurityVisitPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  await requireRole([ROLES.SECURITY, ROLES.ADMIN]);
  const { token } = await params;

  const [visit, hosts] = await Promise.all([
    prisma.visit.findUnique({
      where: { qrToken: token },
      include: {
        visitor: true,
        host: { include: { department: true } },
        department: true,
      },
    }),
    prisma.user.findMany({
      where: { role: ROLES.HOST },
      include: { department: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!visit) notFound();

  const isLoading = visit.visitType === VISIT_TYPE.LOADING;
  const confirmTarget = isLoading
    ? "Warehouse"
    : visit.host
      ? `${visit.host.name}${visit.host.department ? ` (${visit.host.department.name})` : ""}`
      : "-";

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <Link
        href="/security/antrian"
        className="text-sm text-slate-500 hover:underline"
      >
        ← Antrian
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">
            {visit.visitor.fullName}
          </h1>
          <StatusBadge status={visit.status} />
          <TypeBadge type={visit.visitType} loadingType={visit.loadingType} />
        </div>

        <dl className="mt-4 divide-y divide-slate-100">
          <Row
            label="Jenis"
            value={VISIT_TYPE_LABEL[visit.visitType] ?? visit.visitType}
          />
          {isLoading ? (
            <>
              {visit.visitor.company && (
                <Row label="Ekspedisi" value={visit.visitor.company} />
              )}
              {visit.loadingType && (
                <Row
                  label="Aktivitas"
                  value={LOADING_TYPE_LABEL[visit.loadingType] ?? visit.loadingType}
                />
              )}
              {visit.vehiclePlate && (
                <Row label="No. Polisi" value={visit.vehiclePlate} />
              )}
              {visit.docNumber && <Row label="Dokumen" value={visit.docNumber} />}
              <Row label="Konfirmasi ke" value="Warehouse" />
            </>
          ) : (
            <>
              {visit.visitor.company && (
                <Row label="Perusahaan" value={visit.visitor.company} />
              )}
              {visit.visitor.jabatan && (
                <Row label="Jabatan" value={visit.visitor.jabatan} />
              )}
              {visit.visitor.email && (
                <Row label="Email" value={visit.visitor.email} />
              )}
              <Row label="Keperluan" value={visit.purpose} />
              {visit.detailPurpose && (
                <Row label="Detail" value={visit.detailPurpose} />
              )}
              <Row label="Department" value={visit.department?.name ?? "-"} />
              <Row label="PIC (input tamu)" value={visit.hostName ?? "-"} />
              <Row
                label="Host terdaftar"
                value={
                  visit.host
                    ? `${visit.host.name}${visit.host.nik ? ` · NIK ${visit.host.nik}` : ""}`
                    : "(belum dikoreksi)"
                }
              />
              <Row
                label="Identitas"
                value={`${ID_TYPE_LABEL[visit.visitor.idType ?? ""] ?? visit.visitor.idType ?? "-"} · ${visit.visitor.idNumber ?? "-"}`}
              />
              <Row
                label="Kendaraan"
                value={
                  VEHICLE_TYPE_LABEL[visit.vehicleType ?? ""] ??
                  visit.vehicleType ??
                  "-"
                }
              />
              {visit.vehiclePlate && (
                <Row label="No. Polisi" value={visit.vehiclePlate} />
              )}
              {visit.vehicleBrand && (
                <Row label="Brand/Type" value={visit.vehicleBrand} />
              )}
              {visit.driverType && (
                <Row
                  label="Pengemudi"
                  value={
                    visit.driverType === "DRIVER"
                      ? `Dengan supir: ${visit.driverName ?? "-"}`
                      : "Sendiri"
                  }
                />
              )}
            </>
          )}
          {visit.visitor.phone && (
            <Row label="No. HP" value={visit.visitor.phone} />
          )}
          <Row label="Status" value={VISIT_STATUS_LABEL[visit.status] ?? visit.status} />
          {visit.cardNo && <Row label="Kartu Tamu" value={visit.cardNo} />}
          <Row label="Daftar" value={formatDateTime(visit.createdAt)} />
          {visit.checkInAt && (
            <Row label="Check-in" value={formatDateTime(visit.checkInAt)} />
          )}
          {visit.signedAt && (
            <Row
              label="Konfirmasi selesai"
              value={`${visit.signedName ?? "-"}${visit.signedNik ? ` (NIK ${visit.signedNik})` : ""}`}
            />
          )}
        </dl>
      </div>

      {/* Foto identitas & swafoto */}
      {!isLoading && (visit.visitor.idPhoto || visit.visitor.selfiePhoto) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Foto</h2>
          <div className="flex gap-4">
            {visit.visitor.idPhoto && (
              <figure className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={visit.visitor.idPhoto}
                  alt="Foto identitas"
                  className="h-32 w-32 rounded-lg border border-slate-200 object-cover"
                />
                <figcaption className="mt-1 text-xs text-slate-400">
                  Identitas
                </figcaption>
              </figure>
            )}
            {visit.visitor.selfiePhoto && (
              <figure className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={visit.visitor.selfiePhoto}
                  alt="Swafoto"
                  className="h-32 w-32 rounded-lg border border-slate-200 object-cover"
                />
                <figcaption className="mt-1 text-xs text-slate-400">
                  Swafoto
                </figcaption>
              </figure>
            )}
          </div>
        </div>
      )}

      {/* Koreksi Host ke database (privacy: tamu hanya ketik nama) */}
      {!isLoading &&
        visit.status !== VISIT_STATUS.CHECKED_OUT &&
        visit.status !== VISIT_STATUS.REJECTED && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Koreksi Host (sesuaikan dengan database)
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Tamu mengetik: <b>{visit.hostName ?? "-"}</b> ·{" "}
              {visit.department?.name ?? "-"}. Pilih karyawan terdaftar yang sesuai
              (NIK dipakai untuk validasi konfirmasi selesai).
            </p>
            <form action={assignHostAction} className="mt-3 flex gap-2">
              <input type="hidden" name="visitId" value={visit.id} />
              <select
                name="hostId"
                defaultValue={visit.hostId ?? ""}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="">— Belum ditautkan —</option>
                {hosts.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                    {h.department ? ` (${h.department.name})` : ""}
                    {h.nik ? ` · ${h.nik}` : ""}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Simpan
              </button>
            </form>
          </div>
        )}

      {/* Aksi sesuai tahap */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Tindakan</h2>

        {visit.status === VISIT_STATUS.PENDING_REVIEW && (
          <div className="flex gap-2">
            <FormBtn action={reviewOkAction} id={visit.id} label="Review OK" tone="ok" />
            <FormBtn action={rejectAction} id={visit.id} label="Tolak" tone="reject" />
          </div>
        )}

        {visit.status === VISIT_STATUS.PENDING_CONFIRM && (
          <div className="space-y-2">
            <p className="text-sm text-slate-500">
              Konfirmasi ke <span className="font-medium">{confirmTarget}</span>.
            </p>
            <div className="flex gap-2">
              <FormBtn
                action={confirmAcceptAction}
                id={visit.id}
                label="Tandai Diterima"
                tone="ok"
              />
              <FormBtn action={rejectAction} id={visit.id} label="Tolak" tone="reject" />
            </div>
          </div>
        )}

        {visit.status === VISIT_STATUS.APPROVED && (
          <form action={issueCardAction} className="flex items-center gap-2">
            <input type="hidden" name="visitId" value={visit.id} />
            <input
              name="cardNo"
              required
              placeholder="No. Kartu Tamu"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Terbitkan Kartu
            </button>
          </form>
        )}

        {visit.status === VISIT_STATUS.CARD_ISSUED && (
          <div className="space-y-2">
            <p className="rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-700 ring-1 ring-violet-200">
              Kartu terbit. Tamu scan barcode di pos masuk untuk check-in.
            </p>
            <FormBtn
              action={gateCheckInAction}
              id={visit.id}
              label="Tandai Masuk (manual)"
              tone="neutral"
            />
          </div>
        )}

        {visit.status === VISIT_STATUS.CHECKED_IN &&
          (visit.signedAt ? (
            <div className="space-y-2">
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200">
                ✔ Konfirmasi selesai oleh penerima: {visit.signedName ?? "-"}
              </p>
              <FormBtn
                action={checkOutAction}
                id={visit.id}
                label="Check-out"
                tone="neutral"
              />
            </div>
          ) : (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 ring-1 ring-amber-200">
              Menunggu konfirmasi selesai dari penerima tamu sebelum check-out.
            </p>
          ))}

        {(visit.status === VISIT_STATUS.CHECKED_OUT ||
          visit.status === VISIT_STATUS.REJECTED ||
          visit.status === VISIT_STATUS.EXPIRED) && (
          <p className="text-sm text-slate-500">
            Tidak ada tindakan untuk status ini.
          </p>
        )}
      </div>
    </div>
  );
}

function FormBtn({
  action,
  id,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
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
      <input type="hidden" name="visitId" value={id} />
      <button
        type="submit"
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${cls}`}
      >
        {label}
      </button>
    </form>
  );
}
