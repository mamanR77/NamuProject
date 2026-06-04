"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitSignatureAction } from "./actions";
import type { Dict } from "@/lib/i18n";

export function SignaturePad({
  token,
  t,
}: {
  token: string;
  t: Dict["visit"]["sign"];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [name, setName] = useState("");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Siapkan ukuran canvas sesuai lebar kontainer (tajam di layar HD).
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

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  const drawing = useRef(false);

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    drawing.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvasRef.current!.setPointerCapture(e.pointerId);
  }
  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasDrawn) setHasDrawn(true);
  }
  function onUp() {
    drawing.current = false;
  }

  function clear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setError(null);
  }

  function save() {
    setError(null);
    if (!name.trim()) {
      setError(t.nameErr);
      return;
    }
    if (!hasDrawn) {
      setError(t.emptyErr);
      return;
    }
    const data = canvasRef.current!.toDataURL("image/png");
    startTransition(async () => {
      const res = await submitSignatureAction(token, data, name.trim());
      if (res.ok) router.refresh();
      else if (res.error === "name") setError(t.nameErr);
      else setError(t.emptyErr);
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-slate-700">
          {t.nameLabel}
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.namePlaceholder}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        className="h-40 w-full touch-none rounded-lg border-2 border-dashed border-slate-300 bg-slate-50"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={clear}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          {t.clear}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? t.saving : t.save}
        </button>
      </div>
    </div>
  );
}
