// Prisma client singleton untuk Namu VMS.
// Prisma 7 memakai driver adapter; untuk dev kita pakai better-sqlite3.
// Saat migrasi ke PostgreSQL (prod), ganti adapter ke @prisma/adapter-pg.

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const DATABASE_URL = process.env.DATABASE_URL ?? "file:./dev.db";

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: DATABASE_URL });
  return new PrismaClient({ adapter });
}

// Hindari membuat banyak koneksi saat hot-reload di dev.
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
