"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ROLES, VISIT_STATUS, VISIT_TYPE } from "@/lib/constants";

// Security & Admin boleh menjalankan aksi lifecycle.
const ALLOWED = [ROLES.SECURITY, ROLES.ADMIN];

function revalidate() {
  revalidatePath("/security");
  revalidatePath("/admin");
  revalidatePath("/admin/visits");
}

function visitId(formData: FormData) {
  return String(formData.get("visitId") ?? "");
}

/// Security menyetujui review awal: PENDING_REVIEW -> PENDING_CONFIRM.
export async function reviewOkAction(formData: FormData) {
  await requireRole(ALLOWED);
  const id = visitId(formData);
  if (!id) return;
  await prisma.visit.update({
    where: { id },
    data: { status: VISIT_STATUS.PENDING_CONFIRM, reviewedAt: new Date() },
  });
  revalidate();
}

/// Konfirmasi diterima oleh karyawan/Warehouse (ditandai Security): -> APPROVED.
export async function confirmAcceptAction(formData: FormData) {
  await requireRole(ALLOWED);
  const id = visitId(formData);
  if (!id) return;
  await prisma.visit.update({
    where: { id },
    data: { status: VISIT_STATUS.APPROVED, approvedAt: new Date() },
  });
  revalidate();
}

/// Security mengoreksi/menetapkan Host terdaftar (link ke karyawan ber-NIK).
/// hostId kosong = hapus penautan (kembali ke nama bebas dari tamu).
export async function assignHostAction(formData: FormData) {
  await requireRole(ALLOWED);
  const id = visitId(formData);
  const hostId = String(formData.get("hostId") ?? "").trim();
  if (!id) return;
  await prisma.visit.update({
    where: { id },
    data: { host: hostId ? { connect: { id: hostId } } : { disconnect: true } },
  });
  revalidate();
}

/// Tolak kunjungan (saat review atau konfirmasi).
export async function rejectAction(formData: FormData) {
  await requireRole(ALLOWED);
  const id = visitId(formData);
  if (!id) return;
  await prisma.visit.update({
    where: { id },
    data: { status: VISIT_STATUS.REJECTED, rejectedAt: new Date() },
  });
  revalidate();
}

/// Terbitkan kartu + simpan Nomor Kartu Tamu: APPROVED -> CARD_ISSUED.
/// Setelah ini barcode di HP tamu aktif (untuk discan masuk di pos).
export async function issueCardAction(formData: FormData) {
  await requireRole(ALLOWED);
  const id = visitId(formData);
  const cardNo = String(formData.get("cardNo") ?? "").trim();
  if (!id || !cardNo) return;
  await prisma.visit.update({
    where: { id },
    data: { status: VISIT_STATUS.CARD_ISSUED, cardIssuedAt: new Date(), cardNo },
  });
  revalidate();
}

/// Tandai masuk manual (fallback non-scan): CARD_ISSUED -> CHECKED_IN.
export async function gateCheckInAction(formData: FormData) {
  await requireRole(ALLOWED);
  const id = visitId(formData);
  if (!id) return;
  const visit = await prisma.visit.findUnique({ where: { id } });
  if (!visit || visit.status !== VISIT_STATUS.CARD_ISSUED) return;
  await prisma.visit.update({
    where: { id },
    data: { status: VISIT_STATUS.CHECKED_IN, checkInAt: new Date() },
  });
  revalidate();
}

/// Check-out: CHECKED_IN -> CHECKED_OUT.
/// Kunjungan Umum wajib sudah ada konfirmasi selesai (signedAt) dari penerima tamu.
export async function checkOutAction(formData: FormData) {
  await requireRole(ALLOWED);
  const id = visitId(formData);
  if (!id) return;
  const visit = await prisma.visit.findUnique({ where: { id } });
  if (!visit || visit.status !== VISIT_STATUS.CHECKED_IN) return;
  if (visit.visitType !== VISIT_TYPE.LOADING && !visit.signedAt) return; // terkunci s/d konfirmasi selesai
  await prisma.visit.update({
    where: { id },
    data: { status: VISIT_STATUS.CHECKED_OUT, checkOutAt: new Date() },
  });
  revalidate();
}

export type GateResult = {
  ok: boolean;
  action?: "checkin" | "checkout";
  name?: string;
  message?: string;
};

/// Aksi gate scanner Security: tentukan check-in/checkout dari status barcode tamu.
export async function gateScanAction(token: string): Promise<GateResult> {
  await requireRole(ALLOWED);
  const raw = token.trim();
  if (!raw) return { ok: false, message: "Kode kosong." };

  const visit = await prisma.visit.findUnique({
    where: { qrToken: raw },
    include: { visitor: true },
  });
  if (!visit) return { ok: false, message: "Barcode tidak dikenali." };

  const name = visit.visitor.fullName;

  if (visit.status === VISIT_STATUS.CARD_ISSUED) {
    await prisma.visit.update({
      where: { id: visit.id },
      data: { status: VISIT_STATUS.CHECKED_IN, checkInAt: new Date() },
    });
    revalidate();
    return { ok: true, action: "checkin", name };
  }

  if (visit.status === VISIT_STATUS.CHECKED_IN) {
    if (visit.visitType !== VISIT_TYPE.LOADING && !visit.signedAt) {
      return {
        ok: false,
        name,
        message: "Belum ada konfirmasi selesai dari penerima tamu.",
      };
    }
    await prisma.visit.update({
      where: { id: visit.id },
      data: { status: VISIT_STATUS.CHECKED_OUT, checkOutAt: new Date() },
    });
    revalidate();
    return { ok: true, action: "checkout", name };
  }

  if (visit.status === VISIT_STATUS.CHECKED_OUT)
    return { ok: false, name, message: "Tamu sudah check-out." };
  if (visit.status === VISIT_STATUS.APPROVED)
    return { ok: false, name, message: "Kartu belum diterbitkan." };

  return { ok: false, name, message: "Barcode belum aktif untuk scan." };
}
