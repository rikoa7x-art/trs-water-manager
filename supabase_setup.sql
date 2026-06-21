-- ============================================================
-- TRS Water Manager — Supabase Database Setup
-- Cara menjalankan:
--   1. Buka https://supabase.com/dashboard
--   2. Pilih project Anda
--   3. Klik "SQL Editor" di sidebar kiri
--   4. Paste seluruh isi file ini, lalu klik "Run"
-- ============================================================

-- ===== MASTER DATA =====
CREATE TABLE IF NOT EXISTS produk (
  id text PRIMARY KEY,
  nama text NOT NULL,
  satuan text,
  harga_jual bigint DEFAULT 0,
  harga_beli bigint DEFAULT 0,
  stok_minimal int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pelanggan (
  id text PRIMARY KEY,
  nama text NOT NULL,
  alamat text,
  telepon text,
  tipe text,
  limit_kredit bigint DEFAULT 0
);

CREATE TABLE IF NOT EXISTS supplier (
  id text PRIMARY KEY,
  nama text NOT NULL,
  alamat text,
  telepon text,
  kontak text
);

CREATE TABLE IF NOT EXISTS kendaraan (
  id text PRIMARY KEY,
  nomor_plat text,
  jenis text,
  driver text,
  area text,
  status text
);

CREATE TABLE IF NOT EXISTS sales (
  id text PRIMARY KEY,
  nama text NOT NULL,
  area text,
  telepon text,
  target_bulanan bigint DEFAULT 0
);

-- ===== STOK =====
CREATE TABLE IF NOT EXISTS stok (
  produk_id text PRIMARY KEY,
  jumlah int DEFAULT 0
);

-- ===== LAPORAN HARIAN =====
CREATE TABLE IF NOT EXISTS penjualan_harian (
  id text PRIMARY KEY,
  tanggal date NOT NULL,
  catatan text,
  items jsonb DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS mutasi_gudang (
  id text PRIMARY KEY,
  tanggal date NOT NULL,
  items jsonb DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS kas_harian (
  id text PRIMARY KEY,
  tanggal date NOT NULL,
  saldo_awal bigint DEFAULT 0,
  penerimaan_tunai bigint DEFAULT 0,
  penerimaan_piutang bigint DEFAULT 0,
  pengeluaran bigint DEFAULT 0,
  setoran_bank bigint DEFAULT 0,
  catatan text
);

CREATE TABLE IF NOT EXISTS pengiriman_harian (
  id text PRIMARY KEY,
  tanggal date NOT NULL,
  items jsonb DEFAULT '[]'
);

-- ===== LAPORAN BULANAN =====
CREATE TABLE IF NOT EXISTS laba_rugi (
  id text PRIMARY KEY,
  bulan text NOT NULL,
  penjualan_bersih bigint DEFAULT 0,
  hpp bigint DEFAULT 0,
  biaya_operasional bigint DEFAULT 0,
  biaya_penyusutan bigint DEFAULT 0,
  catatan text
);

CREATE TABLE IF NOT EXISTS stock_opname (
  id text PRIMARY KEY,
  bulan text NOT NULL,
  items jsonb DEFAULT '[]',
  catatan text
);

CREATE TABLE IF NOT EXISTS piutang (
  id text PRIMARY KEY,
  bulan text,
  pelanggan_id text,
  usia_0_30 bigint DEFAULT 0,
  usia_31_60 bigint DEFAULT 0,
  usia_gt60 bigint DEFAULT 0,
  total bigint DEFAULT 0,
  catatan text
);

CREATE TABLE IF NOT EXISTS hutang (
  id text PRIMARY KEY,
  bulan text,
  supplier_id text,
  total bigint DEFAULT 0,
  jatuh_tempo date,
  status text,
  catatan text
);

CREATE TABLE IF NOT EXISTS pembelian (
  id text PRIMARY KEY,
  bulan text,
  supplier_id text,
  items jsonb DEFAULT '[]',
  catatan text,
  total bigint DEFAULT 0
);

CREATE TABLE IF NOT EXISTS kinerja_sales (
  id text PRIMARY KEY,
  bulan text NOT NULL,
  sales_id text,
  target bigint DEFAULT 0,
  realisasi bigint DEFAULT 0,
  catatan text
);

CREATE TABLE IF NOT EXISTS biaya_operasional (
  id text PRIMARY KEY,
  bulan text NOT NULL,
  kategori text,
  total bigint DEFAULT 0,
  catatan text
);

-- ===== NONAKTIFKAN ROW LEVEL SECURITY =====
-- (Aplikasi internal satu perusahaan, tidak perlu RLS)
ALTER TABLE produk             DISABLE ROW LEVEL SECURITY;
ALTER TABLE pelanggan          DISABLE ROW LEVEL SECURITY;
ALTER TABLE supplier           DISABLE ROW LEVEL SECURITY;
ALTER TABLE kendaraan          DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales              DISABLE ROW LEVEL SECURITY;
ALTER TABLE stok               DISABLE ROW LEVEL SECURITY;
ALTER TABLE penjualan_harian   DISABLE ROW LEVEL SECURITY;
ALTER TABLE mutasi_gudang      DISABLE ROW LEVEL SECURITY;
ALTER TABLE kas_harian         DISABLE ROW LEVEL SECURITY;
ALTER TABLE pengiriman_harian  DISABLE ROW LEVEL SECURITY;
ALTER TABLE laba_rugi          DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_opname       DISABLE ROW LEVEL SECURITY;
ALTER TABLE piutang            DISABLE ROW LEVEL SECURITY;
ALTER TABLE hutang             DISABLE ROW LEVEL SECURITY;
ALTER TABLE pembelian          DISABLE ROW LEVEL SECURITY;
ALTER TABLE kinerja_sales      DISABLE ROW LEVEL SECURITY;
ALTER TABLE biaya_operasional  DISABLE ROW LEVEL SECURITY;
