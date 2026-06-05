"use client";

import { useRef, useState } from "react";

async function compress(file: File, maxDim = 1000, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

/// Input foto: ambil dari kamera / unggah file → kompres → simpan base64 di
/// hidden input (name) agar ikut terkirim form. Menampilkan preview.
export function PhotoInput({
  name,
  label,
  required = false,
  capture,
  error,
}: {
  name: string;
  label: string;
  required?: boolean;
  capture?: "user" | "environment";
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      setValue(await compress(file));
    } catch {
      /* abaikan */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <input type="hidden" name={name} value={value} readOnly />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={capture}
        onChange={onPick}
        className="hidden"
      />

      <div className="mt-1 flex items-center gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-300 bg-slate-50">
          {value ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl text-slate-300">📷</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {busy ? "Memproses…" : value ? "Ganti Foto" : "Ambil / Upload Foto"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => setValue("")}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Hapus
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
