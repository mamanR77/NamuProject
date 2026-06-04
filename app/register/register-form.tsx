"use client";

import { useActionState } from "react";
import { registerVisitAction, type RegisterState } from "./actions";

export type HostOption = {
  id: string;
  name: string;
  department: string | null;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-sm text-rose-600">{msg}</p>;
}

export function RegisterForm({ hosts }: { hosts: HostOption[] }) {
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(
    registerVisitAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-slate-700">
          Nama Lengkap <span className="text-rose-500">*</span>
        </label>
        <input name="fullName" className={inputClass} placeholder="Nama Anda" />
        <FieldError msg={state.fieldErrors?.fullName} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Asal Perusahaan / Instansi
        </label>
        <input name="company" className={inputClass} placeholder="Opsional" />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Nomor HP <span className="text-rose-500">*</span>
        </label>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          className={inputClass}
          placeholder="08xxxxxxxxxx"
        />
        <FieldError msg={state.fieldErrors?.phone} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Nomor Identitas (KTP/SIM)
        </label>
        <input name="idNumber" className={inputClass} placeholder="Opsional" />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Karyawan yang Dituju <span className="text-rose-500">*</span>
        </label>
        <select name="hostId" className={inputClass} defaultValue="">
          <option value="" disabled>
            — Pilih karyawan —
          </option>
          {hosts.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
              {h.department ? ` — ${h.department}` : ""}
            </option>
          ))}
        </select>
        <FieldError msg={state.fieldErrors?.hostId} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Tujuan Kunjungan <span className="text-rose-500">*</span>
        </label>
        <textarea
          name="purpose"
          rows={3}
          className={inputClass}
          placeholder="Mis. Meeting, pengiriman barang, wawancara..."
        />
        <FieldError msg={state.fieldErrors?.purpose} />
      </div>

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
