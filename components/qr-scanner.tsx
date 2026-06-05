"use client";

import jsQR from "jsqr";
import { useCallback, useEffect, useRef, useState } from "react";

type CamStatus = "starting" | "active" | "error";

/// Pemindai QR berbasis webcam + jsQR (jalan di semua browser/laptop, tanpa
/// bergantung pada BarcodeDetector). Memanggil onToken saat QR terbaca atau
/// saat input manual dikirim. `paused` menghentikan pemicu sementara.
export function QrScanner({
  onToken,
  paused = false,
}: {
  onToken: (raw: string) => void;
  paused?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [manual, setManual] = useState("");
  const [status, setStatus] = useState<CamStatus>("starting");
  const [errMsg, setErrMsg] = useState<string>("");

  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const last = useRef<{ val: string; t: number }>({ val: "", t: 0 });

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setStatus("starting");
    setErrMsg("");
    stop();
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setErrMsg("Browser tidak mendukung akses kamera (getUserMedia).");
      return;
    }
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const ctx = canvasRef.current.getContext("2d", {
      willReadFrequently: true,
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play().catch(() => {});
      setStatus("active");

      const tick = () => {
        const video = videoRef.current;
        if (
          video &&
          ctx &&
          canvasRef.current &&
          !pausedRef.current &&
          video.readyState >= video.HAVE_ENOUGH_DATA
        ) {
          const w = video.videoWidth;
          const h = video.videoHeight;
          if (w && h) {
            canvasRef.current.width = w;
            canvasRef.current.height = h;
            ctx.drawImage(video, 0, 0, w, h);
            const img = ctx.getImageData(0, 0, w, h);
            const code = jsQR(img.data, img.width, img.height, {
              inversionAttempts: "dontInvert",
            });
            if (code && code.data) {
              const now = Date.now();
              if (code.data !== last.current.val || now - last.current.t > 2500) {
                last.current = { val: code.data, t: now };
                onTokenRef.current(code.data);
              }
            }
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      setStatus("error");
      const name = e instanceof DOMException ? e.name : "";
      const map: Record<string, string> = {
        NotAllowedError:
          "Akses kamera ditolak. Klik ikon kamera di address bar lalu izinkan, atau cek Pengaturan Windows › Privasi › Kamera.",
        NotFoundError: "Kamera tidak ditemukan pada perangkat ini.",
        NotReadableError:
          "Kamera sedang dipakai aplikasi lain (mis. Zoom/Teams). Tutup aplikasi itu lalu coba lagi.",
        SecurityError:
          "Akses kamera diblokir. Pastikan dibuka via https atau localhost.",
      };
      setErrMsg(map[name] ?? `Tidak bisa mengakses kamera. (${name || "error"})`);
    }
  }, [stop]);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="aspect-square w-full object-cover"
        />
        {status !== "active" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/80 p-4 text-center text-sm text-white">
            {status === "starting" && <span>Memulai kamera…</span>}
            {status === "error" && (
              <>
                <span className="text-amber-300">{errMsg}</span>
                <button
                  type="button"
                  onClick={() => start()}
                  className="mt-1 rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                >
                  Mulai / Ulangi Kamera
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {status === "active" && (
        <p className="text-center text-xs text-slate-400">
          Arahkan barcode/QR ke kamera.
        </p>
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
