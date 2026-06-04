"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin, destroySession, hashPassword } from "@/lib/auth";
import { ROLES, VISIT_STATUS, type Role } from "@/lib/constants";

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/visits");
}

export async function logoutAction() {
  await destroySession();
  redirect("/staff/login");
}

// ---- Lifecycle kunjungan (form actions, mengembalikan void) ----

export async function approveVisitAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("visitId") ?? "");
  if (!id) return;
  await prisma.visit.update({
    where: { id },
    data: { status: VISIT_STATUS.APPROVED, approvedAt: new Date(), rejectedAt: null },
  });
  revalidateAdmin();
}

export async function rejectVisitAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("visitId") ?? "");
  if (!id) return;
  await prisma.visit.update({
    where: { id },
    data: { status: VISIT_STATUS.REJECTED, rejectedAt: new Date() },
  });
  revalidateAdmin();
}

export async function checkInVisitAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("visitId") ?? "");
  if (!id) return;
  await prisma.visit.update({
    where: { id },
    data: { status: VISIT_STATUS.CHECKED_IN, checkInAt: new Date() },
  });
  revalidateAdmin();
}

export async function checkOutVisitAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("visitId") ?? "");
  if (!id) return;
  await prisma.visit.update({
    where: { id },
    data: { status: VISIT_STATUS.CHECKED_OUT, checkOutAt: new Date() },
  });
  revalidateAdmin();
}

// ---- Kelola User staff ----

export type UserFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

const VALID_ROLES: Role[] = [ROLES.ADMIN, ROLES.SECURITY, ROLES.HOST];

export async function createUserAction(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  const waNumber = String(formData.get("waNumber") ?? "").trim();
  const departmentId = String(formData.get("departmentId") ?? "").trim();

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Nama wajib diisi";
  if (!email) fieldErrors.email = "Email wajib diisi";
  if (!password || password.length < 6)
    fieldErrors.password = "Password minimal 6 karakter";
  if (!VALID_ROLES.includes(role)) fieldErrors.role = "Role tidak valid";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email sudah terdaftar." };

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role,
      waNumber: waNumber || null,
      departmentId: departmentId || null,
    },
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUserAction(formData: FormData) {
  const me = await requireAdmin();
  const id = String(formData.get("userId") ?? "");
  if (!id || id === me.id) return; // tidak boleh hapus diri sendiri
  // Lindungi dari error relasi: hanya hapus bila tak punya kunjungan/notifikasi.
  const visits = await prisma.visit.count({ where: { hostId: id } });
  if (visits > 0) return;
  await prisma.notification.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}

// ---- Kelola Departemen ----

export type DeptFormState = { error?: string; ok?: boolean };

export async function createDepartmentAction(
  _prev: DeptFormState,
  formData: FormData
): Promise<DeptFormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Nama departemen wajib diisi." };
  const existing = await prisma.department.findUnique({ where: { name } });
  if (existing) return { error: "Departemen sudah ada." };
  await prisma.department.create({ data: { name } });
  revalidatePath("/admin/departments");
  return { ok: true };
}
