"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ROLES, VISIT_STATUS } from "@/lib/constants";

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

/// Check-in tamu + simpan Nomor Kartu Tamu: APPROVED -> CHECKED_IN.
export async function checkInAction(formData: FormData) {
  await requireRole(ALLOWED);
  const id = visitId(formData);
  const cardNo = String(formData.get("cardNo") ?? "").trim();
  if (!id || !cardNo) return;
  await prisma.visit.update({
    where: { id },
    data: { status: VISIT_STATUS.CHECKED_IN, checkInAt: new Date(), cardNo },
  });
  revalidate();
}

/// Check-out: CHECKED_IN -> CHECKED_OUT. Wajib sudah ada tanda tangan penerima.
export async function checkOutAction(formData: FormData) {
  await requireRole(ALLOWED);
  const id = visitId(formData);
  if (!id) return;
  const visit = await prisma.visit.findUnique({ where: { id } });
  if (!visit || !visit.signedAt) return; // terkunci sampai ada TTD penerima tamu
  await prisma.visit.update({
    where: { id },
    data: { status: VISIT_STATUS.CHECKED_OUT, checkOutAt: new Date() },
  });
  revalidate();
}
