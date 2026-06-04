"use client";

import { useActionState, useEffect, useRef } from "react";
import { createDepartmentAction, type DeptFormState } from "../actions";

export function CreateDeptForm() {
  const [state, formAction, pending] = useActionState<DeptFormState, FormData>(
    createDepartmentAction,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      {state.error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </div>
      )}
      {state.ok && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200">
          Departemen ditambahkan.
        </div>
      )}
      <div className="flex gap-2">
        <input
          name="name"
          placeholder="Nama departemen"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? "..." : "Tambah"}
        </button>
      </div>
    </form>
  );
}
