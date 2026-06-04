// Autentikasi staff Namu VMS (session berbasis cookie + JWT ringan via jose).
// Tamu tidak login; ini hanya untuk ADMIN / SECURITY / HOST.
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { ROLES, type Role } from "./constants";

const COOKIE_NAME = "namu_session";
const MAX_AGE_SEC = 60 * 60 * 12; // 12 jam

function getSecret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    // Fallback dev agar tidak crash; WAJIB di-set di .env untuk produksi.
    return new TextEncoder().encode("namu-dev-insecure-secret-change-me");
  }
  return new TextEncoder().encode(s);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(getSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

/// Mengembalikan user yang sedang login (atau null). Aman dipanggil di server component.
export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const uid = payload.uid as string | undefined;
    if (!uid) return null;
    return await prisma.user.findUnique({
      where: { id: uid },
      include: { department: true },
    });
  } catch {
    return null;
  }
}

/// Guard: hanya untuk halaman admin (Super Admin). Redirect ke login bila tidak berhak.
export async function requireRole(roles: Role[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/staff/login");
  if (!roles.includes(user.role as Role)) redirect("/staff/login?denied=1");
  return user;
}

export async function requireAdmin() {
  return requireRole([ROLES.ADMIN]);
}
