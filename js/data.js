/**
 * AMDK Manager — Data Models & Storage
 * Semua data disimpan di localStorage
 */

const DB = {
  PREFIX: 'amdk_',

  get(key) {
    try {
      const val = localStorage.getItem(this.PREFIX + key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },

  set(key, value) {
    localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(this.PREFIX + key);
  }
};

/* =============================================
   DEFAULT / SEED DATA
   ============================================= */
const SEED = {
  produk: [
    { id: 'P1', nama: 'Galon 19L', satuan: 'Unit', harga_jual: 16000, harga_beli: 14000, stok_minimal: 50 },
    { id: 'P2', nama: 'Botol 600ml (1 dus)', satuan: 'Dus', harga_jual: 40000, harga_beli: 26000, stok_minimal: 30 },
    { id: 'P3', nama: 'Botol 330ml (1 dus)', satuan: 'Dus', harga_jual: 35000, harga_beli: 21000, stok_minimal: 20 },
    { id: 'P4', nama: 'Cup 200ml (1 dus)', satuan: 'Dus', harga_jual: 17000, harga_beli: 15000, stok_minimal: 40 }
  ],

  pelanggan: [
    { id: 'C1', nama: 'Toko Sumber Rejeki', alamat: 'Jl. Merdeka No. 12', telepon: '0812-3456-7890', tipe: 'Toko', limit_kredit: 10000000 },
    { id: 'C2', nama: 'Agen Jaya Makmur', alamat: 'Jl. Diponegoro No. 45', telepon: '0813-9876-5432', tipe: 'Agen', limit_kredit: 20000000 },
    { id: 'C3', nama: 'Warung Bu Siti', alamat: 'Jl. Pasar Lama No. 7', telepon: '0856-1122-3344', tipe: 'Warung', limit_kredit: 3000000 },
    { id: 'C4', nama: 'Minimarket Sejahtera', alamat: 'Jl. Sudirman No. 88', telepon: '0811-5544-3322', tipe: 'Minimarket', limit_kredit: 15000000 }
  ],

  supplier: [
    { id: 'S1', nama: 'Pabrik AMDK Tirta Sejahtera', alamat: 'Kawasan Industri Barat', telepon: '021-7654321', kontak: 'Pak Hendra' },
    { id: 'S2', nama: 'Pabrik AMDK Sumber Alam', alamat: 'Kawasan Industri Timur', telepon: '021-1234567', kontak: 'Bu Wati' }
  ],

  kendaraan: [
    { id: 'K1', nomor_plat: 'L300-001', jenis: 'L300', driver: 'Budi Santoso', area: 'Area Selatan', status: 'Aktif' },
    { id: 'K2', nomor_plat: 'PU-002', jenis: 'Pickup', driver: 'Andi Prasetyo', area: 'Area Utara', status: 'Aktif' }
  ],

  sales: [
    { id: 'SL1', nama: 'Budi Santoso', area: 'Area Selatan', telepon: '0812-0001-0001', target_bulanan: 60000000 },
    { id: 'SL2', nama: 'Andi Prasetyo', area: 'Area Utara', telepon: '0812-0002-0002', target_bulanan: 50000000 }
  ],

  // Stok awal
  stok: {
    P1: 350, P2: 120, P3: 90, P4: 200
  },

  // Laporan Harian — sample
  penjualan_harian: [
    {
      id: 'PH1', tanggal: today(-2), catatan: 'Normal',
      items: [
        { produk_id: 'P1', stok_awal: 350, terjual: 180, harga: 18000 },
        { produk_id: 'P2', stok_awal: 120, terjual: 75, harga: 32000 },
        { produk_id: 'P3', stok_awal: 90, terjual: 40, harga: 26000 },
        { produk_id: 'P4', stok_awal: 200, terjual: 110, harga: 19000 }
      ]
    },
    {
      id: 'PH2', tanggal: today(-1), catatan: 'Ada lonjakan pesanan dari Agen Jaya Makmur',
      items: [
        { produk_id: 'P1', stok_awal: 168, terjual: 200, harga: 18000 },
        { produk_id: 'P2', stok_awal: 245, terjual: 90, harga: 32000 },
        { produk_id: 'P3', stok_awal: 49, terjual: 30, harga: 26000 },
        { produk_id: 'P4', stok_awal: 240, terjual: 130, harga: 19000 }
      ]
    },
    {
      id: 'PH3', tanggal: today(0), catatan: '',
      items: [
        { produk_id: 'P1', stok_awal: 148, terjual: 150, harga: 18000 },
        { produk_id: 'P2', stok_awal: 200, terjual: 65, harga: 32000 },
        { produk_id: 'P3', stok_awal: 119, terjual: 35, harga: 26000 },
        { produk_id: 'P4', stok_awal: 160, terjual: 95, harga: 19000 }
      ]
    }
  ],

  mutasi_gudang: [
    {
      id: 'MG1', tanggal: today(-2),
      items: [
        { produk_id: 'P1', stok_awal: 350, masuk: 0, keluar: 180, retur: 2 },
        { produk_id: 'P2', stok_awal: 120, masuk: 200, keluar: 75, retur: 0 },
        { produk_id: 'P3', stok_awal: 90, masuk: 0, keluar: 40, retur: 1 },
        { produk_id: 'P4', stok_awal: 200, masuk: 150, keluar: 110, retur: 0 }
      ]
    }
  ],

  kas_harian: [
    {
      id: 'KH1', tanggal: today(-2),
      saldo_awal: 5000000, penerimaan_tunai: 6770000,
      penerimaan_piutang: 2500000, pengeluaran: 1200000,
      setoran_bank: 8000000, catatan: ''
    },
    {
      id: 'KH2', tanggal: today(-1),
      saldo_awal: 5070000, penerimaan_tunai: 8050000,
      penerimaan_piutang: 3000000, pengeluaran: 1500000,
      setoran_bank: 9000000, catatan: ''
    },
    {
      id: 'KH3', tanggal: today(0),
      saldo_awal: 5620000, penerimaan_tunai: 5865000,
      penerimaan_piutang: 1500000, pengeluaran: 980000,
      setoran_bank: 6000000, catatan: ''
    }
  ],

  pengiriman_harian: [
    {
      id: 'ARH1', tanggal: today(-2),
      items: [
        { kendaraan_id: 'K1', area: 'Area Selatan', jumlah_drop: 8, total_muatan: '150 galon', bbm: 150000, status: 'Selesai', catatan: '' },
        { kendaraan_id: 'K2', area: 'Area Utara', jumlah_drop: 6, total_muatan: '20 dus campur', bbm: 100000, status: 'Selesai', catatan: '' }
      ]
    }
  ],

  // Laporan Bulanan — sample (bulan ini)
  laba_rugi: [
    {
      id: 'LR1', bulan: currentMonth(),
      penjualan_bersih: 185000000,
      hpp: 142000000,
      biaya_operasional: 22000000,
      biaya_penyusutan: 2000000,
      catatan: ''
    }
  ],

  stock_opname: [
    {
      id: 'SO1', bulan: currentMonth(),
      items: [
        { produk_id: 'P1', stok_sistem: 165, stok_fisik: 162 },
        { produk_id: 'P2', stok_sistem: 240, stok_fisik: 240 },
        { produk_id: 'P3', stok_sistem: 48, stok_fisik: 45 },
        { produk_id: 'P4', stok_sistem: 238, stok_fisik: 238 }
      ]
    }
  ],

  piutang: [
    { id: 'AR1', pelanggan_id: 'C1', bulan: currentMonth(), total: 4200000, usia_0_7: 4200000, usia_8_30: 0, usia_31_60: 0, usia_gt60: 0, catatan: '' },
    { id: 'AR2', pelanggan_id: 'C2', bulan: currentMonth(), total: 9500000, usia_0_7: 0, usia_8_30: 6500000, usia_31_60: 3000000, usia_gt60: 0, catatan: 'Perlu follow-up' },
    { id: 'AR3', pelanggan_id: 'C3', bulan: currentMonth(), total: 1100000, usia_0_7: 0, usia_8_30: 1100000, usia_31_60: 0, usia_gt60: 0, catatan: '' }
  ],

  hutang: [
    { id: 'AP1', supplier_id: 'S1', bulan: currentMonth(), total: 38000000, jatuh_tempo: dateStr(5), status: 'Belum jatuh tempo', catatan: '' },
    { id: 'AP2', supplier_id: 'S2', bulan: currentMonth(), total: 12500000, jatuh_tempo: dateStr(-3), status: 'Terlambat', catatan: 'Perlu segera bayar' }
  ],

  pembelian: [
    {
      id: 'PB1', bulan: currentMonth(), supplier_id: 'S1',
      items: [
        { produk_id: 'P1', qty: 200, harga_beli: 14000, lead_time: 2 },
        { produk_id: 'P2', qty: 300, harga_beli: 26000, lead_time: 3 },
        { produk_id: 'P3', qty: 100, harga_beli: 21000, lead_time: 3 },
        { produk_id: 'P4', qty: 250, harga_beli: 15000, lead_time: 2 }
      ]
    }
  ],

  kinerja_sales: [
    { id: 'KS1', bulan: currentMonth(), sales_id: 'SL1', target: 60000000, realisasi: 57500000, customer_aktif: 32, customer_baru: 2, catatan: '' },
    { id: 'KS2', bulan: currentMonth(), sales_id: 'SL2', target: 50000000, realisasi: 45000000, customer_aktif: 28, customer_baru: 1, catatan: '' }
  ],

  biaya_operasional: [
    {
      id: 'BO1', bulan: currentMonth(),
      gaji_insentif: 12000000, bbm_tol: 3500000, sewa_gudang: 3000000,
      pemeliharaan: 1800000, listrik_lain: 1700000,
      gaji_bulan_lalu: 12000000, bbm_bulan_lalu: 3100000, sewa_bulan_lalu: 3000000,
      pemeliharaan_bulan_lalu: 900000, listrik_bulan_lalu: 1600000
    }
  ]
};

/* ---- Helper Date Functions ---- */
function today(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

function dateStr(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatMonth(monthStr) {
  if (!monthStr) return '-';
  const [y, m] = monthStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return `${months[parseInt(m)-1]} ${y}`;
}

function formatRp(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
  const n = Number(amount);
  if (Math.abs(n) >= 1000000000) return 'Rp ' + (n/1000000000).toFixed(1) + 'M';
  if (Math.abs(n) >= 1000000) return 'Rp ' + (n/1000000).toFixed(1) + ' jt';
  return 'Rp ' + n.toLocaleString('id-ID');
}

function formatRpFull(amount) {
  if (amount === null || amount === undefined) return 'Rp 0';
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/* =============================================
   DATA ACCESS LAYER
   ============================================= */
const DATA = {
  // Generic CRUD
  getList(key) {
    return DB.get(key) || [];
  },

  setList(key, arr) {
    DB.set(key, arr);
  },

  addItem(key, item) {
    const list = this.getList(key);
    list.push({ ...item, id: item.id || uid() });
    this.setList(key, list);
    return list[list.length - 1];
  },

  updateItem(key, id, updates) {
    const list = this.getList(key);
    const idx = list.findIndex(x => x.id === id);
    if (idx >= 0) { list[idx] = { ...list[idx], ...updates }; this.setList(key, list); }
  },

  deleteItem(key, id) {
    const list = this.getList(key);
    this.setList(key, list.filter(x => x.id !== id));
  },

  findById(key, id) {
    return this.getList(key).find(x => x.id === id);
  },

  // ---- Produk ----
  getProduk() { return this.getList('produk'); },
  getProdukById(id) { return this.findById('produk', id); },
  getProdukNama(id) { const p = this.getProdukById(id); return p ? p.nama : id; },

  // ---- Pelanggan ----
  getPelanggan() { return this.getList('pelanggan'); },
  getPelangganById(id) { return this.findById('pelanggan', id); },
  getPelangganNama(id) { const p = this.getPelangganById(id); return p ? p.nama : id; },

  // ---- Supplier ----
  getSupplier() { return this.getList('supplier'); },
  getSupplierById(id) { return this.findById('supplier', id); },
  getSupplierNama(id) { const s = this.getSupplierById(id); return s ? s.nama : id; },

  // ---- Kendaraan ----
  getKendaraan() { return this.getList('kendaraan'); },
  getKendaraanById(id) { return this.findById('kendaraan', id); },
  getKendaraanLabel(id) { const k = this.getKendaraanById(id); return k ? `${k.jenis} - ${k.driver}` : id; },

  // ---- Sales ----
  getSales() { return this.getList('sales'); },
  getSalesById(id) { return this.findById('sales', id); },
  getSalesNama(id) { const s = this.getSalesById(id); return s ? s.nama : id; },

  // ---- Laporan Harian ----
  getPenjualanHarian() { return this.getList('penjualan_harian'); },
  getMutasiGudang() { return this.getList('mutasi_gudang'); },
  getKasHarian() { return this.getList('kas_harian'); },
  getPengirimanHarian() { return this.getList('pengiriman_harian'); },

  // ---- Laporan Bulanan ----
  getLabaRugi() { return this.getList('laba_rugi'); },
  getStockOpname() { return this.getList('stock_opname'); },
  getPiutang() { return this.getList('piutang'); },
  getHutang() { return this.getList('hutang'); },
  getPembelian() { return this.getList('pembelian'); },
  getKinerjaSales() { return this.getList('kinerja_sales'); },
  getBiayaOperasional() { return this.getList('biaya_operasional'); },

  // ---- Dashboard Stats ----
  getDashboardStats() {
    const penjualan = this.getPenjualanHarian();
    const kas = this.getKasHarian();
    const piutang = this.getPiutang();
    const hutang = this.getHutang();
    const lr = this.getLabaRugi();
    const produk = this.getProduk();

    // Today
    const todayStr = today(0);
    const todayPenjualan = penjualan.find(p => p.tanggal === todayStr);
    const todayKas = kas.find(k => k.tanggal === todayStr);
    const yesterdayPenjualan = penjualan.find(p => p.tanggal === today(-1));

    const omzetHariIni = todayPenjualan
      ? todayPenjualan.items.reduce((s, i) => s + (i.terjual * i.harga), 0) : 0;
    const omzetKemarin = yesterdayPenjualan
      ? yesterdayPenjualan.items.reduce((s, i) => s + (i.terjual * i.harga), 0) : 0;

    let saldoKas = 0;
    if (todayKas) {
      saldoKas = todayKas.saldo_awal + todayKas.penerimaan_tunai + todayKas.penerimaan_piutang - todayKas.pengeluaran - todayKas.setoran_bank;
    } else if (kas.length > 0) {
      const sortedKas = [...kas].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      const latestKas = sortedKas[0];
      saldoKas = latestKas.saldo_awal + latestKas.penerimaan_tunai + latestKas.penerimaan_piutang - latestKas.pengeluaran - latestKas.setoran_bank;
    }

    const totalPiutang = piutang.reduce((s, p) => s + (p.total || 0), 0);
    const piutangMacet = piutang.reduce((s, p) => s + (p.usia_gt60 || 0), 0);
    const totalHutang = hutang.reduce((s, h) => s + (h.total || 0), 0);
    const hutangTerlambat = hutang.filter(h => h.status === 'Terlambat').reduce((s, h) => s + h.total, 0);

    const currentLR = lr.find(l => l.bulan === currentMonth());
    const labaBersih = currentLR
      ? (currentLR.penjualan_bersih - currentLR.hpp - currentLR.biaya_operasional - currentLR.biaya_penyusutan) : 0;
    const marginBersih = currentLR && currentLR.penjualan_bersih > 0
      ? Math.round((labaBersih / currentLR.penjualan_bersih) * 100) : 0;

    return {
      omzetHariIni, omzetKemarin, saldoKas, totalPiutang,
      piutangMacet, totalHutang, hutangTerlambat,
      labaBersih, marginBersih,
      omzetBulanan: currentLR ? currentLR.penjualan_bersih : 0
    };
  },

  // Trend 7 hari
  getOmzetTrend() {
    const penjualan = this.getPenjualanHarian();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = today(-i);
      const p = penjualan.find(x => x.tanggal === d);
      const omzet = p ? p.items.reduce((s, item) => s + (item.terjual * item.harga), 0) : 0;
      result.push({ tanggal: d, omzet });
    }
    return result;
  },

  // Alerts
  getAlerts() {
    const alerts = [];
    const piutang = this.getPiutang();
    const hutang = this.getHutang();
    const produk = this.getProduk();

    // Piutang macet
    piutang.forEach(p => {
      if (p.usia_gt60 > 0) {
        alerts.push({ type: 'danger', title: 'Piutang Macet', desc: `${this.getPelangganNama(p.pelanggan_id)}: ${formatRp(p.usia_gt60)} (>60 hari)` });
      }
    });

    // Hutang terlambat
    hutang.filter(h => h.status === 'Terlambat').forEach(h => {
      alerts.push({ type: 'danger', title: 'Hutang Terlambat', desc: `${this.getSupplierNama(h.supplier_id)}: ${formatRp(h.total)}` });
    });

    // Hutang jatuh tempo dalam 5 hari
    hutang.filter(h => h.status !== 'Terlambat' && h.status !== 'Lunas').forEach(h => {
      const today_ = new Date(); const jt = new Date(h.jatuh_tempo);
      const diff = Math.round((jt - today_) / 86400000);
      if (diff >= 0 && diff <= 5) {
        alerts.push({ type: 'warning', title: 'Hutang Jatuh Tempo', desc: `${this.getSupplierNama(h.supplier_id)}: ${formatRp(h.total)} (${diff} hari lagi)` });
      }
    });

    return alerts;
  }
};

/* =============================================
   INITIALIZE / SEED DATA
   ============================================= */
function initSeedData() {
  const initialized = DB.get('initialized');
  if (!initialized) {
    Object.entries(SEED).forEach(([key, val]) => {
      DB.set(key, val);
    });
    DB.set('initialized', true);
  } else {
    // Force update product prices to the new brand prices requested by user
    const currentProducts = DB.get('produk');
    if (currentProducts && currentProducts.length > 0) {
      let updated = false;
      const updatesMap = {
        'P1': { nama: 'Galon 19L', harga_jual: 16000 },
        'P2': { nama: 'Botol 600ml (1 dus)', harga_jual: 40000 },
        'P3': { nama: 'Botol 330ml (1 dus)', harga_jual: 35000 },
        'P4': { nama: 'Cup 200ml (1 dus)', harga_jual: 17000 }
      };
      const newProducts = currentProducts.map(p => {
        if (updatesMap[p.id]) {
          updated = true;
          return { ...p, ...updatesMap[p.id] };
        }
        return p;
      });
      if (updated) {
        DB.set('produk', newProducts);
      }
    }
  }
  // Ensure company name is set to 'TRS water'
  if (!DB.get('company_name') || DB.get('company_name') === 'PT. Tirta Nusantara') {
    DB.set('company_name', 'TRS water');
  }
}

// Run on load
initSeedData();

// Make globals available
window.DB = DB;
window.DATA = DATA;
window.formatRp = formatRp;
window.formatRpFull = formatRpFull;
window.formatDate = formatDate;
window.formatMonth = formatMonth;
window.today = today;
window.currentMonth = currentMonth;
window.uid = uid;
