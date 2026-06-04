# Namu — Visitor Management System (VMS)

> Log project & living documentation. Setiap perubahan, keputusan, dan inisiatif dicatat di sini.
> Dikelola oleh: Claude (Project Manager & Developer) untuk **PT Glico Manufacturing Indonesia**.

---

## 1. Ringkasan Project

**Namu** adalah Visitor Management System internal PT Glico Manufacturing Indonesia.
Sistem berjalan **di jaringan internal (intranet), tidak terekspos ke publik**.

Tujuan: mengelola siklus hidup kunjungan tamu — **penerimaan, pengecekan, monitoring,
konfirmasi/approval, dan checkout** — secara digital, rapi, dan terpantau real-time.

### Karakteristik kunci
- **Self-registration di perangkat tamu sendiri** (HP/tablet) melalui scan QR/barcode.
  Tidak ada instalasi aplikasi — cukup buka browser dari hasil scan.
- Berjalan **on-premise / internal network**.
- Mobile-first untuk sisi tamu; desktop dashboard untuk security/host/admin.

---

## 2. Peran Pengguna (Roles)

| Role | Deskripsi | Akses utama |
|------|-----------|-------------|
| **Tamu (Visitor)** | Pengunjung yang datang. Mengisi data sendiri via HP. | Form registrasi, badge digital, status kunjungan |
| **Host (Karyawan)** | Karyawan yang dikunjungi. | Terima notifikasi, approve/reject tamu, lihat tamunya |
| **Security / Resepsionis** | Penjaga lobby / front desk. | Monitoring real-time, verifikasi, check-in/checkout, cetak badge |
| **Admin** | Pengelola sistem. | Kelola user, departemen, master data, laporan, setting |

---

## 3. Alur Bisnis (Visitor Lifecycle)

```
[Tamu datang di lobby]
        │  scan QR poster (atau QR pre-registration dari host)
        ▼
[Buka Namu di browser HP tamu]
        │  isi form: nama, perusahaan, no.HP, ID, tujuan, host yang dituju, foto
        ▼
[Status: PENDING] ──► Notifikasi ke Host
        │
        ▼
[Host konfirmasi: APPROVE / REJECT]
        │ approve
        ▼
[Badge digital + QR diterbitkan]  ──► Security verifikasi & cetak badge (opsional)
        │
        ▼
[Status: CHECKED_IN] ──► tampil di Dashboard Monitoring real-time (tamu di dalam gedung)
        │
        ▼
[Tamu pulang → scan QR / security checkout]
        ▼
[Status: CHECKED_OUT] ──► hilang dari daftar "sedang di dalam"
```

Status kunjungan: `PENDING` → `APPROVED` → `CHECKED_IN` → `CHECKED_OUT`
(+ `REJECTED`, `EXPIRED` untuk kasus khusus)

---

## 4. Fitur MVP (versi pertama)

Dikonfirmasi user — keempatnya WAJIB:
- [x] **Self-registration tamu via QR** (mobile web di perangkat tamu) — M2
- [x] **Approval / konfirmasi tamu** (via Dashboard Super Admin) — host khusus menyusul
- [x] **Badge / kartu tamu + QR code** (digital, muncul saat approved) — M2
- [ ] **Notifikasi ke host** — in-app (record) sudah dibuat; WhatsApp belum
- [x] **Dashboard monitoring** (statistik + daftar) — versi real-time (auto-refresh) di M5
- [x] **Checkout tamu** (aksi check-out di dashboard) — scan QR di M4

### Backlog (post-MVP, belum dikerjakan)
- Pre-registration oleh host + kirim QR ke tamu sebelum datang
- Cetak badge fisik (printer label)
- Integrasi WhatsApp / email gateway internal untuk notifikasi
- Laporan & ekspor (PDF/Excel), audit log
- Foto tamu via kamera HP, capture KTP
- Multi-lokasi / multi-gedung
- Blacklist / watchlist tamu
- Kiosk mode untuk tablet di lobby

---

## 5. Tech Stack (KEPUTUSAN)

