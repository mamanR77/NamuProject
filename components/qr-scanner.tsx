"use client";

import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";

/// Pemindai QR berbasis webcam + jsQR (jalan di semua browser/laptop, tanpa
/// bergantung pada BarcodeDetector). Memanggil onToken saat QR terbaca atau
/// saat input manual dikirim. `paused` menghentikan pemicu sementara (mis. saat
/// hasil sedang diproses) agar tidak terbaca berulang.
export function QrScanner({
  onToken,
  paused = false,
}: {
  onToken: (raw: string) => void;
  paused?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manual, setManual] = useState("");
  const [camError, setCamError] = useState<string | null>(null);

  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const last = useRef<{ val: string; t: number }>({ val: "", t: 0 });

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const tick = () => {
          if (stopped) return;
          const video = videoRef.current;
          if (
            video &&
            ctx &&
            !pausedRef.current &&
            video.readyState >= video.HAVE_ENOUGH_DATA
          ) {
            const w = video.videoWidth;
            const h = video.videoHeight;
            if (w && h) {
              canvas.width = w;
              canvas.height = h;
              ctx.drawImage(video, 0, 0, w, h);
              const img = ctx.getImageData(0, 0, w, h);
              const code = jsQR(img.data, img.width, img.height, {
                inversionAttempts: "dontInvert",
              });
              if (code && code.data) {
                const now = Date.now();
                if (
                  code.data !== last.current.val ||
                  now - last.current.t > 2500
                ) {
                  last.current = { val: code.data, t: now };
                  onTokenRef.current(code.data);
                }
              }
            }
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setCamError(
          "Tidak bisa mengakses kamera. Izinkan akses kamera di browser, atau gunakan input manual di bawah."
        );
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black">
        <video
          ref={videoRef}
          playsInline
          muted
          className="aspect-square w-full object-cover"
        />
      </div>

      {camError && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 ring-1 ring-amber-200">
          {camError}
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
            onKeyDown={(e) => e.key === "Enter" && onToken(manual)}
            placeholder="Tempel kode / link dari QR tamu"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="button"
            onClick={() => onToken(manual)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Proses
          </button>
        </div>
      </div>
    </div>
  );
}
