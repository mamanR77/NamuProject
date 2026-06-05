"use client";

import { useEffect, useRef, useState } from "react";
import { assignHostAction } from "../actions";
import { ConfirmSubmit } from "@/components/confirm-submit";

export type Emp = {
  id: string;
  name: string;
  nik: string;
  department: string;
};

/// Satu kolom pencarian karyawan (database Karyawan) untuk mencocokkan host.
/// Bisa diketik (filter Nama/NIK/Department) atau di-scroll, lalu Simpan.
export function HostPicker({
  visitId,
  employees,
  current,
}: {
  visitId: string;
  employees: Emp[];
  current: Emp | null;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Emp | null>(current);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = (
    q
      ? employees.filter((e) =>
          `${e.name} ${e.nik} ${e.department}`.toLowerCase().includes(q)
        )
      : employees
  ).slice(0, 50);

  return (
    <form action={assignHostAction} className="space-y-2">
      <input type="hidden" name="visitId" value={visitId} />
      <input type="hidden" name="hostId" value={selected?.id ?? ""} />

      <label className="text-xs font-medium text-slate-600">
        Cocokkan karyawan (Nama / NIK / Department)
      </label>

      <div ref={ref} className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Ketik nama atau NIK untuk mencari…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />

        {open && (
          <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-sm text-slate-400">
                Tidak ada karyawan cocok.
              </p>
            ) : (
              filtered.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    setSelected(e);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full flex-col items-start gap-0.5 border-b border-slate-50 px-3 py-2 text-left hover:bg-slate-50"
                >
                  <span className="text-sm font-medium text-slate-900">
                    {e.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    NIK {e.nik || "-"} · {e.department || "-"}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Terpilih */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm">
          {selected ? (
            <span className="rounded-lg bg-emerald-50 px-3 py-1 font-medium text-emerald-700 ring-1 ring-emerald-200">
              ✔ {selected.name} · NIK {selected.nik || "-"} ·{" "}
              {selected.department || "-"}
            </span>
          ) : (
            <span className="text-slate-400">Belum ada karyawan terpilih</span>
          )}
        </div>
        <ConfirmSubmit
          message="Tautkan karyawan ini sebagai host kunjungan?"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Simpan
        </ConfirmSubmit>
      </div>
    </form>
  );
}
