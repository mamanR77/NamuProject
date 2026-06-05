"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  VISIT_STATUS,
  VISIT_PURPOSES,
  PURPOSE_OTHERS,
  ID_TYPE_VALUES,
  VEHICLE_TYPE_VALUES,
} from "@/lib/constants";

export type RegisterState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function str(formData: FormData, key: string): string {
  return ((formData.get(key) as string | null) ?? "").trim();
}

export async function registerVisitAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  // Section 1 — Informasi Kunjungan
  const purposeCategory = str(formData, "purposeCategory");
  const purposeOther = str(formData, "purposeOther");
  const detailPurpose = str(formData, "detailPurpose");
  const hostName = str(formData, "hostName");
  const departmentId = str(formData, "departmentId");
  // Section 2 — Data Diri
  const fullName = str(formData, "fullName");
  const company = str(formData, "company");
  const jabatan = str(formData, "jabatan");
  const phone = str(formData, "phone");
  const email = str(formData, "email");
  // Section 3 — Identitas
  const idType = str(formData, "idType");
  const idNumber = str(formData, "idNumber");
  const idPhoto = str(formData, "idPhoto");
  const selfiePhoto = str(formData, "selfiePhoto");
  // Section 4 — Kendaraan
  const vehicleType = str(formData, "vehicleType");
  const vehiclePlate = str(formData, "vehiclePlate").toUpperCase();
  const vehicleBrand = str(formData, "vehicleBrand");
  const driverType = str(formData, "driverType");
  const driverName = str(formData, "driverName");
  // Section 5 — Safety
  const safetyAgreed = formData.get("safetyAgreed") != null;

  const fe: Record<string, string> = {};
  // Section 1
  if (!purposeCategory) fe.purpose = "Pilih tujuan kedatangan";
  else if (!VISIT_PURPOSES.includes(purposeCategory as never))
    fe.purpose = "Tujuan kedatangan tidak valid";
  else if (purposeCategory === PURPOSE_OTHERS && !purposeOther)
    fe.purpose = "Isi tujuan kedatangan Anda";
  if (!hostName) fe.hostName = "Nama Host/PIC wajib diisi";
  if (!departmentId) fe.departmentId = "Pilih department";
  // Section 2
  if (!fullName) fe.fullName = "Nama lengkap wajib diisi";
  if (!phone) fe.phone = "Nomor handphone wajib diisi";
  // Section 3
  if (!idType || !ID_TYPE_VALUES.includes(idType))
    fe.idType = "Pilih jenis identitas";
  if (!idNumber) fe.idNumber = "Nomor identitas wajib diisi";
  if (!idPhoto) fe.idPhoto = "Foto identitas wajib diunggah";
  // Section 4
  if (!vehicleType || !VEHICLE_TYPE_VALUES.includes(vehicleType))
    fe.vehicleType = "Pilih jenis kendaraan";
  if (vehicleType === "CAR" || vehicleType === "MOTORCYCLE") {
    if (!vehiclePlate) fe.vehiclePlate = "Nomor polisi wajib diisi";
    if (driverType !== "SELF" && driverType !== "DRIVER")
      fe.driverType = "Pilih pengemudi";
    if (driverType === "DRIVER" && !driverName)
      fe.driverName = "Nama supir wajib diisi";
  }
  // Section 5
  if (!safetyAgreed) fe.safetyAgreed = "Anda harus menyetujui komitmen safety";

  if (Object.keys(fe).length > 0) return { fieldErrors: fe };

  const dept = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!dept) return { fieldErrors: { departmentId: "Department tidak ditemukan" } };

  const purpose =
    purposeCategory === PURPOSE_OTHERS ? purposeOther : purposeCategory;
  const hasVehicle = vehicleType === "CAR" || vehicleType === "MOTORCYCLE";

  const visit = await prisma.visit.create({
    data: {
      visitType: "GENERAL",
      status: VISIT_STATUS.PENDING_REVIEW,
      purpose,
      detailPurpose: detailPurpose || null,
      hostName,
      department: { connect: { id: departmentId } },
      vehicleType,
      vehiclePlate: hasVehicle ? vehiclePlate || null : null,
      vehicleBrand: hasVehicle ? vehicleBrand || null : null,
      driverType: hasVehicle ? driverType || null : null,
      driverName: hasVehicle && driverType === "DRIVER" ? driverName || null : null,
      safetyAgreed: true,
      visitor: {
        create: {
          fullName,
          company: company || null,
          jabatan: jabatan || null,
          phone,
          email: email || null,
          idType,
          idNumber,
          idPhoto,
          selfiePhoto: selfiePhoto || null,
        },
      },
    },
  });

  redirect(`/visit/${visit.qrToken}`);
}