| Layer | Pilihan | Alasan |
|-------|---------|--------|
| Framework | **Next.js (App Router) + TypeScript** | Satu codebase FE+BE, mobile-responsive sempurna untuk scan-QR-di-HP-tamu, mudah deploy Node di server internal |
| Database | **PostgreSQL** | Relasional, andal, cocok untuk data kunjungan & relasi host/tamu |
| ORM | **Prisma** | Type-safe, migrasi rapi |
| Styling/UI | **Tailwind CSS + shadcn/ui** | Cepat, konsisten, mobile-first |
| Auth (staff) | **Auth.js (NextAuth) / credentials** | Login security/host/admin (tamu tidak perlu login) |
| Real-time | **SSE / polling** (evaluasi lanjut) | Dashboard "tamu di dalam" update otomatis |
| QR | **qrcode (generate) + html5-qrcode (scan)** | Badge & check-in/out |
| Database (DEV) | **SQLite** (Prisma) | Mulai cepat di lokal; migrasi ke PostgreSQL saat deploy |
| Database (PROD) | **PostgreSQL** (rencana) | Saat deploy ke server internal |
| Notifikasi | **WhatsApp (adapter) + in-app fallback** | Lihat catatan WA di bawah |
| Badge | **Digital di HP tamu** (QR di layar) | Tanpa printer; cetak fisik = backlog |
| Deploy | **Node.js on-premise** (server internal) | Sesuai syarat intranet-only |

> Stack ditentukan oleh Claude atas mandat user ("kamu yang lebih tahu, tentukan yang cocok").

### Keputusan terkonfirmasi (2026-06-04)
- **Kanal notifikasi host: WhatsApp.** Implementasi sebagai *adapter notifikasi* (interface
  yang bisa diganti gateway: Fonnte/Twilio/WA Business API). Untuk dev = mode log/stub.
  - ⚠️ **Caveat intranet**: WA butuh akses internet keluar ke gateway. Jika server Namu
    benar-benar terisolasi dari internet, perlu: (a) whitelist outbound ke endpoint gateway,
    atau (b) gateway WA on-prem. **In-app notification tetap dibuat sebagai fallback** yang
    pasti jalan tanpa internet (antrian approval & lonceng notifikasi di dashboard).
  - Host perlu menyimpan **nomor WhatsApp** di profil User.
- **Badge: digital di HP tamu.** Tamu tunjukkan QR di layar. Cetak fisik = backlog.
- **Database dev: SQLite.** Migrasi ke PostgreSQL saat deploy. Schema Prisma dijaga agar
  portable (hindari fitur yang khusus SQLite/Postgres saja).

---

## 6. Arsitektur & Struktur (rencana)

```
namu/
├── app/                    # Next.js App Router
│   ├── (visitor)/          # halaman publik-internal untuk tamu (no auth)
│   │   ├── register/       # form self-registration
│   │   └── badge/[id]/     # badge digital + QR
│   ├── (staff)/            # area login: host/security/admin
│   │   ├── dashboard/      # monitoring real-time
│   │   ├── approvals/      # antrian konfirmasi host
│   │   └── admin/          # master data, user, laporan
│   └── api/                # API routes
├── prisma/
│   └── schema.prisma       # data model
├── components/             # UI components (shadcn)
├── lib/                    # util, db client, auth
└── CLAUDE.md               # log project (file ini)
```

### Data Model (draft awal)
- **User** (staff): id, name, **username** unique (login pakai username, bukan email),
  passwordHash, role, **waNumber** (untuk notif WA), departmentId
- **Department**: id, name
- **Visitor**: id, fullName, company, phone, idNumber, photoUrl
- **Visit**: id, visitorId, **hostId (opsional)**, **visitType** (GENERAL|LOADING),
  **loadingType** (LOADING|UNLOADING, utk loading), **vehiclePlate**, **docNumber**,
  purpose, status, qrToken, checkInAt, checkOutAt, approvedAt, createdAt
  - **2 jenis kunjungan**: `GENERAL` (tamu umum: meeting/audit/kunjungan — pilih host) &
    `LOADING` (sopir muat/bongkar barang — tanpa host, pilih aktivitas Loading/Unloading)
- **Notification**: id, userId, visitId, channel (`IN_APP`|`WA`), type, message, status, readAt, createdAt

---

## 7. Roadmap / Milestone

