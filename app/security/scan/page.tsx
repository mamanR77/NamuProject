import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { Scanner } from "./scanner";

export const dynamic = "force-dynamic";

export default async function ScanPage() {
  await requireRole([ROLES.SECURITY, ROLES.ADMIN]);

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Link href="/security" className="text-sm text-slate-500 hover:underline">
        ← Antrian
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Scan QR Tamu</h1>
        <p className="text-sm text-slate-500">
          Arahkan kamera ke QR di HP tamu untuk membuka kunjungannya.
        </p>
      </div>
      <Scanner />
    </div>
  );
}
