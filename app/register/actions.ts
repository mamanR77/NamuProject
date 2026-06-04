"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TYPE,
  VISIT_STATUS,
  VISIT_PURPOSES,
  PURPOSE_OTHERS,
} from "@/lib/constants";
import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";

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
  const fullName = str(formData, "fullName");
  const company = str(formData, "company");
  const phone = str(formData, "phone");
  const idNumber = str(formData, "idNumber");
  const purposeCategory = str(formData, "purposeCategory");
  const purposeOther = str(formData, "purposeOther");
  const hostId = str(formData, "hostId");

  const e = getDict(await getLocale()).register.err;
  const fieldErrors: Record<string, string> = {};
  if (!purposeCategory) {
    fieldErrors.purpose = e.purposeRequired;
  } else if (!VISIT_PURPOSES.includes(purposeCategory as never)) {
    fieldErrors.purpose = e.purposeInvalid;
  } else if (purposeCategory === PURPOSE_OTHERS && !purposeOther) {
    fieldErrors.purpose = e.purposeOther;
  }
  if (!fullName) fieldErrors.fullName = e.fullName;
  if (!phone) fieldErrors.phone = e.phone;
  if (!hostId) fieldErrors.hostId = e.host;
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const purpose =
    purposeCategory === PURPOSE_OTHERS ? purposeOther : purposeCategory;

  const host = await prisma.user.findUnique({ where: { id: hostId } });
  if (!host) return { error: e.hostNotFound };

  const visit = await prisma.visit.create({
    data: {
      purpose,
      status: VISIT_STATUS.PENDING,
      visitor: {
        create: {
          fullName,
          company: company || null,
          phone,
          idNumber: idNumber || null,
        },
      },
      host: { connect: { id: hostId } },
      notifications: {
        create: {
          user: { connect: { id: hostId } },
          channel: NOTIFICATION_CHANNEL.IN_APP,
          type: NOTIFICATION_TYPE.VISIT_REGISTERED,
          message: `Tamu ${fullName}${
            company ? ` (${company})` : ""
          } mendaftar untuk menemui Anda.`,
        },
      },
    },
  });

  // redirect() melempar exception khusus Next — letakkan di luar try/catch.
  redirect(`/visit/${visit.qrToken}`);
}
