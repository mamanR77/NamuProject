// i18n ringan untuk halaman tamu Namu VMS (ID / EN / JA).
// Disengaja tanpa library eksternal: cukup kamus + cookie locale.

export const LOCALES = ["id", "en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "id";

export const LOCALE_LABEL: Record<Locale, string> = {
  id: "Indonesia",
  en: "English",
  ja: "日本語",
};
export const LOCALE_FLAG: Record<Locale, string> = {
  id: "🇮🇩",
  en: "🇬🇧",
  ja: "🇯🇵",
};
export const LOCALE_COOKIE = "namu_lang";

export function normalizeLocale(value?: string | null): Locale {
  return (LOCALES as readonly string[]).includes(value ?? "")
    ? (value as Locale)
    : DEFAULT_LOCALE;
}

type StatusMsg = { label: string; desc: string };

export interface Dict {
  landing: {
    welcome: string;
    factory: string;
    tagline: string;
    choose: string;
    general: string;
    loading: string;
    internalNote: string;
    loginStaff: string;
    vms: string;
  };
  register: {
    back: string;
    title: string;
    subtitle: string;
    noHost: string;
    purpose: string;
    purposePlaceholder: string;
    purposeOther: string;
    fullName: string;
    fullNamePlaceholder: string;
    company: string;
    optional: string;
    phone: string;
    idNumber: string;
    host: string;
    hostPlaceholder: string;
    submit: string;
    submitting: string;
    err: {
      purposeRequired: string;
      purposeInvalid: string;
      purposeOther: string;
      fullName: string;
      phone: string;
      host: string;
      hostNotFound: string;
    };
  };
  loading: {
    back: string;
    title: string;
    subtitle: string;
    activity: string;
    loading: string;
    loadingSub: string;
    unloading: string;
    unloadingSub: string;
    driverName: string;
    driverPlaceholder: string;
    transporter: string;
    transporterPlaceholder: string;
    phone: string;
    plate: string;
    doc: string;
    optional: string;
    submit: string;
    submitting: string;
    err: {
      driver: string;
      phone: string;
      transporter: string;
      plate: string;
      activity: string;
    };
  };
  visit: {
    statusTitle: string;
    detail: string;
    badge: string;
    back: string;
    typeGeneral: string;
    typeLoading: string;
    actLoading: string;
    actUnloading: string;
    checkedInBanner: string;
    toHostNote: string;
    f: {
      type: string;
      name: string;
      driver: string;
      company: string;
      transporter: string;
      activity: string;
      plate: string;
      doc: string;
      meeting: string;
      purpose: string;
    };
    sign: {
      title: string;
      prompt: string;
      nameLabel: string;
      namePlaceholder: string;
      clear: string;
      save: string;
      saving: string;
      emptyErr: string;
      nameErr: string;
      signedTitle: string;
      signedBy: string;
      signedNote: string;
    };
    status: Record<string, StatusMsg>;
  };
}

const id: Dict = {
  landing: {
    welcome: "Selamat Datang di",
    factory: "Karawang Factory",
    tagline: "Healthier days, Wellbeing for life",
    choose: "Silakan pilih keperluan kunjungan Anda.",
    general: "Kunjungan Umum",
    loading: "Loading / Unloading",
    internalNote: "Sistem internal — hanya dapat diakses dari jaringan perusahaan.",
    loginStaff: "Login Staff",
    vms: "Visitor Management System",
  },
  register: {
    back: "← Kembali",
    title: "Pendaftaran Kunjungan Umum",
    subtitle:
      "Isi data berikut. Setelah mendaftar, kunjungan Anda menunggu konfirmasi dari karyawan yang dituju.",
    noHost:
      "Belum ada karyawan terdaftar sebagai tujuan kunjungan. Hubungi petugas resepsionis.",
    purpose: "Tujuan Kedatangan",
    purposePlaceholder: "— Pilih tujuan kedatangan —",
    purposeOther: "Tuliskan tujuan kedatangan Anda",
    fullName: "Nama Lengkap",
    fullNamePlaceholder: "Nama Anda",
    company: "Asal Perusahaan / Instansi",
    optional: "Opsional",
    phone: "Nomor HP",
    idNumber: "Nomor Identitas (KTP/SIM)",
    host: "Karyawan yang Dituju",
    hostPlaceholder: "— Pilih karyawan —",
    submit: "Daftar Kunjungan",
    submitting: "Mengirim...",
    err: {
      purposeRequired: "Pilih tujuan kedatangan",
      purposeInvalid: "Tujuan kedatangan tidak valid",
      purposeOther: "Isi tujuan kedatangan Anda",
      fullName: "Nama lengkap wajib diisi",
      phone: "Nomor HP wajib diisi",
      host: "Pilih karyawan yang dituju",
      hostNotFound: "Karyawan yang dituju tidak ditemukan.",
    },
  },
  loading: {
    back: "← Kembali",
    title: "Loading / Unloading",
    subtitle:
      "Pendaftaran kendaraan muat/bongkar barang menuju loading area. Tunggu konfirmasi petugas setelah mendaftar.",
    activity: "Aktivitas",
    loading: "Loading",
    loadingSub: "Muat barang",
    unloading: "Unloading",
    unloadingSub: "Bongkar barang",
    driverName: "Nama Sopir",
    driverPlaceholder: "Nama sopir",
    transporter: "Ekspedisi / Transporter",
    transporterPlaceholder: "Nama perusahaan pengangkut",
    phone: "Nomor HP",
    plate: "Nomor Polisi Kendaraan",
    doc: "No. PO / DO / Surat Jalan",
    optional: "Opsional",
    submit: "Daftar Loading / Unloading",
    submitting: "Mengirim...",
    err: {
      driver: "Nama sopir wajib diisi",
      phone: "Nomor HP wajib diisi",
      transporter: "Nama ekspedisi/transporter wajib diisi",
      plate: "Nomor polisi wajib diisi",
      activity: "Pilih aktivitas Loading atau Unloading",
    },
  },
  visit: {
    statusTitle: "Status Kunjungan",
    detail: "Detail",
    badge: "Badge Digital Namu",
    back: "Kembali ke beranda",
    typeGeneral: "Kunjungan Umum",
    typeLoading: "Loading/Unloading",
    actLoading: "Loading",
    actUnloading: "Unloading",
    checkedInBanner: "Anda sudah check-in di PT Glico Manufacturing Indonesia",
    toHostNote:
      "Saat selesai, tunjukkan barcode ini kepada penerima tamu untuk konfirmasi.",
    f: {
      type: "Jenis",
      name: "Nama",
      driver: "Sopir",
      company: "Perusahaan",
      transporter: "Ekspedisi",
      activity: "Aktivitas",
      plate: "No. Polisi",
      doc: "No. Dokumen",
      meeting: "Menemui",
      purpose: "Keperluan",
    },
    sign: {
      title: "Selesai Kunjungan",
      prompt:
        "Mohon penerima tamu menandatangani di bawah sebagai konfirmasi kunjungan telah selesai.",
      nameLabel: "Nama Penerima Tamu",
      namePlaceholder: "Nama penerima",
      clear: "Hapus",
      save: "Simpan Tanda Tangan",
      saving: "Menyimpan...",
      emptyErr: "Tanda tangan masih kosong.",
      nameErr: "Nama penerima wajib diisi.",
      signedTitle: "Kunjungan Dikonfirmasi Selesai",
      signedBy: "Ditandatangani oleh",
      signedNote: "Silakan menuju pos Security untuk proses keluar.",
    },
    status: {
      PENDING_REVIEW: {
        label: "Menunggu Review",
        desc: "Pendaftaran Anda terkirim dan sedang ditinjau oleh petugas Security. Halaman ini akan diperbarui otomatis.",
      },
      PENDING_CONFIRM: {
        label: "Menunggu Konfirmasi",
        desc: "Security sedang mengonfirmasi kunjungan Anda ke pihak yang dituju. Mohon tunggu.",
      },
      APPROVED: {
        label: "Diterima",
        desc: "Kunjungan Anda diterima. Security akan menerbitkan kartu tamu Anda.",
      },
      CARD_ISSUED: {
        label: "Kartu Terbit",
        desc: "Kartu sudah diterbitkan. Tunjukkan barcode di bawah ke pos security untuk check-in.",
      },
      CHECKED_IN: {
        label: "Sedang Berkunjung",
        desc: "Simpan kartu tamu Anda untuk proses check-out saat keluar.",
      },
      REJECTED: {
        label: "Ditolak",
        desc: "Mohon maaf, kunjungan Anda tidak dapat disetujui. Silakan hubungi karyawan yang dituju atau petugas resepsionis.",
      },
      CHECKED_OUT: {
        label: "Selesai",
        desc: "Kunjungan Anda telah selesai. Terima kasih atas kunjungannya.",
      },
      EXPIRED: {
        label: "Kedaluwarsa",
        desc: "Pendaftaran kunjungan ini telah kedaluwarsa. Silakan mendaftar ulang.",
      },
    },
  },
};

const en: Dict = {
  landing: {
    welcome: "Welcome to",
    factory: "Karawang Factory",
    tagline: "Healthier days, Wellbeing for life",
    choose: "Please select your visit purpose.",
    general: "General Visit",
    loading: "Loading / Unloading",
    internalNote: "Internal system — accessible only from the company network.",
    loginStaff: "Staff Login",
    vms: "Visitor Management System",
  },
  register: {
    back: "← Back",
    title: "General Visit Registration",
    subtitle:
      "Fill in the details below. After registering, your visit awaits confirmation from the person you are visiting.",
    noHost:
      "No employees are registered as visit hosts yet. Please contact the receptionist.",
    purpose: "Purpose of Visit",
    purposePlaceholder: "— Select purpose of visit —",
    purposeOther: "Please specify your purpose",
    fullName: "Full Name",
    fullNamePlaceholder: "Your name",
    company: "Company / Organization",
    optional: "Optional",
    phone: "Phone Number",
    idNumber: "ID Number (KTP/License)",
    host: "Person to Meet",
    hostPlaceholder: "— Select employee —",
    submit: "Register Visit",
    submitting: "Submitting...",
    err: {
      purposeRequired: "Please select purpose of visit",
      purposeInvalid: "Invalid purpose of visit",
      purposeOther: "Please specify your purpose",
      fullName: "Full name is required",
      phone: "Phone number is required",
      host: "Please select the person to meet",
      hostNotFound: "The person to meet was not found.",
    },
  },
  loading: {
    back: "← Back",
    title: "Loading / Unloading",
    subtitle:
      "Registration for vehicles loading/unloading goods at the loading area. Please wait for officer confirmation after registering.",
    activity: "Activity",
    loading: "Loading",
    loadingSub: "Load goods",
    unloading: "Unloading",
    unloadingSub: "Unload goods",
    driverName: "Driver Name",
    driverPlaceholder: "Driver name",
    transporter: "Forwarder / Transporter",
    transporterPlaceholder: "Transport company name",
    phone: "Phone Number",
    plate: "Vehicle Plate Number",
    doc: "PO / DO / Delivery Note No.",
    optional: "Optional",
    submit: "Register Loading / Unloading",
    submitting: "Submitting...",
    err: {
      driver: "Driver name is required",
      phone: "Phone number is required",
      transporter: "Forwarder/transporter is required",
      plate: "Vehicle plate number is required",
      activity: "Please select Loading or Unloading",
    },
  },
  visit: {
    statusTitle: "Visit Status",
    detail: "Details",
    badge: "Namu Digital Badge",
    back: "Back to home",
    typeGeneral: "General Visit",
    typeLoading: "Loading / Unloading",
    actLoading: "Loading",
    actUnloading: "Unloading",
    checkedInBanner: "You have checked in at PT Glico Manufacturing Indonesia",
    toHostNote:
      "When finished, show this barcode to the host for confirmation.",
    f: {
      type: "Type",
      name: "Name",
      driver: "Driver",
      company: "Company",
      transporter: "Forwarder",
      activity: "Activity",
      plate: "Plate No.",
      doc: "Document No.",
      meeting: "Meeting",
      purpose: "Purpose",
    },
    sign: {
      title: "Finish Visit",
      prompt:
        "Please ask the host to sign below to confirm the visit is complete.",
      nameLabel: "Host Name",
      namePlaceholder: "Host name",
      clear: "Clear",
      save: "Save Signature",
      saving: "Saving...",
      emptyErr: "Signature is empty.",
      nameErr: "Host name is required.",
      signedTitle: "Visit Completion Confirmed",
      signedBy: "Signed by",
      signedNote: "Please proceed to the Security post to exit.",
    },
    status: {
      PENDING_REVIEW: {
        label: "Under Review",
        desc: "Your registration has been submitted and is being reviewed by Security. This page updates automatically.",
      },
      PENDING_CONFIRM: {
        label: "Awaiting Confirmation",
        desc: "Security is confirming your visit with the host. Please wait.",
      },
      APPROVED: {
        label: "Approved",
        desc: "Your visit has been approved. Security will issue your visitor card.",
      },
      CARD_ISSUED: {
        label: "Card Issued",
        desc: "Your card has been issued. Show the barcode below at the Security post to check in.",
      },
      CHECKED_IN: {
        label: "Visiting",
        desc: "Keep your visitor card for check-out when you leave.",
      },
      REJECTED: {
        label: "Rejected",
        desc: "Sorry, your visit could not be approved. Please contact the person you are visiting or the receptionist.",
      },
      CHECKED_OUT: {
        label: "Completed",
        desc: "Your visit is complete. Thank you for visiting.",
      },
      EXPIRED: {
        label: "Expired",
        desc: "This visit registration has expired. Please register again.",
      },
    },
  },
};

const ja: Dict = {
  landing: {
    welcome: "ようこそ",
    factory: "カラワン工場",
    tagline: "Healthier days, Wellbeing for life",
    choose: "ご用件をお選びください。",
    general: "一般訪問",
    loading: "搬入 / 搬出",
    internalNote: "社内システム — 社内ネットワークからのみアクセス可能です。",
    loginStaff: "スタッフログイン",
    vms: "来訪者管理システム",
  },
  register: {
    back: "← 戻る",
    title: "一般訪問の登録",
    subtitle:
      "以下の情報をご入力ください。登録後、面会先の社員の確認をお待ちいただきます。",
    noHost:
      "面会先として登録された社員がいません。受付にお問い合わせください。",
    purpose: "訪問目的",
    purposePlaceholder: "— 訪問目的を選択 —",
    purposeOther: "訪問目的をご記入ください",
    fullName: "氏名",
    fullNamePlaceholder: "お名前",
    company: "会社・組織名",
    optional: "任意",
    phone: "電話番号",
    idNumber: "身分証番号（KTP/免許証）",
    host: "面会する社員",
    hostPlaceholder: "— 社員を選択 —",
    submit: "登録する",
    submitting: "送信中...",
    err: {
      purposeRequired: "訪問目的を選択してください",
      purposeInvalid: "無効な訪問目的です",
      purposeOther: "訪問目的をご記入ください",
      fullName: "氏名は必須です",
      phone: "電話番号は必須です",
      host: "面会する社員を選択してください",
      hostNotFound: "面会先の社員が見つかりません。",
    },
  },
  loading: {
    back: "← 戻る",
    title: "搬入 / 搬出",
    subtitle:
      "搬入エリアへ荷物を搬入・搬出する車両の登録です。登録後、係員の確認をお待ちください。",
    activity: "作業",
    loading: "Loading",
    loadingSub: "荷物を積む",
    unloading: "Unloading",
    unloadingSub: "荷物を降ろす",
    driverName: "運転手名",
    driverPlaceholder: "運転手名",
    transporter: "運送会社",
    transporterPlaceholder: "運送会社名",
    phone: "電話番号",
    plate: "車両ナンバー",
    doc: "PO / DO / 納品書番号",
    optional: "任意",
    submit: "搬入/搬出を登録",
    submitting: "送信中...",
    err: {
      driver: "運転手名は必須です",
      phone: "電話番号は必須です",
      transporter: "運送会社は必須です",
      plate: "車両ナンバーは必須です",
      activity: "Loading または Unloading を選択してください",
    },
  },
  visit: {
    statusTitle: "訪問ステータス",
    detail: "詳細",
    badge: "Namu デジタルバッジ",
    back: "ホームに戻る",
    typeGeneral: "一般訪問",
    typeLoading: "搬入 / 搬出",
    actLoading: "Loading",
    actUnloading: "Unloading",
    checkedInBanner: "PT Glico Manufacturing Indonesia にチェックインしました",
    toHostNote: "ご訪問終了時、このバーコードを訪問先にご提示ください。",
    f: {
      type: "種別",
      name: "氏名",
      driver: "運転手",
      company: "会社",
      transporter: "運送会社",
      activity: "作業",
      plate: "車両ナンバー",
      doc: "書類番号",
      meeting: "面会先",
      purpose: "目的",
    },
    sign: {
      title: "訪問終了",
      prompt: "訪問終了の確認として、訪問先の方に下記へ署名をお願いします。",
      nameLabel: "訪問先氏名",
      namePlaceholder: "訪問先のお名前",
      clear: "消去",
      save: "署名を保存",
      saving: "保存中...",
      emptyErr: "署名が空です。",
      nameErr: "訪問先氏名は必須です。",
      signedTitle: "訪問終了が確認されました",
      signedBy: "署名者",
      signedNote: "退出のため警備（受付）へお進みください。",
    },
    status: {
      PENDING_REVIEW: {
        label: "確認中",
        desc: "登録が完了し、警備員が確認しています。このページは自動的に更新されます。",
      },
      PENDING_CONFIRM: {
        label: "確認待ち",
        desc: "警備員が訪問先に確認を取っています。お待ちください。",
      },
      APPROVED: {
        label: "承認済み",
        desc: "訪問が承認されました。警備が来訪者カードを発行します。",
      },
      CARD_ISSUED: {
        label: "カード発行済み",
        desc: "カードが発行されました。下のバーコードを警備の受付で提示してチェックインしてください。",
      },
      CHECKED_IN: {
        label: "訪問中",
        desc: "退出時のチェックアウト用に来訪者カードを保管してください。",
      },
      REJECTED: {
        label: "却下",
        desc: "申し訳ございませんが、訪問を承認できませんでした。面会先または受付にお問い合わせください。",
      },
      CHECKED_OUT: {
        label: "完了",
        desc: "訪問が完了しました。ご来訪ありがとうございました。",
      },
      EXPIRED: {
        label: "期限切れ",
        desc: "この訪問登録は期限切れです。再度登録してください。",
      },
    },
  },
};

const DICTS: Record<Locale, Dict> = { id, en, ja };

export function getDict(locale: Locale): Dict {
  return DICTS[locale] ?? id;
}
