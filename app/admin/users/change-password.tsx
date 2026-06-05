"use client";

import { useActionState, useState } from "react";
import { changePasswordAction, type PasswordState } from "../actions";

export function ChangePassword({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<PasswordState, FormData>(
    changePasswordAction,
    {}
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
      >
        Ganti Password
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-1.5">
      <input type="hidden" name="userId" value={userId} />
      <input
        name="password"
        type="password"
        placeholder="Password baru"
        className="w-36 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-slate-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "…" : "Simpan"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs text-slate-400 hover:text-slate-600"
      >
        Batal
      </button>
      {state.ok && <span className="text-xs font-semibold text-emerald-600">✔</span>}
      {state.error && (
        <span className="text-xs text-rose-600">{state.error}</span>
      )}
    </form>
  );
}
