"use client";

import type { ReactNode } from "react";

/// Tombol submit yang meminta konfirmasi (dialog) sebelum form dikirim.
/// Dipakai untuk aksi edit/hapus agar tidak terpicu tak sengaja.
export function ConfirmSubmit({
  message,
  className,
  children,
  disabled,
}: {
  message: string;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
