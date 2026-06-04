"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  lookupVisitAction,
  submitCompletionAction,
  type LookupResult,
} from "./actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100";

export function Completion() {
  const [phase, setPhase] = useState<"scan" | "form" | "done">("scan");
  const [visit, setVisit] = useState<LookupResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const cooldown = useRef(false);

  async function handleToken(raw: string) {
    if (cooldown.current || !raw.trim()) return;
    cooldown.current = true;
    const res = await lookupVisitAction(raw);
    if (res.ok) {
      setVisit(res);
      setPhase("form");
    } else {
      setScanError(res.error ?? "Gagal memindai.");
      setTimeout(() => (cooldown.current = false), 2000);
    }
  }

  if (phase === "form" && visit?.token) {
    return (
      <CompletionForm
        token={visit.token}
        visitorName={visit.visitorName ?? "-"}
        hostName={visit.hostName ?? "-"}
        onDone={() => setPhase("done")}
      />
    );
  }

  if (phase === "done") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="text-4xl">✅</div>
        <h2 className="mt-2 text-lg font-bold text-emerald-800">
          Konfirmasi Selesai Tersimpan
        </h2>
        <p className="mt-1 text-sm text-emerald-700">
          Terima kasih. Tamu sekarang dapat menuju pos keluar untuk check-out.
        </p>
      </div>
    );
  }

  return <ScanStep onToken={handleToken} error={scanError} manual={manual} setManual={setManual} />;
}

function ScanStep({
  onToken,
  error,
  manual,
  setManual,
}: {
  onToken: (raw: string) => void;
  error: string | null;
  manual: string;
  setManual: (v: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [unsupported, setUnsupported] = useState(false);

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
            if (codes && codes.length > 0) onToken(codes[0].rawValue);
          } catch {
            /* skip */
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setUnsupported(true);
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
      <p className="text-sm text-slate-600">
        Pindai barcode pada HP tamu untuk konfirmasi selesai berkunjung.
      </p>
      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
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
            Lanjut
          </button>
        </div>
      </div>
    </div>
  );
}

function CompletionForm({
  token,
  visitorName,
  hostName,
  onDone,
}: {
  token: string;
  visitorName: string;
  hostName: string;
  onDone: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [name, setName] = useState("");
  const [nik, setNik] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a";
    }
  }, []);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = point(e);
    drawing.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvasRef.current!.setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = point(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasDrawn) setHasDrawn(true);
  }
  function up() {
    drawing.current = false;
  }
  function clear() {
    const c = canvasRef.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setHasDrawn(false);
  }

  function submit() {
    setError(null);
    setFieldErr({});
    const fe: Record<string, string> = {};
    if (!name.trim()) fe.name = "Nama wajib diisi";
    if (!nik.trim()) fe.nik = "NIK wajib diisi";
    if (!hasDrawn) fe.signature = "Tanda tangan masih kosong";
    if (Object.keys(fe).length) {
      setFieldErr(fe);
      return;
    }
    const data = canvasRef.current!.toDataURL("image/png");
    startTransition(async () => {
      const res = await submitCompletionAction(token, name, nik, data);
      if (res.ok) onDone();
      else if (res.fieldErrors) setFieldErr(res.fieldErrors);
      else setError(res.error ?? "Gagal menyimpan.");
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-50 p-3 text-sm">
        <div className="text-slate-500">Tamu</div>
        <div className="font-semibold text-slate-900">{visitorName}</div>
        <div className="mt-1 text-slate-500">Menemui</div>
        <div className="font-medium text-slate-900">{hostName}</div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-slate-700">
          Nama Penerima Tamu
        </label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        {fieldErr.name && <p className="mt-1 text-xs text-rose-600">{fieldErr.name}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">NIK Karyawan</label>
        <input
          value={nik}
          onChange={(e) => setNik(e.target.value)}
          inputMode="numeric"
          className={inputClass}
          placeholder="Nomor Induk Karyawan"
        />
        {fieldErr.nik && <p className="mt-1 text-xs text-rose-600">{fieldErr.nik}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Tanda Tangan</label>
        <canvas
          ref={canvasRef}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          className="mt-1 h-40 w-full touch-none rounded-lg border-2 border-dashed border-slate-300 bg-slate-50"
        />
        {fieldErr.signature && (
          <p className="mt-1 text-xs text-rose-600">{fieldErr.signature}</p>
        )}
        <button
          type="button"
          onClick={clear}
          className="mt-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
        >
          Hapus
        </button>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Konfirmasi Selesai"}
      </button>
    </div>
  );
}