- **M0 — Setup** (saat ini): inisialisasi project, CLAUDE.md, keputusan stack.
- **M1 — Fondasi** ✅ (2026-06-04): scaffold Next.js, Prisma schema, koneksi DB (adapter),
  seed data, landing page. Auth staff menyusul di M3.
- **M2 — Registrasi tamu** ✅ (2026-06-04): form self-register, simpan Visit PENDING,
  halaman status + badge QR, notifikasi in-app ke host.
- **M3 — Auth staff + Approval + Notifikasi**: 🟡 sebagian (2026-06-04):
  ✅ auth staff (login/session), ✅ Dashboard Super Admin (approval, kelola kunjungan,
  user, departemen). ⬜ Tersisa: notifikasi WhatsApp + area khusus host/security.
- **M4 — Badge & check-in/out**: generate QR badge, scan check-in/checkout.
- **M5 — Dashboard real-time**: monitoring tamu di dalam gedung.
- **M6 — Polish & deploy internal**: hardening, seed data, panduan deploy on-prem.

---

## 7b. Cara Menjalankan (Development)

> ⚠️ **Network corporate**: jalankan perintah Prisma/npm yang mengakses internet dengan
> `NODE_OPTIONS=--use-system-ca` agar Node memakai certificate store Windows (mengatasi
> error TLS "unable to verify the first certificate" akibat proxy/SSL-inspection).

```bash
npm install                 # install dependencies
npm run db:migrate          # buat/terapkan migrasi (butuh --use-system-ca pertama kali)
npm run db:seed             # isi data contoh
npm run dev                 # jalankan dev server (http://localhost:3000)
npm run build               # production build + typecheck
npm run db:studio           # GUI lihat data (Prisma Studio)
```

**Akun contoh** (password semua: `password123`):
Username: `admin` (ADMIN) · `security` (SECURITY) · `andi` (HOST) — **login pakai username**.

### Catatan teknis penting
- **Prisma 7.8** — perbedaan dari Prisma 6: (a) `url` TIDAK lagi di `schema.prisma`,
  melainkan di `prisma.config.ts` (untuk migrate) dan via **driver adapter** (runtime);
  (b) generator baru `prisma-client` (ESM) output ke `generated/prisma/` (di-gitignore);
  (c) runtime memakai `@prisma/adapter-better-sqlite3` — lihat `lib/db.ts`.
- **SQLite tanpa enum** → role/status/channel = String; nilai valid di `lib/constants.ts`.
- **Tanpa next/font/google** — pakai font system agar tidak bergantung internet (intranet).
- Saat **pindah ke PostgreSQL**: ubah `provider` di datasource, ganti adapter ke
  `@prisma/adapter-pg`, sesuaikan `DATABASE_URL`. Schema sudah dijaga portable.

## 8. Aturan Kerja Project

1. **Semua perubahan, keputusan, inisiatif dicatat di CLAUDE.md** (Changelog di bawah).
2. **TIDAK push apa pun ke GitHub sebelum user konfirmasi/perintah.**
   Repo: https://github.com/mamanR77/NamuProject (branch `main`).
3. Bahasa komunikasi & dokumentasi: Indonesia.
4. **Bahasa Indonesia = bahasa utama (main).** Halaman tamu dikerjakan & difinalkan versi
   Indonesia dulu; terjemahan EN/JA menyusul **setelah versi Indonesia disetujui user**.

---

## 9. Changelog

### 2026-06-05 (lanjutan) — Tanda tangan digital penerima tamu (sign-off selesai)
- **Permintaan user**: pengganti tanda tangan di form kertas. Penerima tamu **tanda tangan
  digital di HP tamu** sebagai bukti kunjungan selesai; **Check-out dikunci** sampai ada TTD.
- **Schema**: `Visit` + `signedAt`, `signedName`, `signatureData` (PNG data URL). Migrasi
  `add_signature`.
- **Halaman status tamu** (`/visit/[token]`) saat `CHECKED_IN`: tampil **SignaturePad**
  (canvas, tanpa library) + input nama penerima. Setelah TTD → tampil konfirmasi
  "Kunjungan Dikonfirmasi Selesai" + gambar TTD + nama. Server action `submitSignatureAction`
  (validasi, hanya saat CHECKED_IN). Kamus `visit.sign` (ID/EN/JA).
