import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import {
  ROLES,
  VISIT_STATUS,
  VISIT_TYPE,
  ID_TYPE_LABEL,
  VEHICLE_TYPE_LABEL,
  LOADING_TYPE_LABEL,
} from "@/lib/constants";
import { TypeBadge } from "@/components/status-badge";
import { PhotoZoom } from "@/components/photo-zoom";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { AutoRefresh } from "@/components/auto-refresh";
import { formatDateTime } from "@/lib/format";
import {
  reviewOkAction,
  rejectAction,
  assignHostAction,
  updateVisitDepartmentAction,
} from "../actions";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-1">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}

export default async function ReviewPage() {
  await requireRole([ROLES.SECURITY, ROLES.ADMIN]);

  const [visits, hosts, departments] = await Promise.all([
    prisma.visit.findMany({
      where: { status: VISIT_STATUS.PENDING_REVIEW },
      orderBy: { createdAt: "asc" },
      include: { visitor: true, host: true, department: true },
    }),
    prisma.user.findMany({
      where: { role: ROLES.HOST },
      include: { department: true },
      orderBy: { name: "asc" },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <AutoRefresh seconds={10} />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Review Tamu</h1>
        <p className="text-sm text-slate-500">
          Cocokkan data & foto dengan identitas asli tamu. Koreksi host &
          department bila perlu, lalu setujui atau tolak.
        </p>
      </div>

      {visits.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500 shadow-sm">
          Tidak ada tamu yang menunggu review.
        </p>
      ) : (
        <div className="space-y-4">
          {visits.map((v) => {
            const isLoading = v.visitType === VISIT_TYPE.LOADING;
            return (
              <div
                key={v.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-slate-900 px-2 text-sm font-bold text-white">
                    {v.queueNo ?? "-"}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    {v.visitor.fullName}
                  </h2>
                  <TypeBadge type={v.visitType} loadingType={v.loadingType} />
                  <span className="text-xs text-slate-400">
                    {formatDateTime(v.createdAt)}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {/* Foto untuk pencocokan */}
                  {!isLoading && (
                    <div className="flex gap-3">
                      <figure className="text-center">
                        {v.visitor.idPhoto ? (
                          <PhotoZoom
                            src={v.visitor.idPhoto}
                            alt="Foto identitas"
                            className="h-40 w-40 rounded-lg border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
                            Tidak ada foto identitas
                          </div>
                        )}
                        <figcaption className="mt-1 text-xs text-slate-400">
                          Foto Identitas
                        </figcaption>
                      </figure>
                      {v.visitor.selfiePhoto && (
                        <figure className="text-center">
                          <PhotoZoom
                            src={v.visitor.selfiePhoto}
                            alt="Swafoto"
                            className="h-40 w-40 rounded-lg border border-slate-200 object-cover"
                          />
                          <figcaption className="mt-1 text-xs text-slate-400">
                            Swafoto
                          </figcaption>
                        </figure>
                      )}
                    </div>
                  )}

                  {/* Data submit tamu */}
                  <dl className="space-y-0.5 text-sm">
                    {v.visitor.company && (
                      <Row label="Perusahaan" value={v.visitor.company} />
                    )}
                    {v.visitor.jabatan && (
                      <Row label="Jabatan" value={v.visitor.jabatan} />
                    )}
                    {v.visitor.phone && (
                      <Row label="No. HP" value={v.visitor.phone} />
                    )}
                    {v.visitor.email && (
                      <Row label="Email" value={v.visitor.email} />
                    )}
                    <Row
                      label="Identitas"
                      value={`${ID_TYPE_LABEL[v.visitor.idType ?? ""] ?? v.visitor.idType ?? "-"} · ${v.visitor.idNumber ?? "-"}`}
                    />
                    {isLoading ? (
                      <>
                        {v.loadingType && (
                          <Row
                            label="Aktivitas"
                            value={LOADING_TYPE_LABEL[v.loadingType] ?? v.loadingType}
                          />
                        )}
                        {v.vehiclePlate && (
                          <Row label="No. Polisi" value={v.vehiclePlate} />
                        )}
                        {v.docNumber && (
                          <Row label="Dokumen" value={v.docNumber} />
                        )}
                      </>
                    ) : (
                      <>
                        <Row label="Keperluan" value={v.purpose} />
                        {v.detailPurpose && (
                          <Row label="Detail" value={v.detailPurpose} />
                        )}
                        <Row
                          label="Kendaraan"
                          value={
                            VEHICLE_TYPE_LABEL[v.vehicleType ?? ""] ??
                            v.vehicleType ??
                            "-"
                          }
                        />
                        {v.vehiclePlate && (
                          <Row label="No. Polisi" value={v.vehiclePlate} />
                        )}
                        <Row label="PIC (input tamu)" value={v.hostName ?? "-"} />
                      </>
                    )}
                  </dl>
                </div>

                {/* Koreksi host & department (umum) */}
                {!isLoading && (
                  <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
                    <form
                      action={assignHostAction}
                      className="flex items-end gap-2"
                    >
                      <input type="hidden" name="visitId" value={v.id} />
                      <div className="flex-1">
                        <label className="text-xs font-medium text-slate-600">
                          Host (database karyawan)
                        </label>
                        <select
                          name="hostId"
                          defaultValue={v.hostId ?? ""}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-slate-500"
                        >
                          <option value="">— Belum ditautkan —</option>
                          {hosts.map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name}
                              {h.nik ? ` · ${h.nik}` : ""}
                              {h.department ? ` (${h.department.name})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <ConfirmSubmit
                        message="Simpan koreksi host?"
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Simpan
                      </ConfirmSubmit>
                    </form>

                    <form
                      action={updateVisitDepartmentAction}
                      className="flex items-end gap-2"
                    >
                      <input type="hidden" name="visitId" value={v.id} />
                      <div className="flex-1">
                        <label className="text-xs font-medium text-slate-600">
                          Department
                        </label>
                        <select
                          name="departmentId"
                          defaultValue={v.departmentId ?? ""}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-slate-500"
                        >
                          <option value="">— Tidak ada —</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <ConfirmSubmit
                        message="Simpan koreksi department?"
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Simpan
                      </ConfirmSubmit>
                    </form>
                  </div>
                )}

                {/* Keputusan review */}
                <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <form action={rejectAction}>
                    <input type="hidden" name="visitId" value={v.id} />
                    <ConfirmSubmit
                      message="Tolak kunjungan ini?"
                      className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Tolak
                    </ConfirmSubmit>
                  </form>
                  <form action={reviewOkAction}>
                    <input type="hidden" name="visitId" value={v.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Review OK →
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
