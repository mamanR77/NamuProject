"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerVisitAction, type RegisterState } from "./actions";
import {
  VISIT_PURPOSES,
  PURPOSE_OTHERS,
  ID_TYPES,
  VEHICLE_TYPES,
  DRIVER_TYPES,
} from "@/lib/constants";
import { PhotoInput } from "@/components/photo-input";

export type DeptOption = { id: string; name: string };

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-sm text-rose-600">{msg}</p>;
}

function Section({
  no,
  title,
  children,
}: {
  no: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
          {no}
        </span>
        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

const req = <span className="text-rose-500">*</span>;

export function RegisterForm({ departments }: { departments: DeptOption[] }) {
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(
    registerVisitAction,
    {}
  );
  const [purpose, setPurpose] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [driver, setDriver] = useState("");
  const fe = state.fieldErrors ?? {};
  const hasVehicle = vehicle === "CAR" || vehicle === "MOTORCYCLE";

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </div>
      )}

      {/* Section 1 — Informasi Kunjungan */}
      <Section no={1} title="Informasi Kunjungan">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Tujuan Kedatangan {req}
          </label>
          <select
            name="purposeCategory"
            className={inputClass}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          >
            <option value="" disabled>
              — Pilih tujuan kedatangan —
            </option>
            {VISIT_PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {purpose === PURPOSE_OTHERS && (
            <input
              name="purposeOther"
              className={`${inputClass} mt-2`}
              placeholder="Tuliskan tujuan kedatangan Anda"
            />
          )}
          <Err msg={fe.purpose} />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Detail Keperluan
          </label>
          <textarea
            name="detailPurpose"
            rows={2}
            className={inputClass}
            placeholder="Jelaskan keperluan kunjungan (opsional)"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Host / PIC yang Dikunjungi {req}
          </label>
          <input
            name="hostName"
            className={inputClass}
            placeholder="Nama karyawan yang dituju"
          />
          <Err msg={fe.hostName} />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Department {req}
          </label>
          <select name="departmentId" className={inputClass} defaultValue="">
            <option value="" disabled>
              — Pilih department —
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <Err msg={fe.departmentId} />
        </div>
      </Section>

      {/* Section 2 — Data Diri Tamu */}
      <Section no={2} title="Data Diri Tamu">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Nama Lengkap {req}
          </label>
          <input name="fullName" className={inputClass} placeholder="Nama Anda" />
          <Err msg={fe.fullName} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Nama Perusahaan / Instansi
          </label>
          <input name="company" className={inputClass} placeholder="Opsional" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Jabatan</label>
          <input name="jabatan" className={inputClass} placeholder="Opsional" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Nomor Handphone {req}
          </label>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            className={inputClass}
            placeholder="08xxxxxxxxxx"
          />
          <Err msg={fe.phone} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            name="email"
            type="email"
            className={inputClass}
            placeholder="Opsional"
          />
        </div>
      </Section>

      {/* Section 3 — Identitas Tamu */}
      <Section no={3} title="Identitas Tamu">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Jenis Identitas {req}
          </label>
          <select name="idType" className={inputClass} defaultValue="">
            <option value="" disabled>
              — Pilih jenis identitas —
            </option>
            {ID_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <Err msg={fe.idType} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Nomor Identitas {req}
          </label>
          <input
            name="idNumber"
            className={inputClass}
            placeholder="Nomor pada identitas"
          />
          <Err msg={fe.idNumber} />
        </div>
        <PhotoInput
          name="idPhoto"
          label="Foto Identitas"
          required
          capture="environment"
          error={fe.idPhoto}
        />
        <PhotoInput
          name="selfiePhoto"
          label="Foto Diri / Swafoto (Selfie)"
          capture="user"
        />
      </Section>

      {/* Section 4 — Data Kendaraan */}
      <Section no={4} title="Data Kendaraan">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Jenis Kendaraan {req}
          </label>
          <select
            name="vehicleType"
            className={inputClass}
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
          >
            <option value="" disabled>
              — Pilih jenis kendaraan —
            </option>
            {VEHICLE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <Err msg={fe.vehicleType} />
        </div>

        {hasVehicle && (
          <>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Nomor Polisi {req}
              </label>
              <input
                name="vehiclePlate"
                className={`${inputClass} uppercase`}
                placeholder="B 1234 XYZ"
              />
              <Err msg={fe.vehiclePlate} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Brand / Type Kendaraan
              </label>
              <input
                name="vehicleBrand"
                className={inputClass}
                placeholder="mis. Toyota Avanza"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Pengemudi {req}
              </label>
              <select
                name="driverType"
                className={inputClass}
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
              >
                <option value="" disabled>
                  — Pilih —
                </option>
                {DRIVER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <Err msg={fe.driverType} />
            </div>
            {driver === "DRIVER" && (
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nama Supir {req}
                </label>
                <input
                  name="driverName"
                  className={inputClass}
                  placeholder="Nama supir"
                />
                <Err msg={fe.driverName} />
              </div>
            )}
          </>
        )}
      </Section>

      {/* Section 5 — Safety & Compliance */}
      <Section no={5} title="Safety & Compliance">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="safetyAgreed"
            value="1"
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300"
          />
          <span className="text-sm text-slate-600">
            Saya berkomitmen untuk menaati seluruh aturan yang berlaku di PT Glico
            Manufacturing Indonesia, dan telah membaca{" "}
            <Link
              href="/aturan"
              target="_blank"
              className="font-medium text-rose-600 underline"
            >
              Aturan & Tata Tertib
            </Link>
            .
          </span>
        </label>
        <Err msg={fe.safetyAgreed} />
      </Section>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-rose-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-60"
      >
        {pending ? "Mengirim..." : "Daftar Kunjungan"}
      </button>
    </form>
  );
}