- **Security**: tombol **Check-out DIKUNCI** sampai `signedAt` ada — sebelum TTD tampil
  "Menunggu TTD penerima tamu"; sesudah tampil "✔ TTD: <nama>" + Check-out. Penguncian juga
  dijaga di server (`checkOutAction` menolak bila belum ada TTD).
- **Verifikasi**: build/typecheck lolos; smoke test — pad muncul saat CHECKED_IN, Security
  terkunci sebelum TTD, setelah TTD halaman tamu konfirmasi & Check-out aktif.
- Commit lokal (belum push).

### 2026-06-05 — Modul Security + alur kunjungan bertahap
- **Permintaan user**: alur Kunjungan Umum = tamu daftar → **review Security** → Security
  **konfirmasi manual** ke karyawan (umum) / **Warehouse** (loading) → tandai diterima →
  **Security check-in + input Nomor Kartu Tamu** → check-out. Maka dibuat **Modul Security**.
- **Status baru** (`lib/constants.ts`): `PENDING_REVIEW` → `PENDING_CONFIRM` → `APPROVED`
  → `CHECKED_IN` → `CHECKED_OUT` (+ `REJECTED`). Mengganti status lama `PENDING`.
  Tambah `VISIT_STATUS_LABEL` (ID) untuk panel internal.
- **Schema**: `Visit` + `cardNo` (Nomor Kartu Tamu) + `reviewedAt`. Migrasi `add_card_review`.
  DB dev dibersihkan & reseed (status awal `PENDING_REVIEW`).
- **Modul Security** (`app/security/`): guard role SECURITY/ADMIN, layout + logout,
  halaman **Antrian Kunjungan** dengan filter + tombol per tahap: **Review OK / Tolak**,
  **Tandai Diterima / Tolak**, **Check-in (+ input No. Kartu Tamu)**, **Check-out**.
  Server actions di `app/security/actions.ts`. Loading dikonfirmasi ke "Warehouse".
- **Login by role**: SECURITY → `/security`, ADMIN → `/admin` (+ `/staff` redirect).
- **Admin**: aksi lifecycle lama dipindah ke Security; `/admin/visits` jadi overview
  (status baru + filter + link "Antrian Security"); nav admin + link Security; statistik
  "Menunggu" = PENDING_REVIEW + PENDING_CONFIRM. `StatusBadge` diperbarui.
- **Halaman status tamu** + kamus i18n (ID/EN/JA) diperbarui untuk status baru.
- **Registrasi** (umum & loading) kini set status awal `PENDING_REVIEW` (notifikasi host
  in-app dihapus — konfirmasi manual oleh Security).
- **Verifikasi**: build/typecheck lolos; smoke test — security queue tampil tombol per tahap,
  guard /security (tanpa login → login), admin boleh akses /security, status tamu "Menunggu Review".
- ⚠️ Catatan: **versi internal (Security/Admin) Bahasa Indonesia** (sesuai aturan: ID dulu).
  Commit lokal (belum push).

### 2026-06-04 (lanjutan) — Multi-bahasa (i18n) halaman tamu
- **Permintaan user**: pemilih bahasa di halaman depan, 3 bahasa: **Indonesia / English / 日本語**.
  Cakupan = **halaman tamu saja** (dashboard staff/admin tetap Indonesia). Switcher = dropdown bendera.
- **Implementasi i18n ringan** (tanpa library): `lib/i18n.ts` (kamus ID/EN/JA + `getDict`),
  `lib/locale.ts` (baca cookie `namu_lang` di server), `components/language-switcher.tsx`
  (dropdown bendera di pojok atas, set cookie + `router.refresh()`).
- Diterjemahkan: **halaman utama**, **form Kunjungan Umum** (+ pesan error via locale),
  **form Loading/Unloading** (+ error), **halaman status/badge `/visit/[token]`** (label, deskripsi
  status, detail). Opsi "Tujuan Kedatangan" tetap istilah kanonik (Meeting, Audit, dst) di semua bahasa.
