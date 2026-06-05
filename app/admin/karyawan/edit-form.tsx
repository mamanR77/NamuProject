"use client";

import { useActionState, useEffect, useState } from "react";
import { updateEmployeeAction, type EmpFormState } from "./actions";
import { ENTITAS } from "@/lib/constants";
import type { DeptOption } from "./add-form";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100";

export type EmployeeData = {
  id: string;
  nik: string;
  name: string;
  jabatan: string;
  departmentId: string;
  entitas: string;
};

export function EditEmployeeButton({
  employee,
  departments,
}: {
  employee: EmployeeData;
  departments: DeptOption[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<EmpFormState, FormData>(
    updateEmployeeAction,
    {}
  );

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state.ok]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
      >
        Edit
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 text-left shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Edit Karyawan</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form action={formAction} className="space-y-3">
              <input type="hidden" name="userId" value={employee.id} />
              <div>
                <label className="text-sm font-medium text-slate-700">NIK</label>
                <input
                  name="nik"
                  inputMode="numeric"
                  defaultValue={employee.nik}
                  className={inputClass}
                />
                {state.fieldErrors?.nik && (
                  <p className="mt-1 text-xs text-rose-600">
                    {state.fieldErrors.nik}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Nama</label>
                <input
                  name="name"
                  defaultValue={employee.name}
                  className={inputClass}
                />
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
                <input
                  name="jabatan"
                  defaultValue={employee.jabatan}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Department
                </label>
                <select
                  name="departmentId"
                  defaultValue={employee.departmentId}
                  className={inputClass}
                >
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
                <select
                  name="entitas"
                  defaultValue={employee.entitas}
                  className={inputClass}
                >
                  <option value="">— Pilih entitas —</option>
                  {ENTITAS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              {state.error && (
                <p className="text-xs text-rose-600">{state.error}</p>
              )}

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
                  onClick={(e) => {
                    if (!window.confirm("Simpan perubahan data karyawan ini?"))
                      e.preventDefault();
                  }}
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
