"use client";

import { useActionState, useEffect, useRef } from "react";
import { addEmployeeAction, type EmpFormState } from "./actions";

export type DeptOption = { id: string; name: string };

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100";

export function AddEmployeeForm({ departments }: { departments: DeptOption[] }) {
  const [state, formAction, pending] = useActionState<EmpFormState, FormData>(
    addEmployeeAction,
    {}
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={formAction} className="space-y-3">
      {state.ok && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200">
          Karyawan ditambahkan.
        </div>
      )}
      <div>
        <label className="text-sm font-medium text-slate-700">NIK</label>
        <input name="nik" inputMode="numeric" className={inputClass} />
        {state.fieldErrors?.nik && (
          <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.nik}</p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Nama</label>
        <input name="name" className={inputClass} />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.name}</p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Jabatan</label>
        <input name="jabatan" className={inputClass} placeholder="Opsional" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Department</label>
        <select name="departmentId" className={inputClass} defaultValue="">
          <option value="">— Tidak ada —</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Menyimpan…" : "Tambah Karyawan"}
      </button>
    </form>
  );
}