- **Verifikasi**: build/typecheck lolos; smoke test ketiga bahasa di landing, /register, /loading,
  /visit/[token] — semua string ter-translate sesuai cookie. Commit lokal (belum push).

### 2026-06-04 (lanjutan) — 2 Jenis Kunjungan: Tamu & Loading/Unloading
- **Permintaan user**: ada 2 jenis tamu — (1) **Tamu umum** (meeting/audit/kunjungan) &
  (2) **Loading/Unloading** (sopir/barang ke loading area). Halaman utama jadi 2 pilihan.
- **Schema**: `Visit` + `visitType`, `loadingType`, `vehiclePlate`, `docNumber`; `hostId`/`host`
  dibuat **opsional** (loading tak perlu host). Migrasi `add_visit_type_loading` (aditif,
  tanpa wipe data). Konstanta `VISIT_TYPE` & `LOADING_TYPE` di `lib/constants.ts`.
- **Halaman utama** (`app/page.tsx`): 2 kartu pilihan — **Tamu** → `/register`,
  **Loading/Unloading** → `/loading`.
- **Route baru `/loading`**: form (aktivitas Loading/Unloading via radio, nama sopir,
  ekspedisi, No. HP, No. polisi, No. PO/DO/Surat Jalan) + server action `registerLoadingAction`
  (buat Visit type LOADING tanpa host, status PENDING).
- **`/visit/[token]`**: handle loading (host null aman) — tampil aktivitas, ekspedisi,
  no. polisi, no. dokumen.
- **Dashboard admin** (overview + kunjungan): tambah `TypeBadge` (Tamu / Loading / Unloading),
  guard host null, tampil info kendaraan utk loading.
- **Verifikasi**: build/typecheck lolos; smoke test — `/` 2 pilihan, `/loading` form lengkap,
  visit loading render di status page & dashboard (HTTP 200). Contoh record loading "Joko Sopir"
  dibiarkan di DB dev sbg demo.
- Commit lokal (belum push).

### 2026-06-04 (lanjutan) — Halaman utama khusus Tamu
- **Permintaan user**: halaman utama (`/`) langsung fokus **Tamu** saja; modul Staff/Security
  dipisah. Perubahan `app/page.tsx`:
  - Hapus kartu "Saya Tamu" vs "Staff / Security". Ganti jadi halaman **sambutan** + tombol
    besar **"Daftar Kunjungan"** → `/register`.
  - Akses staff jadi **link kecil/samar "Login Staff"** di pojok bawah → `/staff/login`
    (modul terpisah, tidak menonjol di halaman tamu).
  - Smoke test: `/` HTTP 200, menampilkan sambutan + Daftar Kunjungan + Login Staff; kartu
    staff lama hilang. Commit lokal (belum push).

### 2026-06-04
- Project diinisialisasi. Konteks & kebutuhan dikumpulkan dari user.
- Ditetapkan: peran pengguna, alur bisnis, fitur MVP (4 fitur wajib + checkout).
- **Keputusan tech stack**: Next.js (App Router, TS) + PostgreSQL + Prisma + Tailwind/shadcn.
- Ditetapkan: alur tamu = self-registration via scan QR di perangkat tamu sendiri.
- Dibuat file `CLAUDE.md` sebagai living log project.
- **Keputusan terkonfirmasi**: notifikasi = **WhatsApp** (adapter + in-app fallback);
  badge = **digital di HP tamu**; database dev = **SQLite** (migrasi ke PostgreSQL saat deploy).
- Environment dicek: Node v24.16.0, npm 11.13.0, git 2.54.0 — siap untuk scaffolding.
- **M1 (Fondasi) SELESAI:**
  - Scaffold Next.js 16.2.7 (App Router, TS, Tailwind v4, ESLint, no-src-dir).
  - Setup Prisma **7.8** + SQLite via driver adapter (`@prisma/adapter-better-sqlite3`).
  - Schema 5 model: Department, User, Visitor, Visit, Notification (+ migrasi `init`).
  - `lib/db.ts` (singleton client) & `lib/constants.ts` (role/status/channel + brand).
  - Seed data: 5 departemen, 3 user (admin/security/host), 1 tamu+visit contoh.
  - Landing page Namu (pintu masuk Tamu & Staff), font system, metadata.
  - Script npm: `db:migrate`, `db:seed`, `db:studio`, `db:reset`, `db:generate`.
  - `.gitignore` diperbarui (generated/, *.db). Build & typecheck **lolos bersih**.
  - **Temuan**: network corporate butuh `NODE_OPTIONS=--use-system-ca` untuk Prisma.
