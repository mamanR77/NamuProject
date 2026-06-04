// Seed data awal Namu VMS. Jalankan: npm run db:seed
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Namu VMS...");

  // Departemen
  const deptNames = ["Manufacturing", "HRD & GA", "IT", "Finance", "Marketing"];
  const departments: Record<string, string> = {};
  for (const name of deptNames) {
    const d = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    departments[name] = d.id;
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  // Admin
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Administrator",
      username: "admin",
      passwordHash,
      role: "ADMIN",
      departmentId: departments["IT"],
    },
  });

  // Security / Resepsionis
  await prisma.user.upsert({
    where: { username: "security" },
    update: {},
    create: {
      name: "Petugas Security",
      username: "security",
      passwordHash,
      role: "SECURITY",
      departmentId: departments["HRD & GA"],
    },
  });

  // Host (karyawan yang dikunjungi)
  const host = await prisma.user.upsert({
    where: { username: "andi" },
    update: {},
    create: {
      name: "Andi Wijaya",
      username: "andi",
      passwordHash,
      role: "HOST",
      nik: "3275010101900001",
      waNumber: "6281200000001",
      departmentId: departments["Manufacturing"],
    },
  });

  // Contoh tamu + kunjungan (status PENDING)
  const visitor = await prisma.visitor.create({
    data: {
      fullName: "Budi Santoso",
      company: "PT Mitra Sejahtera",
      phone: "081234567890",
    },
  });
  await prisma.visit.create({
    data: {
      visitorId: visitor.id,
      hostId: host.id,
      purpose: "Meeting",
      status: "PENDING_REVIEW",
    },
  });

  console.log("✅ Seed selesai.");
  console.log("   Login contoh (password semua: password123):");
  console.log("   - admin (ADMIN)");
  console.log("   - security (SECURITY)");
  console.log("   - andi (HOST)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
