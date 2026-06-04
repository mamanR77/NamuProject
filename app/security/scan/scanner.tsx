"use client";

import { useEffect, useRef, useState } from "react";
import { gateScanAction, type GateResult } from "../actions";

// Ambil token dari hasil scan: dukung token mentah atau URL .../visit/<token>.
function parseToken(raw: string): string {
  const v = raw.trim();
  const m = v.match(/\/visit\/([^/?#]+)/);
  return m ? m[1] : v;
}

export function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [unsupported, setUnsupported] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<GateResult | null>(null);
  const cooldown = useRef(false);

  async function handleToken(raw: string) {
    const token = parseToken(raw);
    if (!token || cooldown.current || busy) return;
    cooldown.current = true;
    setBusy(true);
    try {
      const res = await gateScanAction(token);
      setResult(res);
    } finally {
      setBusy(false);
      // jeda agar barcode yang sama tidak terbaca berulang
      setTimeout(() => {
        cooldown.current = false;
      }, 2500);
    }
  }

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    const BD = (
      window as unknown as {
        BarcodeDetector?: new (o: object) => {
          detect: (s: CanvasImageSource) => Promise<{ rawValue: string }[]>;
        };
      }
    ).BarcodeDetector;
    if (!BD) {
      setUnsupported(true);
      return;
    }
    const detector = new BD({ formats: ["qr_code"] });

    const cleanup = () => {
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const tick = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes && codes.length > 0) {
              await handleToken(codes[0].rawValue);
            }
          } catch {
            // abaikan frame gagal
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setCamError(
          "Tidak bisa mengakses kamera. Izinkan kamera, atau gunakan input manual."
        );
      }
    })();

    return () => {
      stopped = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {/* Hasil scan */}
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

      {!unsupported && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            className="aspect-square w-full object-cover"
          />
        </div>
      )}

      {camError && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 ring-1 ring-amber-200">
          {camError}
        </div>
      )}
      {unsupported && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 ring-1 ring-amber-200">
          Browser ini tidak mendukung pemindaian kamera. Gunakan input manual di
          bawah.
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-slate-700">
          Input Manual (kode / link QR)
        </label>
        <div className="mt-1 flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleToken(manual)}
            placeholder="Tempel kode / link dari QR tamu"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="button"
            onClick={() => handleToken(manual)}
            disabled={busy}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Proses
          </button>
        </div>
      </div>
    </div>
  );
}
