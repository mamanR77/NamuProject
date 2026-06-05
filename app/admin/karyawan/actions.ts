"use server";

import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/db";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

function pick(row: Record<string, unknown>, keys: string[]): string {
  for (const k of Object.keys(row)) {
    if (keys.includes(k.trim().toLowerCase())) return String(row[k] ?? "").trim();
  }
  return "";
}

export type ImportState = {
  error?: string;
  ok?: boolean;
  created?: number;
  updated?: number;
  skipped?: number;
  errors?: string[];
};

/// Import karyawan (host) dari Excel: kolom NIK, Nama, Department, Jabatan.
export async function importEmployeesAction(
  _prev: ImportState,
  formData: FormData
): Promise<ImportState> {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0)
    return { error: "Pilih file Excel (.xlsx) terlebih dahulu." };

  let rows: Record<string, unknown>[];
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buf, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  } catch {
    return { error: "File tidak bisa dibaca. Pastikan format Excel (.xlsx)." };
  }
  if (rows.length === 0)
    return { error: "File kosong / tidak ada baris data." };

  const pwd = await hashPassword(Math.random().toString(36).slice(2));
  const deptCache = new Map<string, string>();
  let created = 0,
    updated = 0,
    skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const nik = pick(row, ["nik"]);
    const name = pick(row, ["nama", "name"]);
    const deptName = pick(row, ["department", "departemen", "dept", "divisi"]);
    const jabatan = pick(row, ["jabatan", "position", "title"]);
    const entitas = pick(row, ["entitas", "entity"]).toUpperCase();
    if (!nik || !name) {
      skipped++;
      continue;
    }
    try {
      let deptId: string | null = null;
      if (deptName) {
        deptId = deptCache.get(deptName.toLowerCase()) ?? null;
        if (!deptId) {
          const d = await prisma.department.upsert({
            where: { name: deptName },
            update: {},
            create: { name: deptName },
          });
          deptId = d.id;
          deptCache.set(deptName.toLowerCase(), d.id);
        }
      }
      const existing = await prisma.user.findUnique({ where: { nik } });
      if (existing) {
        await prisma.user.update({
          where: { nik },
          data: {
            name,
            jabatan: jabatan || null,
            entitas: entitas || null,
            departmentId: deptId,
            role: ROLES.HOST,
          },
        });
        updated++;
      } else {
        await prisma.user.create({
          data: {
            name,
            username: `k_${nik}`,
            passwordHash: pwd,
            role: ROLES.HOST,
            nik,
            jabatan: jabatan || null,
            entitas: entitas || null,
            departmentId: deptId,
          },
        });
        created++;
      }
    } catch (e) {
      errors.push(`Baris ${i + 2}: ${(e as Error).message}`);
    }
  }

  revalidatePath("/admin/karyawan");
  return { ok: true, created, updated, skipped, errors: errors.slice(0, 10) };
}

export type EmpFormState = {
  error?: string;
  ok?: boolean;
  fieldErrors?: Record<string, string>;
};

/// Tambah karyawan (host) manual.
export async function addEmployeeAction(
  _prev: EmpFormState,
  formData: FormData
): Promise<EmpFormState> {
  await requireAdmin();
  const nik = String(formData.get("nik") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const jabatan = String(formData.get("jabatan") ?? "").trim();
  const departmentId = String(formData.get("departmentId") ?? "").trim();
  const entitas = String(formData.get("entitas") ?? "").trim();

  const fe: Record<string, string> = {};
  if (!nik) fe.nik = "NIK wajib diisi";
  if (!name) fe.name = "Nama wajib diisi";
  if (Object.keys(fe).length) return { fieldErrors: fe };

  const dup = await prisma.user.findUnique({ where: { nik } });
  if (dup) return { fieldErrors: { nik: "NIK sudah terdaftar." } };

  await prisma.user.create({
    data: {
      name,
      username: `k_${nik}`,
      passwordHash: await hashPassword(Math.random().toString(36).slice(2)),
      role: ROLES.HOST,
      nik,
      jabatan: jabatan || null,
      entitas: entitas || null,
      departmentId: departmentId || null,
    },
  });
  revalidatePath("/admin/karyawan");
  return { ok: true };
}

export async function deleteEmployeeAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("userId") ?? "");
  if (!id) return;
  const visits = await prisma.visit.count({ where: { hostId: id } });
  if (visits > 0) return; // jangan hapus jika masih dipakai kunjungan
  await prisma.notification.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/karyawan");
}
