"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin, destroySession, hashPassword } from "@/lib/auth";
import { ROLES, type Role } from "@/lib/constants";

export async function logoutAction() {
  await destroySession();
  redirect("/staff/login");
}

// Catatan: aksi lifecycle kunjungan (review/konfirmasi/check-in/out) ada di
// app/security/actions.ts dan dipakai oleh modul Security (Admin juga boleh).

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
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  const nik = String(formData.get("nik") ?? "").trim();
  const waNumber = String(formData.get("waNumber") ?? "").trim();
  const departmentId = String(formData.get("departmentId") ?? "").trim();

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Nama wajib diisi";
  if (!username) fieldErrors.username = "Username wajib diisi";
  else if (!/^[a-z0-9._-]+$/.test(username))
    fieldErrors.username = "Username hanya huruf kecil, angka, . _ -";
  if (!password || password.length < 6)
    fieldErrors.password = "Password minimal 6 karakter";
  if (!VALID_ROLES.includes(role)) fieldErrors.role = "Role tidak valid";
  // NIK wajib untuk HOST (penerima tamu) — kunci validasi konfirmasi selesai.
  if (role === ROLES.HOST && !nik) fieldErrors.nik = "NIK wajib untuk penerima tamu";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: "Username sudah terdaftar." };
  if (nik) {
    const dup = await prisma.user.findUnique({ where: { nik } });
    if (dup) return { fieldErrors: { nik: "NIK sudah terdaftar." } };
  }

  await prisma.user.create({
    data: {
      name,
      username,
      passwordHash: await hashPassword(password),
      role,
      nik: nik || null,
      waNumber: waNumber || null,
      departmentId: departmentId || null,
    },
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

export type PasswordState = { ok?: boolean; error?: string };

/// Ganti password akun staff (Super Admin / Security).
export async function changePasswordAction(
  _prev: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!userId) return { error: "Akun tidak valid." };
  if (password.length < 6) return { error: "Password minimal 6 karakter." };
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(password) },
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
