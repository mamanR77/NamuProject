-- Form Kunjungan Umum: field data diri, identitas, foto, kendaraan, host/department, safety.
ALTER TABLE "Visitor" ADD COLUMN "jabatan" TEXT;
ALTER TABLE "Visitor" ADD COLUMN "email" TEXT;
ALTER TABLE "Visitor" ADD COLUMN "idType" TEXT;
ALTER TABLE "Visitor" ADD COLUMN "idPhoto" TEXT;
ALTER TABLE "Visitor" ADD COLUMN "selfiePhoto" TEXT;

ALTER TABLE "Visit" ADD COLUMN "hostName" TEXT;
ALTER TABLE "Visit" ADD COLUMN "departmentId" TEXT;
ALTER TABLE "Visit" ADD COLUMN "vehicleType" TEXT;
ALTER TABLE "Visit" ADD COLUMN "vehicleBrand" TEXT;
ALTER TABLE "Visit" ADD COLUMN "driverType" TEXT;
ALTER TABLE "Visit" ADD COLUMN "driverName" TEXT;
ALTER TABLE "Visit" ADD COLUMN "detailPurpose" TEXT;
ALTER TABLE "Visit" ADD COLUMN "safetyAgreed" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Visit_departmentId_idx" ON "Visit"("departmentId");
