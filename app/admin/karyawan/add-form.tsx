"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addEmployeeAction, type EmpFormState } from "./actions";
import { ENTITAS } from "@/lib/constants";

export type DeptOption = { id: string; name: string };

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100";

export function AddEmployeeButton({ departments }: { departments: DeptOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<EmpFormState, FormData>(
    addEmployeeAction,
    {}
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      setOpen(false);
    }
  }, [state.ok]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
      >
        + Tambah Karyawan
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Tambah Karyawan
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form ref={ref} action={formAction} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">NIK</label>
                <input name="nik" inputMode="numeric" className={inputClass} />
                {state.fieldErrors?.nik && (
                  <p className="mt-1 text-xs text-rose-600">
                    {state.fieldErrors.nik}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Nama</label>
                <input name="name" className={inputClass} />
                {state.fieldErrors?.name && (
                  <p className="mt-1 text-xs text-rose-600">
                    {state.fieldErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Jabatan
                </label>
                <input name="jabatan" className={inputClass} placeholder="Opsional" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Department
                </label>
                <select name="departmentId" className={inputClass} defaultValue="">
                  <option value="">— Pilih department —</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Entitas
                </label>
                <select name="entitas" className={inputClass} defaultValue="">
                  <option value="">— Pilih entitas —</option>
                  {ENTITAS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {pending ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
