"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUserAction, type UserFormState } from "../actions";
import { ROLES } from "@/lib/constants";

export type DeptOption = { id: string; name: string };

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100";

const ROLE_OPTIONS = [
  { value: ROLES.SECURITY, label: "Security / Resepsionis" },
  { value: ROLES.ADMIN, label: "Super Admin" },
];

export function CreateUserForm({ departments }: { departments: DeptOption[] }) {
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(
    createUserAction,
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
          Pengguna berhasil ditambahkan.
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-slate-700">Nama</label>
        <input name="name" className={inputClass} placeholder="Nama lengkap" />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Username</label>
        <input
          name="username"
          type="text"
          autoCapitalize="none"
          spellCheck={false}
          className={inputClass}
          placeholder="mis. budi.santoso"
        />
        {state.fieldErrors?.username && (
          <p className="mt-1 text-xs text-rose-600">
            {state.fieldErrors.username}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Password</label>
        <input
          name="password"
          type="password"
          className={inputClass}
          placeholder="Minimal 6 karakter"
        />
        {state.fieldErrors?.password && (
          <p className="mt-1 text-xs text-rose-600">
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Role</label>
        <select name="role" className={inputClass} defaultValue={ROLES.SECURITY}>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.role && (
          <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.role}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Departemen <span className="text-slate-400">(opsional)</span>
        </label>
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
        {pending ? "Menyimpan..." : "Tambah Pengguna"}
      </button>
    </form>
  );
}
