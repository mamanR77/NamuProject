"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { VISIT_STATUS, VISIT_TYPE } from "@/lib/constants";

export type LookupResult = {
  ok: boolean;
  token?: string;
  visitorName?: string;
  hostName?: string;
  error?: string;
};

function parseToken(raw: string): string {
  const v = raw.trim();
  const m = v.match(/\/visit\/([^/?#]+)/);
  return m ? m[1] : v;
}

/// Penerima tamu memindai barcode tamu — ambil info kunjungan untuk konfirmasi.
export async function lookupVisitAction(raw: string): Promise<LookupResult> {
  const token = parseToken(raw);
  if (!token) return { ok: false, error: "Barcode kosong." };

  const visit = await prisma.visit.findUnique({
    where: { qrToken: token },
    include: { visitor: true, host: true },
  });
  if (!visit) return { ok: false, error: "Barcode tidak dikenali." };
  if (visit.visitType === VISIT_TYPE.LOADING)
    return { ok: false, error: "Loading/Unloading tidak memerlukan konfirmasi ini." };
  if (visit.status !== VISIT_STATUS.CHECKED_IN)
    return {
      ok: false,
      error: "Kunjungan belum berstatus 'di dalam' atau sudah selesai.",
    };
  if (visit.signedAt)
    return { ok: false, error: "Kunjungan ini sudah dikonfirmasi selesai." };

  return {
    ok: true,
    token,
    visitorName: visit.visitor.fullName,
    hostName: visit.host?.name ?? "-",
  };
}

export type CompletionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

/// Submit konfirmasi selesai: validasi NIK terhadap karyawan yang dituju.
export async function submitCompletionAction(
  token: string,
  name: string,
  nik: string,
  signatureData: string
): Promise<CompletionState> {
  const fieldErrors: Record<string, string> = {};
  if (!name.trim()) fieldErrors.name = "Nama wajib diisi";
  if (!nik.trim()) fieldErrors.nik = "NIK wajib diisi";
  if (!signatureData.startsWith("data:image/png") || signatureData.length < 1000)
    fieldErrors.signature = "Tanda tangan masih kosong";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const visit = await prisma.visit.findUnique({
    where: { qrToken: token },
    include: { host: true },
  });
  if (!visit) return { error: "Kunjungan tidak ditemukan." };
  if (visit.status !== VISIT_STATUS.CHECKED_IN)
    return { error: "Kunjungan tidak dalam status yang bisa dikonfirmasi." };
  if (visit.signedAt) return { ok: true };

  // Validasi NIK (primary key). Jika Security sudah menautkan host, cocokkan ke
  // NIK host tsb; jika belum, cocokkan ke karyawan mana pun yang terdaftar.
  const enteredNik = nik.trim();
  if (visit.host?.nik) {
    if (visit.host.nik !== enteredNik)
      return {
        fieldErrors: { nik: "NIK tidak cocok dengan karyawan yang dituju." },
      };
  } else {
    const emp = await prisma.user.findUnique({ where: { nik: enteredNik } });
    if (!emp)
      return { fieldErrors: { nik: "NIK tidak terdaftar di database karyawan." } };
  }

  await prisma.visit.update({
    where: { id: visit.id },
    data: {
      signedAt: new Date(),
      signedName: name.trim(),
      signedNik: nik.trim(),
      signatureData,
    },
  });

  revalidatePath(`/visit/${token}`);
  revalidatePath("/security");
  return { ok: true };
}
