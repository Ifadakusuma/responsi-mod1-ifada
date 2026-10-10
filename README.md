# Responsi Mod 1 - API Peminjaman Buku Perpustakaan

REST API sederhana untuk mencatat peminjaman buku perpustakaan oleh anggota.
Dibangun dengan Node.js, Express.js, dan Supabase (PostgreSQL), lalu di-deploy ke Vercel.

**Link deployment:** GANTI_DENGAN_BASE_URL_VERCEL

## Deskripsi & Tujuan Proyek

Proyek ini dibuat untuk memenuhi tugas Responsi Modul 1 (Application Programming Interface).
Tujuannya membangun layanan backend yang mencatat data anggota, data buku, dan transaksi
peminjaman buku, sehingga petugas perpustakaan dapat menambah, melihat, mengubah, dan
menghapus data peminjaman, serta menyaring peminjaman berdasarkan status (misalnya yang
terlambat).

### Fitur Utama
- Operasi CRUD (Create, Read, Update, Delete) untuk anggota, buku, dan peminjaman.
- Filter query, misalnya `GET /loans?status=Terlambat`.
- Validasi input dan pesan error yang konsisten (400, 404, 500).
- Status keterlambatan ditentukan otomatis berdasarkan tanggal jatuh tempo.

### Tech Stack
- Node.js & Express.js
- Supabase (PostgreSQL)
- Vercel (deployment)

## Struktur Data

Terdapat tiga tabel. Tabel `loans` menghubungkan anggota dengan buku yang dipinjam.

```
members (1) ----< loans >---- (1) books
```

### members
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | Primary key (dibuat otomatis) |
| name | text | Nama anggota (wajib) |
| email | text | Email, unik |
| phone | text | Nomor telepon |

### books
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | Primary key (dibuat otomatis) |
| title | text | Judul buku (wajib) |
| author | text | Penulis |
| isbn | text | ISBN, unik |

### loans
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | Primary key (dibuat otomatis) |
| member_id | uuid | Foreign key ke `members.id` (wajib) |
| book_id | uuid | Foreign key ke `books.id` (wajib) |
| loan_date | date | Tanggal pinjam (default: hari ini) |
| due_date | date | Batas pengembalian (wajib) |
| return_date | date | Tanggal dikembalikan (kosong jika belum) |
| status | text | `Dipinjam`, `Dikembalikan`, atau `Terlambat` |

### SQL Schema

```sql
create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  phone text
);

create table books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  isbn text unique
);

create table loans (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  book_id uuid not null references books(id) on delete cascade,
  loan_date date not null default current_date,
  due_date date not null,
  return_date date,
  status text not null default 'Dipinjam'
    check (status in ('Dipinjam', 'Dikembalikan', 'Terlambat'))
);
```

### Aturan Status Peminjaman
- Status dapat diisi manual lewat `POST` atau `PUT`.
- Jika status tidak dikirim saat `POST`: menjadi `Dikembalikan` bila `return_date` terisi,
  `Terlambat` bila `due_date` sudah lewat, selain itu `Dipinjam`.
- Saat data peminjaman dibaca (`GET /loans`), peminjaman berstatus `Dipinjam` yang melewati
  `due_date` dan belum dikembalikan otomatis berubah menjadi `Terlambat`.
- Jika `return_date` diisi lewat `PUT` tanpa mengirim status, status menjadi `Dikembalikan`.

## Daftar Endpoint

| Method | Endpoint | Deskripsi | Filter query |
|---|---|---|---|
| GET | `/members` | Semua anggota | `name` |
| GET | `/members/:id` | Detail anggota | - |
| POST | `/members` | Tambah anggota | - |
| PUT | `/members/:id` | Ubah anggota | - |
| DELETE | `/members/:id` | Hapus anggota | - |
| GET | `/books` | Semua buku | `title`, `author` |
| GET | `/books/:id` | Detail buku | - |
| POST | `/books` | Tambah buku | - |
| PUT | `/books/:id` | Ubah buku | - |
| DELETE | `/books/:id` | Hapus buku | - |
| GET | `/loans` | Semua peminjaman | `status`, `member_id`, `book_id` |
| GET | `/loans/:id` | Detail peminjaman | - |
| POST | `/loans` | Tambah peminjaman | - |
| PUT | `/loans/:id` | Ubah peminjaman | - |
| DELETE | `/loans/:id` | Hapus peminjaman | - |

Filter dapat digabung, contoh: `/loans?status=Terlambat&member_id=<uuid>`.
Pencarian `name`, `title`, dan `author` tidak peka huruf besar-kecil dan cocok sebagian kata.

## Contoh Request & Response

Semua contoh memakai `BASE_URL` (lokal: `http://localhost:3000`, atau Base URL Vercel).

### GET /members
Response `200 OK`:
```json
[
  {
    "id": "56342496-c493-41bd-9603-915bfb5e18fc",
    "name": "Budi Santoso",
    "email": "budi@email.com",
    "phone": "08123456789"
  },
  {
    "id": "a3a3481f-6987-47a8-8acd-1878b8216ce5",
    "name": "Siti Aminah",
    "email": "siti@email.com",
    "phone": "08129876543"
  }
]
```