- **Git repo lokal diinisialisasi** (branch `master`), commit M1 `62b0615`. **Belum di-push.**
  Ditambahkan `.env.example`. (Git config lokal: user "Namu Dev".)
- **M2 (Registrasi Tamu) SELESAI:**
  - `lib/qr.ts` — generate badge QR sebagai data URL (pakai paket `qrcode`).
  - `app/register/` — server action `registerVisitAction` (validasi, buat Visitor + Visit
    status PENDING, sekaligus buat Notification IN_APP ke host) + form mobile-first
    (client component `useActionState`) + halaman (ambil daftar host dari DB).
  - `app/visit/[token]/` — halaman status kunjungan dengan UI per-status (PENDING/APPROVED/
    REJECTED/CHECKED_IN/CHECKED_OUT/EXPIRED). Badge QR tampil saat APPROVED/CHECKED_IN.
    Komponen `AutoRefresh` (poll 5 dtk saat PENDING agar tamu lihat approval otomatis).
  - Alur: tamu isi form → redirect ke `/visit/[qrToken]` → tunggu approval.
  - **Verifikasi**: build + typecheck lolos; smoke test runtime (home, /register dengan
    daftar host dari DB, /visit/[token] status PENDING) semua HTTP 200 & render benar.
- Commit M2 lokal `fe148f4`. **Belum push.**
- **Dashboard Super Admin + Auth (atas permintaan user) SELESAI:**
  - **Auth staff** (`lib/auth.ts`): session cookie httpOnly + JWT via `jose` (paket baru
    ditambahkan), `bcryptjs` verify password, `getCurrentUser`, `requireAdmin`/`requireRole`.
    `SESSION_SECRET` di `.env` (+ `.env.example`). Role **ADMIN = Super Admin**.
  - **Login** `/staff/login` (+ `/staff` redirect cerdas). Akun: `admin` / `password123`.
  - **Area `/admin`** (guard ADMIN, layout sidebar + logout):
    - Dashboard: 4 kartu statistik (tamu hari ini, menunggu approval, sedang di dalam,
      total tamu) + daftar aktivitas terbaru.
    - **Kunjungan** `/admin/visits`: filter status + aksi lifecycle penuh
      (Setujui/Tolak/Check-in/Check-out) via server actions, link badge.
    - **Pengguna** `/admin/users`: daftar + tambah user (role/WA/departemen) + hapus.
    - **Departemen** `/admin/departments`: daftar + tambah.
  - Komponen `components/status-badge.tsx`, util `lib/format.ts`.
  - **Verifikasi**: build/typecheck lolos; smoke test runtime — tanpa login `/admin`→307
    ke login, dengan session admin valid keempat halaman admin→200 (query DB jalan).
  - ⚙️ Catatan dev: minting cookie uji pakai `node --import tsx` (bukan `npx tsx -e`),
    dan hati-hati `process.exit()` memotong flush stdout pada pipe.
- **Perubahan: login pakai USERNAME, bukan email** (permintaan user):
  - `User.email` → `User.username` (unique). Login `/staff/login` & buat user di admin
    sekarang pakai username (validasi: huruf kecil/angka/`. _ -`).
  - Seed diperbarui: username `admin` / `security` / `andi` (password tetap `password123`).
  - **Migrasi di-regenerate** (DB dev di-wipe & reseed; tidak ada data produksi). Migrasi
    lama dihapus, migrasi baru `20260604151329_init` dengan kolom `username`.
  - Build/typecheck lolos; smoke test: login page tampil "Username", sesi admin render @username.
- Status: **belum push** (menunggu konfirmasi user).
- **Berikutnya**: notifikasi WhatsApp (adapter) saat tamu daftar/approve; area host/security;
  lalu M4 (scan QR check-in/out) & M5 (dashboard monitoring real-time).
