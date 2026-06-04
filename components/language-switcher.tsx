"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LOCALES,
  LOCALE_LABEL,
  LOCALE_FLAG,
  LOCALE_COOKIE,
  type Locale,
} from "@/lib/i18n";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function choose(l: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <span>{LOCALE_FLAG[current]}</span>
        <span>{LOCALE_LABEL[current]}</span>
        <span className="text-slate-400">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => choose(l)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                l === current ? "font-semibold text-slate-900" : "text-slate-600"
              }`}
            >
              <span>{LOCALE_FLAG[l]}</span>
              <span>{LOCALE_LABEL[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
