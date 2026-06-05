"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "namu_last_visit";

/// Tombol kembali ke halaman barcode kunjungan terakhir (jika ada di perangkat ini).
export function ResumeVisit({ label }: { label: string }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      setToken(localStorage.getItem(KEY));
    } catch {
      /* abaikan */
    }
  }, []);

  if (!token) return null;

  return (
    <Link
      href={`/visit/${token}`}
      className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
    >
      🎫 {label} →
    </Link>
  );
}
