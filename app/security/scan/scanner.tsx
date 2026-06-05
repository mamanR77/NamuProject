"use client";

import { useRef, useState } from "react";
import { QrScanner } from "@/components/qr-scanner";
import { gateScanAction, type GateResult } from "../actions";

function parseToken(raw: string): string {
  const v = raw.trim();
  const m = v.match(/\/visit\/([^/?#]+)/);
  return m ? m[1] : v;
}

export function Scanner() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<GateResult | null>(null);
  const lock = useRef(false);

  async function handleToken(raw: string) {
    const token = parseToken(raw);
    if (!token || lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      setResult(await gateScanAction(token));
    } finally {
      setBusy(false);
      // jeda agar barcode sama tidak diproses berulang
      setTimeout(() => {
        lock.current = false;
        setBusy(false);
      }, 2500);
    }
  }

  return (
    <div className="space-y-4">
      {result && (
        <div
          className={`rounded-2xl p-4 text-center ring-1 ${
            result.ok
              ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
              : "bg-rose-50 text-rose-700 ring-rose-200"
          }`}
        >
          <div className="text-3xl">{result.ok ? "✅" : "⚠️"}</div>
          <p className="mt-1 font-semibold">
            {result.ok
              ? result.action === "checkin"
                ? "Check-in berhasil"
                : "Check-out berhasil"
              : "Gagal"}
          </p>
          {result.name && <p className="text-sm">{result.name}</p>}
          {result.message && <p className="text-sm">{result.message}</p>}
        </div>
      )}

      <QrScanner onToken={handleToken} paused={busy} />
    </div>
  );
}
