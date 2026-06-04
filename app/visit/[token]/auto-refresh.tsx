"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/// Memuat ulang data halaman secara berkala (untuk status PENDING),
/// agar tamu otomatis melihat perubahan saat host menyetujui.
export function AutoRefresh({ seconds = 5 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
