import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME, APP_DESC } from "@/lib/constants";

// Catatan: sengaja TIDAK memakai next/font/google agar tidak bergantung pada
// koneksi internet saat build/runtime (Namu berjalan di intranet). Pakai font system.

export const metadata: Metadata = {
  title: `${APP_NAME} — Visitor Management System`,
  description: APP_DESC,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
