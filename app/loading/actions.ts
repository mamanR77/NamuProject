"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { VISIT_STATUS, VISIT_TYPE, LOADING_TYPE } from "@/lib/constants";

export type LoadingState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function str(formData: FormData, key: string): string {
  return ((formData.get(key) as string | null) ?? "").trim();
}

export async function registerLoadingAction(
  _prev: LoadingState,
  formData: FormData
): Promise<LoadingState> {
  const fullName = str(formData, "fullName"); // nama sopir
  const company = str(formData, "company"); // ekspedisi / transporter
  const phone = str(formData, "phone");
  const vehiclePlate = str(formData, "vehiclePlate").toUpperCase();
  const docNumber = str(formData, "docNumber");
  const loadingType = str(formData, "loadingType");

  const fieldErrors: Record<string, string> = {};
  if (!fullName) fieldErrors.fullName = "Nama sopir wajib diisi";
  if (!phone) fieldErrors.phone = "Nomor HP wajib diisi";
  if (!company) fieldErrors.company = "Nama ekspedisi/transporter wajib diisi";
  if (!vehiclePlate) fieldErrors.vehiclePlate = "Nomor polisi wajib diisi";
  if (loadingType !== LOADING_TYPE.LOADING && loadingType !== LOADING_TYPE.UNLOADING)
    fieldErrors.loadingType = "Pilih aktivitas Loading atau Unloading";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const purpose =
    loadingType === LOADING_TYPE.LOADING ? "Loading barang" : "Unloading barang";

  const visit = await prisma.visit.create({
    data: {
      visitType: VISIT_TYPE.LOADING,
      loadingType,
      vehiclePlate,
      docNumber: docNumber || null,
      purpose,
      status: VISIT_STATUS.PENDING,
      visitor: {
        create: {
          fullName,
          company: company || null,
          phone,
        },
      },
      // Tanpa host: Loading/Unloading diproses oleh Security/Admin di dashboard.
    },
  });

  redirect(`/visit/${visit.qrToken}`);
}