### POST /members
Request body:
```json
{
  "name": "Kusuma",
  "email": "kusum@email.com",
  "phone": "0811111111"
}
```
Response `201 Created`:
```json
{
  "id": "2e4063ca-6bd6-4dc8-97e9-94cb0114c075",
  "name": "Kusuma",
  "email": "kusum@email.com",
  "phone": "0811111111"
}
```

### DELETE /members/:id
Response `200 OK`:
```json
{
  "message": "Member deleted successfully"
}
```

### GET /loans?status=Terlambat
Menampilkan hanya peminjaman berstatus `Terlambat`.

Response `200 OK`:
```json
[
  {
    "id": "8e3e1573-c7e1-4371-9dfa-65d5eddd8515",
    "loan_date": "2026-09-20",
    "due_date": "2026-09-27",
    "return_date": null,
    "status": "Terlambat",
    "members": {
      "id": "56342496-c493-41bd-9603-915bfb5e18fc",
      "name": "Budi Santoso",
      "email": "budi@email.com"
    },
    "books": {
      "id": "03554fd2-42eb-4747-be74-fd3ca1655729",
      "title": "Pemrograman Web dengan Node.js",
      "author": "Andi Wijaya"
    }
  }
]
```

### POST /loans
Request body:
```json
{
  "member_id": "2e4063ca-6bd6-4dc8-97e9-94cb0114c075",
  "book_id": "923ea014-fa87-4e5b-8c4c-5d47057a2866",
  "due_date": "2026-10-30"
}
```
Response `201 Created`:
```json
{
  "id": "0187b871-a1d5-41e4-ade9-4adcd7241090",
  "loan_date": "2026-10-10",
  "due_date": "2026-10-30",
  "return_date": null,
  "status": "Dipinjam",
  "members": {
    "id": "2e4063ca-6bd6-4dc8-97e9-94cb0114c075",
    "name": "Kusuma",
    "email": "kusum@email.com"
  },
  "books": {
    "id": "923ea014-fa87-4e5b-8c4c-5d47057a2866",
    "title": "Dasar Basis Data",
    "author": "Rina Putri"
  }
}
```

### PUT /loans/:id (pengembalian buku)
Request body:
```json
{
  "return_date": "2026-10-10"
}
```
Response `200 OK` (status otomatis menjadi `Dikembalikan`):
```json
{
  "id": "0187b871-a1d5-41e4-ade9-4adcd7241090",
  "loan_date": "2026-10-10",
  "due_date": "2026-10-30",
  "return_date": "2026-10-10",
  "status": "Dikembalikan",
  "members": {
    "id": "2e4063ca-6bd6-4dc8-97e9-94cb0114c075",
    "name": "Kusuma",
    "email": "kusum@email.com"
  },
  "books": {
    "id": "923ea014-fa87-4e5b-8c4c-5d47057a2866",
    "title": "Dasar Basis Data",
    "author": "Rina Putri"
  }
}
```

### DELETE /loans/:id
Response `200 OK`:
```json
{
  "message": "Loan deleted successfully"
}
```

### Contoh Error

`POST /loans` dengan body tidak lengkap, response `400 Bad Request`:
```json
{
  "error": "member_id, book_id, dan due_date wajib diisi"
}
```

`GET /loans?status=Salah`, response `400 Bad Request`:
```json
{
  "error": "Status harus salah satu dari: Dipinjam, Dikembalikan, Terlambat"
}
```

`GET /members/11111111-1111-1111-1111-111111111111` (ID tidak ada), response `404 Not Found`:
```json
{
  "error": "Data tidak ditemukan"
}
```

## Panduan Instalasi & Menjalankan Lokal

### Prasyarat
- Node.js (versi LTS) dan npm
- Akun [Supabase](https://supabase.com)

### Langkah-langkah

1. Clone repository dan masuk ke foldernya:
```bash
   git clone https://github.com/ifadakusuma/responsi-mod1-ifada.git
   cd responsi-mod1-ifada
```

2. Install dependency:
```bash
   npm install
```

3. Siapkan database di Supabase:
   - Buat project baru di Supabase.
   - Buka **SQL Editor**, lalu jalankan SQL schema pada bagian [Struktur Data](#struktur-data).
   - Pastikan Row Level Security (RLS) pada ketiga tabel nonaktif (tabel berlabel *UNRESTRICTED*).
   - (Opsional) Isi data contoh lewat **Table Editor** atau perintah `insert` di SQL Editor.

4. Buat file `.env` di folder utama (salin dari `.env.example`) dan isi:
```
   SUPABASE_URL=https://xxxxxxxx.supabase.co
   SUPABASE_KEY=isi_dengan_anon_atau_publishable_key
   PORT=3001
```
   `SUPABASE_URL` dan `SUPABASE_KEY` diambil dari **Connect** atau **Project Settings → API Keys** di dashboard Supabase.

5. Jalankan server:
```bash
   npm run dev
```
   API berjalan di `http://localhost:3001`. Cek dengan membuka `http://localhost:3001/`.

### Struktur Proyek
```
src/
├── config/        # koneksi Supabase
├── controllers/   # logika dan validasi request
├── models/        # query ke database
├── routes/        # definisi endpoint
├── utils/         # helper tanggal dan error
└── index.js       # entry point
```

## Deployment

API di-deploy di Vercel dan dapat diakses publik pada:

**Base URL:** GANTI_DENGAN_BASE_URL_VERCEL


Environment variable `SUPABASE_URL` dan `SUPABASE_KEY` diatur lewat pengaturan project di Vercel.