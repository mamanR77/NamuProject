"use client";

import { useActionState } from "react";
import { registerLoadingAction, type LoadingState } from "./actions";
import { LOADING_TYPE } from "@/lib/constants";
import type { Dict } from "@/lib/i18n";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-sm text-rose-600">{msg}</p>;
}

export function LoadingForm({ t }: { t: Dict["loading"] }) {
  const [state, formAction, pending] = useActionState<LoadingState, FormData>(
    registerLoadingAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </div>
      )}

      {/* Pilih aktivitas */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          {t.activity} <span className="text-rose-500">*</span>
        </label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="loadingType"
              value={LOADING_TYPE.LOADING}
              className="peer sr-only"
            />
            <div className="rounded-xl border border-slate-300 bg-white p-3 text-center text-sm font-semibold text-slate-700 transition peer-checked:border-sky-500 peer-checked:bg-sky-50 peer-checked:text-sky-700">
              📤 {t.loading}
              <div className="text-xs font-normal text-slate-400">
                {t.loadingSub}
              </div>
            </div>
          </label>
          <label className="cursor-pointer">
            <input
              type="radio"
              name="loadingType"
              value={LOADING_TYPE.UNLOADING}
              className="peer sr-only"
            />
            <div className="rounded-xl border border-slate-300 bg-white p-3 text-center text-sm font-semibold text-slate-700 transition peer-checked:border-sky-500 peer-checked:bg-sky-50 peer-checked:text-sky-700">
              📥 {t.unloading}
              <div className="text-xs font-normal text-slate-400">
                {t.unloadingSub}
              </div>
            </div>
          </label>
        </div>
        <FieldError msg={state.fieldErrors?.loadingType} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          {t.driverName} <span className="text-rose-500">*</span>
        </label>
        <input
          name="fullName"
          className={inputClass}
          placeholder={t.driverPlaceholder}
        />
        <FieldError msg={state.fieldErrors?.fullName} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          {t.transporter} <span className="text-rose-500">*</span>
        </label>
        <input
          name="company"
          className={inputClass}
          placeholder={t.transporterPlaceholder}
        />
        <FieldError msg={state.fieldErrors?.company} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          {t.phone} <span className="text-rose-500">*</span>
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
          {t.plate} <span className="text-rose-500">*</span>
        </label>
        <input
          name="vehiclePlate"
          className={`${inputClass} uppercase`}
          placeholder="B 1234 XYZ"
        />
        <FieldError msg={state.fieldErrors?.vehiclePlate} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">{t.doc}</label>
        <input name="docNumber" className={inputClass} placeholder={t.optional} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-sky-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-60"
      >
        {pending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
