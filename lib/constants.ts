// Pusat nilai-nilai "enum" untuk Namu VMS.
// SQLite (Prisma) tidak mendukung enum, jadi kita pakai String + konstanta ini
// agar konsisten dan type-safe di sisi aplikasi.

export const ROLES = {
  ADMIN: "ADMIN",
  SECURITY: "SECURITY",
  HOST: "HOST",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const VISIT_TYPE = {
  GENERAL: "GENERAL", // tamu umum: meeting, audit, kunjungan
  LOADING: "LOADING", // sopir/barang menuju loading area
} as const;
export type VisitType = (typeof VISIT_TYPE)[keyof typeof VISIT_TYPE];

export const VISIT_TYPE_LABEL: Record<string, string> = {
  GENERAL: "Kunjungan Umum",
  LOADING: "Loading/Unloading",
};

/// Sub-aktivitas khusus untuk visitType = LOADING.
export const LOADING_TYPE = {
  LOADING: "LOADING", // ambil/muat barang
  UNLOADING: "UNLOADING", // bongkar barang
} as const;
export type LoadingType = (typeof LOADING_TYPE)[keyof typeof LOADING_TYPE];

export const LOADING_TYPE_LABEL: Record<string, string> = {
  LOADING: "Loading (muat)",
  UNLOADING: "Unloading (bongkar)",
};

/// Pilihan Tujuan Kedatangan untuk Kunjungan Umum. "Others" => isi manual.
export const VISIT_PURPOSES = [
  "Meeting",
  "Audit",
  "Site Visit",
  "Training",
  "Interview",
  "Vendor / Supplier Visit",
  "Maintenance / Service",
  "Contractor Work",
  "Delivery / Collection",
  "Government / Regulatory Visit",
  "Others",
] as const;
export const PURPOSE_OTHERS = "Others";

export const VISIT_STATUS = {
  PENDING_REVIEW: "PENDING_REVIEW", // tamu daftar, menunggu review Security
  PENDING_CONFIRM: "PENDING_CONFIRM", // lolos review, menunggu konfirmasi karyawan/Warehouse
  APPROVED: "APPROVED", // diterima (karyawan/Warehouse setuju), siap terbit kartu
  CARD_ISSUED: "CARD_ISSUED", // kartu diterbitkan, barcode aktif, menunggu scan masuk di pos
  CHECKED_IN: "CHECKED_IN", // tamu sudah di dalam gedung (setelah scan masuk)
  REJECTED: "REJECTED", // ditolak (saat review atau konfirmasi)
  CHECKED_OUT: "CHECKED_OUT", // tamu sudah keluar (setelah scan keluar)
  EXPIRED: "EXPIRED", // kadaluarsa (mis. tidak datang)
} as const;
export type VisitStatus = (typeof VISIT_STATUS)[keyof typeof VISIT_STATUS];

/// Label status (Bahasa Indonesia) untuk panel internal (Security/Admin).
export const VISIT_STATUS_LABEL: Record<string, string> = {
  PENDING_REVIEW: "Menunggu Review",
  PENDING_CONFIRM: "Menunggu Konfirmasi",
  APPROVED: "Diterima",
  CARD_ISSUED: "Kartu Terbit",
  CHECKED_IN: "Di Dalam",
  REJECTED: "Ditolak",
  CHECKED_OUT: "Selesai",
  EXPIRED: "Kedaluwarsa",
};

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

// ---- Karyawan ----

export const ENTITAS = ["GMI", "GID", "GAP", "TG"] as const;
export const ENTITAS_VALUES = ENTITAS as readonly string[];

// ---- Form Kunjungan Umum ----

export const ID_TYPES = [
  { value: "KTP", label: "KTP" },
  { value: "SIM", label: "SIM" },
  { value: "PASPOR", label: "Paspor" },
  { value: "KARTU_PEGAWAI", label: "Kartu Pegawai" },
] as const;
export const ID_TYPE_VALUES = ID_TYPES.map((t) => t.value) as readonly string[];

export const VEHICLE_TYPES = [
  { value: "CAR", label: "Mobil" },
  { value: "MOTORCYCLE", label: "Motor" },
  { value: "NONE", label: "Tidak Membawa Kendaraan" },
] as const;
export const VEHICLE_TYPE_VALUES = VEHICLE_TYPES.map(
  (t) => t.value
) as readonly string[];
export const VEHICLE_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  VEHICLE_TYPES.map((t) => [t.value, t.label])
);

export const DRIVER_TYPES = [
  { value: "SELF", label: "Sendiri" },
  { value: "DRIVER", label: "Dengan Supir" },
] as const;

export const ID_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  ID_TYPES.map((t) => [t.value, t.label])
);

export const APP_NAME = "Namu";
export const APP_DESC = "Visitor Management System — PT Glico Manufacturing Indonesia";
