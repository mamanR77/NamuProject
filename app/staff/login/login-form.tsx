"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
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
        <label className="text-sm font-medium text-slate-700">Email</label>
        <input
          name="email"
          type="email"
          autoComplete="username"
          className={inputClass}
          placeholder="admin@glico.local"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Password</label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          className={inputClass}
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
