"use client";

import { useActionState, useRef, useEffect } from "react";
import { importEmployeesAction, type ImportState } from "./actions";

export function ImportForm() {
  const [state, formAction, pending] = useActionState<ImportState, FormData>(
    importEmployeesAction,
    {}
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Unggah file <b>.xlsx</b> dengan kolom:{" "}
        <span className="rounded bg-slate-100 px-1 font-mono text-xs">NIK</span>{" "}
        <span className="rounded bg-slate-100 px-1 font-mono text-xs">Nama</span>{" "}
        <span className="rounded bg-slate-100 px-1 font-mono text-xs">
          Department
        </span>{" "}
        <span className="rounded bg-slate-100 px-1 font-mono text-xs">
          Jabatan
        </span>{" "}
        <span className="rounded bg-slate-100 px-1 font-mono text-xs">
          Entitas
        </span>
        . Baris dengan NIK yang sama akan diperbarui.
      </p>

      {state.error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </div>
      )}
      {state.ok && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200">
          Import selesai — {state.created} baru, {state.updated} diperbarui,{" "}
          {state.skipped} dilewati.
          {state.errors && state.errors.length > 0 && (
            <ul className="mt-1 list-disc pl-5 text-xs text-rose-600">
              {state.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <form ref={ref} action={formAction} className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          name="file"
          accept=".xlsx,.xls"
          required
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? "Mengimpor…" : "Import Excel"}
        </button>
      </form>
    </div>
  );
}
