"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { VISIT_STATUS } from "@/lib/constants";

export type SignState = { ok?: boolean; error?: string };

/// Tanda tangan penerima tamu (konfirmasi selesai) — dipanggil dari HP tamu.
/// Diidentifikasi via qrToken; hanya valid saat status CHECKED_IN.
export async function submitSignatureAction(
  token: string,
  signatureData: string,
  signerName: string
): Promise<SignState> {
  const name = signerName.trim();
  if (!name) return { error: "name" };
  if (!signatureData.startsWith("data:image/png") || signatureData.length < 1000)
    return { error: "empty" };

  const visit = await prisma.visit.findUnique({ where: { qrToken: token } });
  if (!visit) return { error: "notfound" };
  if (visit.status !== VISIT_STATUS.CHECKED_IN)
    return { error: "status" };
  if (visit.signedAt) return { ok: true }; // sudah ditandatangani

  await prisma.visit.update({
    where: { id: visit.id },
    data: { signedAt: new Date(), signedName: name, signatureData },
  });

  revalidatePath(`/visit/${token}`);
  revalidatePath("/security");
  return { ok: true };
}
