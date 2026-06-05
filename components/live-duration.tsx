"use client";

import { useEffect, useState } from "react";

function fmt(ms: number, withSeconds: boolean): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}j`);
  parts.push(`${m}m`);
  if (withSeconds) parts.push(`${s}d`);
  return parts.join(" ");
}

/// Menampilkan durasi kunjungan. Jika belum check-out (end kosong), durasi
/// berjalan dan diperbarui tiap detik.
export function LiveDuration({
  start,
  end,
}: {
  start: string;
  end?: string | null;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (end) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [end]);

  const startMs = new Date(start).getTime();
  const endMs = end ? new Date(end).getTime() : now;
  const ms = endMs - startMs;

  if (end) {
    return <span className="font-medium text-slate-900">{fmt(ms, false)}</span>;
  }
  return (
    <span className="font-semibold text-emerald-600">
      {fmt(ms, true)} <span className="text-xs font-normal">(berjalan)</span>
    </span>
  );
}
