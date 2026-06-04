"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Ambil token dari hasil scan: dukung token mentah atau URL .../visit/<token>.
function parseToken(raw: string): string {
  const v = raw.trim();
  const m = v.match(/\/visit\/([^/?#]+)/);
  return m ? m[1] : v;
}

export function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const [manual, setManual] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    // BarcodeDetector belum ada di tipe DOM standar.
    const BD = (window as unknown as { BarcodeDetector?: new (o: object) => { detect: (s: CanvasImageSource) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
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
              const token = parseToken(codes[0].rawValue);
              if (token) {
                stopped = true;
                cleanup();
                router.push(`/security/visit/${token}`);
                return;
              }
            }
          } catch {
            // abaikan frame yang gagal didekode
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setError(
          "Tidak bisa mengakses kamera. Izinkan akses kamera, atau gunakan input manual di bawah."
        );
      }
    })();

    return () => {
      stopped = true;
      cleanup();
    };
  }, [router]);

  function go() {
    const token = parseToken(manual);
    if (token) router.push(`/security/visit/${token}`);
  }

  return (
    <div className="space-y-4">
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

      {error && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 ring-1 ring-amber-200">
          {error}
        </div>
      )}
      {unsupported && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 ring-1 ring-amber-200">
          Browser ini tidak mendukung pemindaian kamera. Gunakan input manual di
          bawah (ketik/tempel kode dari QR tamu).
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
            onKeyDown={(e) => e.key === "Enter" && go()}
            placeholder="Tempel kode / link dari QR tamu"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="button"
            onClick={go}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Buka
          </button>
        </div>
      </div>
    </div>
  );
}
