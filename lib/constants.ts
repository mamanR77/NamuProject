// Pusat nilai-nilai "enum" untuk Namu VMS.
// SQLite (Prisma) tidak mendukung enum, jadi kita pakai String + konstanta ini
// agar konsisten dan type-safe di sisi aplikasi.

export const ROLES = {
  ADMIN: "ADMIN",
  SECURITY: "SECURITY",
  HOST: "HOST",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const VISIT_STATUS = {
  PENDING: "PENDING", // tamu sudah daftar, menunggu approval host
  APPROVED: "APPROVED", // disetujui host, belum masuk
  REJECTED: "REJECTED", // ditolak host
  CHECKED_IN: "CHECKED_IN", // tamu sudah di dalam gedung
  CHECKED_OUT: "CHECKED_OUT", // tamu sudah keluar
  EXPIRED: "EXPIRED", // kadaluarsa (mis. tidak datang)
} as const;
export type VisitStatus = (typeof VISIT_STATUS)[keyof typeof VISIT_STATUS];

/// Status yang dianggap "tamu sedang berada di dalam gedung" (untuk dashboard real-time).
export const INSIDE_STATUSES: VisitStatus[] = [VISIT_STATUS.CHECKED_IN];

export const NOTIFICATION_CHANNEL = {
  IN_APP: "IN_APP",
  WA: "WA",
} as const;
export type NotificationChannel =
  (typeof NOTIFICATION_CHANNEL)[keyof typeof NOTIFICATION_CHANNEL];

export const NOTIFICATION_TYPE = {
  VISIT_REGISTERED: "VISIT_REGISTERED", // tamu baru mendaftar -> ke host
  VISIT_APPROVED: "VISIT_APPROVED",
  VISIT_REJECTED: "VISIT_REJECTED",
  VISIT_CHECKED_IN: "VISIT_CHECKED_IN",
  VISIT_CHECKED_OUT: "VISIT_CHECKED_OUT",
} as const;
export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const NOTIFICATION_STATUS = {
  PENDING: "PENDING",
  SENT: "SENT",
  FAILED: "FAILED",
  READ: "READ",
} as const;
export type NotificationStatus =
  (typeof NOTIFICATION_STATUS)[keyof typeof NOTIFICATION_STATUS];

export const APP_NAME = "Namu";
export const APP_DESC = "Visitor Management System — PT Glico Manufacturing Indonesia";
