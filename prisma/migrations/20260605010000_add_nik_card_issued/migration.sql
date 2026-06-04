-- Tambah NIK karyawan (penerima tamu) + field kartu/konfirmasi selesai.
ALTER TABLE "User" ADD COLUMN "nik" TEXT;
CREATE UNIQUE INDEX "User_nik_key" ON "User"("nik");

ALTER TABLE "Visit" ADD COLUMN "cardIssuedAt" DATETIME;
ALTER TABLE "Visit" ADD COLUMN "signedNik" TEXT;
