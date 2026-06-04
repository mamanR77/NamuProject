"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = ((formData.get("email") as string | null) ?? "")
    .trim()
    .toLowerCase();
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email atau password salah." };
  }

  await createSession(user.id);
  // Untuk saat ini semua staff diarahkan ke /admin; guard di layout admin
  // memastikan hanya ADMIN (Super Admin) yang boleh masuk.
  redirect("/admin");
}
