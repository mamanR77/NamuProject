"use client";

import { useEffect } from "react";

const KEY = "namu_last_visit";

/// Menyimpan token kunjungan aktif di perangkat tamu agar bisa kembali ke
/// halaman barcode dari beranda. Dihapus saat kunjungan selesai/terminal.
export function RememberVisit({
  token,
  remember,
}: {
  token: string;
  remember: boolean;
}) {
  useEffect(() => {
    try {
      if (remember) {
        localStorage.setItem(KEY, token);
      } else if (localStorage.getItem(KEY) === token) {
        localStorage.removeItem(KEY);
      }
    } catch {
      /* localStorage tidak tersedia — abaikan */
    }
  }, [token, remember]);

  return null;
}
