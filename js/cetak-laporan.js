/**
 * TRS Water — AMDK Manager
 * Cetak Laporan: Harian, Mingguan, Bulanan
 */

const CETAK_LAPORAN = {

  /* ---- Utility Helpers ---- */
  rp(n) {
    if (!n) return 'Rp 0';
    return 'Rp ' + Number(n).toLocaleString('id-ID');
  },

  companyName() {
    return DB.get('company_name') || 'TRS water';
  },

  printDate() {
    return new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });
  },

  /* ============================================================
     MODAL PEMILIH LAPORAN
     ============================================================ */
  showModal() {
    const today_ = today(0);
    // Compute current week range (Mon–Sun)
    const d = new Date();
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const mon = new Date(d); mon.setDate(d.getDate() - dow);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const fmt = dt => dt.toISOString().slice(0, 10);
    const weekStart = fmt(mon);
    const weekEnd   = fmt(sun);
    const curMonth  = currentMonth();

    APP.openModal('🖨️ Cetak Laporan', `
      <div style="display:flex;flex-direction:column;gap:20px">

        <!-- Jenis Laporan -->
        <div>
          <div class="form-label" style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Jenis Laporan</div>
          <div style="display:flex;flex-direction:column;gap:8px" id="cetakTypeGroup">
            ${[
              ['harian',  '📅 Laporan Harian',  'Penjualan, stok, kas & armada satu hari'],
              ['mingguan','📆 Laporan Mingguan', 'Rekap penjualan & kas satu minggu'],
              ['bulanan', '📊 Laporan Bulanan',  'P&L, piutang, hutang, kinerja sales']
            ].map(([val, label, sub]) => `
              <label style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:var(--bg-input);border:1.5px solid var(--border);border-radius:var(--radius-md);cursor:pointer;transition:.15s" onclick="CETAK_LAPORAN._selectType('${val}')">
                <input type="radio" name="cetakType" value="${val}" ${val==='harian'?'checked':''} style="margin-top:3px;accent-color:var(--accent-green)">
                <div>
                  <div style="font-weight:600;color:var(--text-primary)">${label}</div>
                  <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${sub}</div>
                </div>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Periode -->
        <div id="cetakPeriodeHarian">
          <div class="form-label" style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Tanggal</div>
          <input class="form-control" type="date" id="cetakTglHarian" value="${today_}" />
        </div>

        <div id="cetakPeriodeMingguan" style="display:none">
          <div class="form-label" style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Periode Minggu</div>
          <div class="form-row">
            <div class="form-group" style="margin:0">
              <label class="form-label">Dari Tanggal</label>
              <input class="form-control" type="date" id="cetakMingguDari" value="${weekStart}" />
            </div>
            <div class="form-group" style="margin:0">
              <label class="form-label">Sampai Tanggal</label>
              <input class="form-control" type="date" id="cetakMingguSampai" value="${weekEnd}" />
            </div>
          </div>
        </div>

        <div id="cetakPeriodeBulanan" style="display:none">
          <div class="form-label" style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Bulan</div>
          <input class="form-control" type="month" id="cetakBulan" value="${curMonth}" />
        </div>

        <!-- Isi Laporan -->
        <div>
          <div class="form-label" style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Bagian yang Dicetak</div>
          <div id="cetakSeksiGroup" style="display:flex;flex-direction:column;gap:6px"></div>
        </div>

      </div>
    `, () => {
      const type = document.querySelector('input[name="cetakType"]:checked')?.value || 'harian';
      const seksi = [...document.querySelectorAll('.cetak-seksi:checked')].map(el => el.value);
      if (seksi.length === 0) { APP.toast('Pilih minimal satu bagian laporan', 'error'); return; }

      if (type === 'harian') {
        const tgl = document.getElementById('cetakTglHarian').value;
        if (!tgl) { APP.toast('Tanggal harus diisi', 'error'); return; }
        this.cetakHarian(tgl, seksi);
      } else if (type === 'mingguan') {
        const dari  = document.getElementById('cetakMingguDari').value;
        const sampai = document.getElementById('cetakMingguSampai').value;
        if (!dari || !sampai) { APP.toast('Periode minggu harus diisi', 'error'); return; }
        this.cetakMingguan(dari, sampai, seksi);
      } else {
        const bulan = document.getElementById('cetakBulan').value;
        if (!bulan) { APP.toast('Bulan harus dipilih', 'error'); return; }
        this.cetakBulanan(bulan, seksi);
      }
    });

    // Change modal save button label
    setTimeout(() => {
      const btn = document.getElementById('modalSave');
      if (btn) { btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg> Cetak Laporan'; }
      this._selectType('harian');
    }, 50);
  },

  _selectType(type) {
    ['harian','mingguan','bulanan'].forEach(t => {
      const el = document.getElementById(`cetakPeriode${t.charAt(0).toUpperCase() + t.slice(1)}`);
      if (el) el.style.display = (t === type) ? '' : 'none';
    });
    // Update radio selection style
    document.querySelectorAll('#cetakTypeGroup label').forEach(lbl => {
      const radio = lbl.querySelector('input[type=radio]');
      lbl.style.borderColor = (radio && radio.value === type) ? 'var(--accent-green)' : 'var(--border)';
      lbl.style.background  = (radio && radio.value === type) ? 'rgba(34,197,94,0.07)' : 'var(--bg-input)';
    });
    // Update seksi checkboxes
    const seksiHarian   = [['penjualan','Penjualan per Produk'],['stok','Mutasi Stok/Gudang'],['kas','Kas Harian'],['armada','Pengiriman & Armada']];
    const seksiMingguan = [['penjualan','Rekap Penjualan Harian'],['kas','Rekap Kas Harian'],['ringkasan','Ringkasan Eksekutif']];
    const seksiBulanan  = [['pl','Laba Rugi (P&L)'],['piutang','Piutang (AR)'],['hutang','Hutang ke Pabrik'],['kinerja','Kinerja Sales'],['biaya','Biaya Operasional']];
    const map = { harian: seksiHarian, mingguan: seksiMingguan, bulanan: seksiBulanan };
    const grp = document.getElementById('cetakSeksiGroup');
    if (grp) {
      grp.innerHTML = (map[type] || []).map(([val, lbl]) => `
        <label style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer">
          <input type="checkbox" class="cetak-seksi" value="${val}" checked style="accent-color:var(--accent-green)">
          <span style="font-size:13px;color:var(--text-primary)">${lbl}</span>
        </label>
      `).join('');
    }
  },

  /* ============================================================
     SHARED: PRINT WINDOW HELPER
     ============================================================ */
  _openPrintWindow(html) {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { APP.toast('Popup diblokir browser. Izinkan popup untuk cetak laporan.', 'error'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 800);
  },

  _printHeader(title, subtitle, periode) {
    return `
      <div class="print-header">
        <div class="print-logo-row">
          <div class="print-logo-box">TRS</div>
          <div>
            <div class="print-company">${this.companyName()}</div>
            <div class="print-company-sub">Air Minum Dalam Kemasan — PERUMDA TRS</div>
          </div>
        </div>
        <div class="print-title-box">
          <div class="print-doc-title">${title}</div>
          <div class="print-doc-sub">${subtitle}</div>
          <div class="print-doc-periode">Periode: ${periode}</div>
        </div>
        <div class="print-meta">
          <div>Dicetak: ${this.printDate()}</div>
          <div>Dokumen Resmi — TRS Water Manager</div>
        </div>
        <div class="print-divider"></div>
      </div>
    `;
  },

  _printFooter() {
    return `
      <div class="print-footer">
        <div class="footer-col">
          <div class="footer-label">Dibuat oleh</div>
          <div class="footer-line"></div>
          <div class="footer-name">Admin / Kasir</div>
        </div>
        <div class="footer-col">
          <div class="footer-label">Diperiksa oleh</div>
          <div class="footer-line"></div>
          <div class="footer-name">Manajer Operasional</div>
        </div>
        <div class="footer-col">
          <div class="footer-label">Disetujui oleh</div>
          <div class="footer-line"></div>
          <div class="footer-name">Direktur</div>
        </div>
      </div>
    `;
  },

  _printCSS() {
    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #1e293b; background: #fff; }
        .print-page { max-width: 900px; margin: 0 auto; padding: 28px 32px; }

        /* Header */
        .print-header { margin-bottom: 20px; }
        .print-logo-row { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
        .print-logo-box { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg,#166534,#16a34a); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:14px; flex-shrink:0; }
        .print-company { font-size: 18px; font-weight: 800; color: #0f172a; }
        .print-company-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
        .print-title-box { background: linear-gradient(135deg,#f0fdf4,#dcfce7); border: 1.5px solid #bbf7d0; border-radius: 10px; padding: 14px 18px; margin-bottom: 12px; }
        .print-doc-title { font-size: 17px; font-weight: 800; color: #14532d; }
        .print-doc-sub { font-size: 12px; color: #166534; margin-top: 3px; }
        .print-doc-periode { font-size: 11px; color: #15803d; font-weight: 600; margin-top: 4px; }
        .print-meta { display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; margin-bottom: 12px; }
        .print-divider { border-top: 2px solid #e2e8f0; margin: 0; }

        /* Section */
        .section { margin-top: 22px; }
        .section-title { font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-left: 3px solid #16a34a; padding-left: 10px; margin-bottom: 12px; }

        /* Summary Grid */
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
        .summary-card { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
        .summary-label { font-size: 10px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: .4px; }
        .summary-value { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 3px; }
        .summary-value.green { color: #16a34a; }
        .summary-value.red   { color: #dc2626; }
        .summary-value.blue  { color: #0891b2; }
        .summary-value.orange { color: #ea580c; }

        /* Table */
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #f1f5f9; color: #475569; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: .4px; padding: 8px 10px; text-align: left; border-bottom: 2px solid #e2e8f0; }
        td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: top; }
        tr:hover td { background: #f8fafc; }
        tfoot td, tr.total td { background: #f0fdf4; font-weight: 700; border-top: 2px solid #bbf7d0; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .bold { font-weight: 700; }
        .green-text { color: #16a34a; }
        .red-text   { color: #dc2626; }
        .blue-text  { color: #0891b2; }
        .orange-text { color: #ea580c; }

        /* Badge */
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
        .badge-green  { background: #dcfce7; color: #15803d; }
        .badge-red    { background: #fee2e2; color: #dc2626; }
        .badge-blue   { background: #dbeafe; color: #1d4ed8; }
        .badge-orange { background: #ffedd5; color: #c2410c; }
        .badge-gray   { background: #f1f5f9; color: #475569; }

        /* Info row */
        .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
        .info-label { color: #64748b; }
        .info-value { font-weight: 600; color: #0f172a; }
        .info-total { border-top: 2px solid #e2e8f0; padding-top: 8px; margin-top: 4px; }
        .info-total .info-value { color: #16a34a; font-size: 13px; }

        /* Footer */
        .print-footer { margin-top: 36px; padding-top: 20px; border-top: 1.5px solid #e2e8f0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .footer-col { text-align: center; }
        .footer-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 40px; }
        .footer-line { border-top: 1.5px solid #cbd5e1; width: 80%; margin: 0 auto 6px; }
        .footer-name { font-size: 10px; color: #475569; }

        /* Empty */
        .empty-note { padding: 20px; text-align: center; color: #94a3b8; font-style: italic; }

        /* Page break */
        .page-break { page-break-before: always; }

        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-page { padding: 14px 18px; max-width: 100%; }
          .summary-grid { grid-template-columns: repeat(4,1fr); }
        }
      </style>
    `;
  },

  /* ============================================================
     LAPORAN HARIAN
     ============================================================ */
  cetakHarian(tgl, seksi) {
    const dateLabel = new Date(tgl + 'T00:00:00').toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    let body = '';

    // ── Penjualan ──
    if (seksi.includes('penjualan')) {
      const rec = DATA.getPenjualanHarian().find(r => r.tanggal === tgl);
      if (rec) {
        const omzet = rec.items.reduce((s, i) => s + i.terjual * i.harga, 0);
        const total = rec.items.reduce((s, i) => s + i.terjual, 0);
        body += `
          <div class="section">
            <div class="section-title">Penjualan Harian</div>
            <div class="summary-grid">
              <div class="summary-card"><div class="summary-label">Total Omzet</div><div class="summary-value green">${this.rp(omzet)}</div></div>
              <div class="summary-card"><div class="summary-label">Unit Terjual</div><div class="summary-value blue">${total} unit</div></div>
              <div class="summary-card"><div class="summary-label">Jenis Produk</div><div class="summary-value">${rec.items.length}</div></div>
              <div class="summary-card"><div class="summary-label">Catatan</div><div class="summary-value" style="font-size:11px;font-weight:500">${rec.catatan || '—'}</div></div>
            </div>
            <table>
              <thead><tr>
                <th>Produk</th><th>Stok Awal</th><th class="text-right">Terjual</th><th class="text-right">Harga/Unit</th><th class="text-right">Total Omzet</th><th class="text-right">Sisa Stok</th>
              </tr></thead>
              <tbody>
                ${rec.items.map(item => `<tr>
                  <td class="bold">${DATA.getProdukNama(item.produk_id)}</td>
                  <td>${item.stok_awal}</td>
                  <td class="text-right green-text bold">${item.terjual}</td>
                  <td class="text-right">${this.rp(item.harga)}</td>
                  <td class="text-right bold">${this.rp(item.terjual * item.harga)}</td>
                  <td class="text-right">${item.stok_awal - item.terjual}</td>
                </tr>`).join('')}
              </tbody>
              <tfoot><tr class="total">
                <td colspan="4" class="bold">TOTAL OMZET</td>
                <td class="text-right green-text bold">${this.rp(omzet)}</td>
                <td></td>
              </tr></tfoot>
            </table>
          </div>`;
      } else {
        body += `<div class="section"><div class="section-title">Penjualan Harian</div><div class="empty-note">Tidak ada data penjualan untuk tanggal ini.</div></div>`;
      }
    }

    // ── Stok/Gudang ──
    if (seksi.includes('stok')) {
      const rec = DATA.getMutasiGudang().find(r => r.tanggal === tgl);
      const stokData = DB.get('stok') || {};
      const produk = DATA.getProduk();
      body += `
        <div class="section">
          <div class="section-title">Mutasi Stok / Gudang</div>`;
      if (rec) {
        body += `<table>
          <thead><tr><th>Produk</th><th class="text-right">Stok Awal</th><th class="text-right green-text">+ Masuk</th><th class="text-right orange-text">- Keluar</th><th class="text-right red-text">Retur/Rusak</th><th class="text-right">Stok Akhir</th></tr></thead>
          <tbody>${rec.items.map(item => {
            const akhir = item.stok_awal + item.masuk - item.keluar - item.retur;
            return `<tr>
              <td class="bold">${DATA.getProdukNama(item.produk_id)}</td>
              <td class="text-right">${item.stok_awal}</td>
              <td class="text-right green-text">+${item.masuk}</td>
              <td class="text-right orange-text">-${item.keluar}</td>
              <td class="text-right ${item.retur>0?'red-text':''}">${item.retur>0?'-'+item.retur:'—'}</td>
              <td class="text-right bold">${akhir}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>`;
      } else {
        // Show current stock snapshot
        body += `<table>
          <thead><tr><th>Produk</th><th class="text-right">Stok Saat Ini</th><th>Satuan</th><th>Min. Stok</th><th>Status</th></tr></thead>
          <tbody>${produk.map(p => {
            const stok = stokData[p.id] || 0;
            const status = stok <= p.stok_minimal ? 'Menipis ⚠️' : stok <= p.stok_minimal * 2 ? 'Perhatian' : 'Aman ✓';
            const cls = stok <= p.stok_minimal ? 'red-text' : stok <= p.stok_minimal * 2 ? 'orange-text' : 'green-text';
            return `<tr>
              <td class="bold">${p.nama}</td>
              <td class="text-right ${cls} bold">${stok}</td>
              <td>${p.satuan}</td>
              <td>${p.stok_minimal}</td>
              <td><span class="badge ${stok<=p.stok_minimal?'badge-red':stok<=p.stok_minimal*2?'badge-orange':'badge-green'}">${status}</span></td>
            </tr>`;
          }).join('')}</tbody>
        </table><div class="empty-note" style="margin-top:6px;font-size:10px">*Tidak ada catatan mutasi untuk tanggal ini. Menampilkan stok saat ini.</div>`;
      }
      body += `</div>`;
    }

    // ── Kas Harian ──
    if (seksi.includes('kas')) {
      const rec = DATA.getKasHarian().find(r => r.tanggal === tgl);
      body += `<div class="section"><div class="section-title">Kas Harian</div>`;
      if (rec) {
        const saldoAkhir = rec.saldo_awal + rec.penerimaan_tunai + rec.penerimaan_piutang - rec.pengeluaran - rec.setoran_bank;
        body += `
          <div class="summary-grid">
            <div class="summary-card"><div class="summary-label">Saldo Awal</div><div class="summary-value">${this.rp(rec.saldo_awal)}</div></div>
            <div class="summary-card"><div class="summary-label">Total Masuk</div><div class="summary-value green">${this.rp(rec.penerimaan_tunai + rec.penerimaan_piutang)}</div></div>
            <div class="summary-card"><div class="summary-label">Total Keluar</div><div class="summary-value red">${this.rp(rec.pengeluaran + rec.setoran_bank)}</div></div>
            <div class="summary-card"><div class="summary-label">Saldo Akhir</div><div class="summary-value ${saldoAkhir>=0?'green':'red'}">${this.rp(saldoAkhir)}</div></div>
          </div>
          <div style="border:1px solid #e2e8f0;border-radius:8px;padding:14px;max-width:460px">
            <div class="info-row"><span class="info-label">Saldo Kas Awal Hari</span><span class="info-value">${this.rp(rec.saldo_awal)}</span></div>
            <div class="info-row"><span class="info-label">+ Penerimaan Penjualan Tunai</span><span class="info-value green-text">+${this.rp(rec.penerimaan_tunai)}</span></div>
            <div class="info-row"><span class="info-label">+ Penerimaan Pembayaran Piutang</span><span class="info-value green-text">+${this.rp(rec.penerimaan_piutang)}</span></div>
            <div class="info-row"><span class="info-label">- Pengeluaran Operasional</span><span class="info-value red-text">-${this.rp(rec.pengeluaran)}</span></div>
            <div class="info-row"><span class="info-label">- Setoran ke Bank</span><span class="info-value red-text">-${this.rp(rec.setoran_bank)}</span></div>
            <div class="info-row info-total"><span class="info-label bold">💰 Saldo Kas Akhir Hari</span><span class="info-value ${saldoAkhir>=0?'green-text':'red-text'}">${this.rp(saldoAkhir)}</span></div>
            ${rec.catatan ? `<div style="margin-top:10px;font-size:10px;color:#64748b">📝 ${rec.catatan}</div>` : ''}
          </div>`;
      } else {
        body += `<div class="empty-note">Tidak ada data kas untuk tanggal ini.</div>`;
      }
      body += `</div>`;
    }

    // ── Armada ──
    if (seksi.includes('armada')) {
      const rec = DATA.getPengirimanHarian().find(r => r.tanggal === tgl);
      body += `<div class="section"><div class="section-title">Pengiriman & Armada</div>`;
      if (rec) {
        const totalBBM  = rec.items.reduce((s, i) => s + i.bbm, 0);
        const totalDrop = rec.items.reduce((s, i) => s + i.jumlah_drop, 0);
        body += `
          <div class="summary-grid">
            <div class="summary-card"><div class="summary-label">Total Drop</div><div class="summary-value blue">${totalDrop} toko</div></div>
            <div class="summary-card"><div class="summary-label">Biaya BBM</div><div class="summary-value orange">${this.rp(totalBBM)}</div></div>
            <div class="summary-card"><div class="summary-label">Armada Aktif</div><div class="summary-value">${rec.items.length} unit</div></div>
            <div class="summary-card"></div>
          </div>
          <table>
            <thead><tr><th>Kendaraan / Driver</th><th>Area / Rute</th><th class="text-right">Jumlah Drop</th><th>Total Muatan</th><th class="text-right">BBM (Rp)</th><th class="text-center">Status</th></tr></thead>
            <tbody>${rec.items.map(item => `<tr>
              <td class="bold">${DATA.getKendaraanLabel(item.kendaraan_id)}</td>
              <td>${item.area}</td>
              <td class="text-right">${item.jumlah_drop}</td>
              <td>${item.total_muatan}</td>
              <td class="text-right">${this.rp(item.bbm)}</td>
              <td class="text-center"><span class="badge ${item.status==='Selesai'?'badge-green':item.status==='Proses'?'badge-orange':'badge-blue'}">${item.status}</span></td>
            </tr>`).join('')}</tbody>
            <tfoot><tr class="total">
              <td colspan="2" class="bold">TOTAL</td>
              <td class="text-right bold">${totalDrop} drop</td>
              <td></td>
              <td class="text-right bold orange-text">${this.rp(totalBBM)}</td>
              <td></td>
            </tr></tfoot>
          </table>`;
      } else {
        body += `<div class="empty-note">Tidak ada data pengiriman untuk tanggal ini.</div>`;
      }
      body += `</div>`;
    }

    this._openPrintWindow(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Laporan Harian — ${dateLabel}</title>${this._printCSS()}</head><body><div class="print-page">
      ${this._printHeader('LAPORAN HARIAN', 'Ringkasan operasional harian TRS Water', dateLabel)}
      ${body}
      ${this._printFooter()}
    </div></body></html>`);
    APP.closeModal();
  },

  /* ============================================================
     LAPORAN MINGGUAN
     ============================================================ */
  cetakMingguan(dari, sampai, seksi) {
    const fmtD = d => new Date(d+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
    const periodeLabel = `${fmtD(dari)} — ${fmtD(sampai)}`;

    // Get all records within range
    const inRange = (tgl) => tgl >= dari && tgl <= sampai;
    const penjualanAll = DATA.getPenjualanHarian().filter(r => inRange(r.tanggal)).sort((a,b) => a.tanggal.localeCompare(b.tanggal));
    const kasAll       = DATA.getKasHarian().filter(r => inRange(r.tanggal)).sort((a,b) => a.tanggal.localeCompare(b.tanggal));

    // Aggregate totals
    const totalOmzet    = penjualanAll.reduce((s,r) => s + r.items.reduce((ss,i) => ss + i.terjual*i.harga, 0), 0);
    const totalUnit     = penjualanAll.reduce((s,r) => s + r.items.reduce((ss,i) => ss + i.terjual, 0), 0);
    const totalMasuk    = kasAll.reduce((s,r) => s + r.penerimaan_tunai + r.penerimaan_piutang, 0);
    const totalKeluar   = kasAll.reduce((s,r) => s + r.pengeluaran + r.setoran_bank, 0);
    const hariAktif     = penjualanAll.length;

    let body = '';

    // ── Ringkasan Eksekutif ──
    if (seksi.includes('ringkasan')) {
      body += `
        <div class="section">
          <div class="section-title">Ringkasan Eksekutif</div>
          <div class="summary-grid">
            <div class="summary-card"><div class="summary-label">Total Omzet</div><div class="summary-value green">${this.rp(totalOmzet)}</div></div>
            <div class="summary-card"><div class="summary-label">Total Unit Terjual</div><div class="summary-value blue">${totalUnit} unit</div></div>
            <div class="summary-card"><div class="summary-label">Hari Aktif</div><div class="summary-value">${hariAktif} hari</div></div>
            <div class="summary-card"><div class="summary-label">Rata-rata/Hari</div><div class="summary-value">${this.rp(hariAktif?Math.round(totalOmzet/hariAktif):0)}</div></div>
          </div>
          <div class="summary-grid">
            <div class="summary-card"><div class="summary-label">Total Kas Masuk</div><div class="summary-value green">${this.rp(totalMasuk)}</div></div>
            <div class="summary-card"><div class="summary-label">Total Kas Keluar</div><div class="summary-value red">${this.rp(totalKeluar)}</div></div>
            <div class="summary-card"><div class="summary-label">Net Kas</div><div class="summary-value ${totalMasuk-totalKeluar>=0?'green':'red'}">${this.rp(totalMasuk - totalKeluar)}</div></div>
            <div class="summary-card"><div class="summary-label">Hari Data Kas</div><div class="summary-value">${kasAll.length} hari</div></div>
          </div>
        </div>`;
    }

    // ── Rekap Penjualan Per Hari ──
    if (seksi.includes('penjualan')) {
      body += `
        <div class="section">
          <div class="section-title">Rekap Penjualan Harian (Per Hari)</div>
          ${penjualanAll.length === 0 ? '<div class="empty-note">Tidak ada data penjualan dalam periode ini.</div>' : `
          <table>
            <thead><tr>
              <th>Tanggal</th>
              ${DATA.getProduk().map(p => `<th class="text-right">${p.nama}</th>`).join('')}
              <th class="text-right">Total Omzet</th>
              <th class="text-right">Total Unit</th>
            </tr></thead>
            <tbody>
              ${penjualanAll.map(rec => {
                const omzet = rec.items.reduce((s,i) => s+i.terjual*i.harga, 0);
                const unit  = rec.items.reduce((s,i) => s+i.terjual, 0);
                return `<tr>
                  <td class="bold">${new Date(rec.tanggal+'T00:00:00').toLocaleDateString('id-ID',{weekday:'short',day:'numeric',month:'short'})}</td>
                  ${DATA.getProduk().map(p => {
                    const item = rec.items.find(i => i.produk_id === p.id);
                    return `<td class="text-right">${item ? item.terjual : '—'}</td>`;
                  }).join('')}
                  <td class="text-right bold green-text">${this.rp(omzet)}</td>
                  <td class="text-right">${unit}</td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot><tr class="total">
              <td class="bold">TOTAL MINGGU</td>
              ${DATA.getProduk().map(p => {
                const totalProd = penjualanAll.reduce((s,rec) => {
                  const item = rec.items.find(i => i.produk_id === p.id);
                  return s + (item ? item.terjual : 0);
                }, 0);
                return `<td class="text-right bold">${totalProd}</td>`;
              }).join('')}
              <td class="text-right bold green-text">${this.rp(totalOmzet)}</td>
              <td class="text-right bold">${totalUnit}</td>
            </tr></tfoot>
          </table>`}
        </div>`;
    }

    // ── Rekap Kas Per Hari ──
    if (seksi.includes('kas')) {
      body += `
        <div class="section">
          <div class="section-title">Rekap Kas Harian (Per Hari)</div>
          ${kasAll.length === 0 ? '<div class="empty-note">Tidak ada data kas dalam periode ini.</div>' : `
          <table>
            <thead><tr>
              <th>Tanggal</th>
              <th class="text-right">Saldo Awal</th>
              <th class="text-right green-text">+ Tunai</th>
              <th class="text-right green-text">+ Piutang</th>
              <th class="text-right red-text">- Pengeluaran</th>
              <th class="text-right red-text">- Bank</th>
              <th class="text-right">Saldo Akhir</th>
            </tr></thead>
            <tbody>
              ${kasAll.map(rec => {
                const akhir = rec.saldo_awal + rec.penerimaan_tunai + rec.penerimaan_piutang - rec.pengeluaran - rec.setoran_bank;
                return `<tr>
                  <td class="bold">${new Date(rec.tanggal+'T00:00:00').toLocaleDateString('id-ID',{weekday:'short',day:'numeric',month:'short'})}</td>
                  <td class="text-right">${this.rp(rec.saldo_awal)}</td>
                  <td class="text-right green-text">+${this.rp(rec.penerimaan_tunai)}</td>
                  <td class="text-right green-text">+${this.rp(rec.penerimaan_piutang)}</td>
                  <td class="text-right red-text">-${this.rp(rec.pengeluaran)}</td>
                  <td class="text-right red-text">-${this.rp(rec.setoran_bank)}</td>
                  <td class="text-right bold ${akhir>=0?'green-text':'red-text'}">${this.rp(akhir)}</td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot><tr class="total">
              <td class="bold">TOTAL MINGGU</td>
              <td></td>
              <td class="text-right bold green-text">+${this.rp(kasAll.reduce((s,r)=>s+r.penerimaan_tunai,0))}</td>
              <td class="text-right bold green-text">+${this.rp(kasAll.reduce((s,r)=>s+r.penerimaan_piutang,0))}</td>
              <td class="text-right bold red-text">-${this.rp(kasAll.reduce((s,r)=>s+r.pengeluaran,0))}</td>
              <td class="text-right bold red-text">-${this.rp(kasAll.reduce((s,r)=>s+r.setoran_bank,0))}</td>
              <td class="text-right bold">${this.rp(totalMasuk - totalKeluar)}</td>
            </tr></tfoot>
          </table>`}
        </div>`;
    }

    this._openPrintWindow(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Laporan Mingguan — ${periodeLabel}</title>${this._printCSS()}</head><body><div class="print-page">
      ${this._printHeader('LAPORAN MINGGUAN', 'Rekap operasional mingguan TRS Water', periodeLabel)}
      ${body}
      ${this._printFooter()}
    </div></body></html>`);
    APP.closeModal();
  },

  /* ============================================================
     LAPORAN BULANAN
     ============================================================ */
  cetakBulanan(bulan, seksi) {
    const periodeLabel = formatMonth(bulan);

    let body = '';

    // ── Laba Rugi (P&L) ──
    if (seksi.includes('pl')) {
      const rec = DATA.getLabaRugi().find(r => r.bulan === bulan);
      body += `<div class="section"><div class="section-title">Laporan Laba Rugi (P&L) — ${periodeLabel}</div>`;
      if (rec) {
        const labaKotor  = rec.penjualan_bersih - rec.hpp;
        const labaBersih = labaKotor - rec.biaya_operasional - rec.biaya_penyusutan;
        const mKotor     = rec.penjualan_bersih > 0 ? ((labaKotor/rec.penjualan_bersih)*100).toFixed(1) : 0;
        const mBersih    = rec.penjualan_bersih > 0 ? ((labaBersih/rec.penjualan_bersih)*100).toFixed(1) : 0;
        body += `
          <div class="summary-grid">
            <div class="summary-card"><div class="summary-label">Penjualan Bersih</div><div class="summary-value blue">${this.rp(rec.penjualan_bersih)}</div></div>
            <div class="summary-card"><div class="summary-label">Laba Kotor</div><div class="summary-value green">${this.rp(labaKotor)}</div></div>
            <div class="summary-card"><div class="summary-label">Laba Bersih</div><div class="summary-value ${labaBersih>=0?'green':'red'}">${this.rp(labaBersih)}</div></div>
            <div class="summary-card"><div class="summary-label">Margin Bersih</div><div class="summary-value ${parseFloat(mBersih)>=10?'green':'orange'}">${mBersih}%</div></div>
          </div>
          <div style="border:1px solid #e2e8f0;border-radius:8px;padding:14px;max-width:520px">
            <div class="info-row"><span class="info-label bold">Penjualan Bersih</span><span class="info-value blue-text">${this.rp(rec.penjualan_bersih)}</span></div>
            <div class="info-row"><span class="info-label">— Harga Pokok Penjualan (HPP)</span><span class="info-value red-text">(${this.rp(rec.hpp)})</span></div>
            <div class="info-row"><span class="info-label bold">= Laba Kotor</span><span class="info-value green-text">${this.rp(labaKotor)} (${mKotor}%)</span></div>
            <div class="info-row"><span class="info-label">— Biaya Operasional</span><span class="info-value red-text">(${this.rp(rec.biaya_operasional)})</span></div>
            <div class="info-row"><span class="info-label">— Biaya Penyusutan Kendaraan</span><span class="info-value red-text">(${this.rp(rec.biaya_penyusutan)})</span></div>
            <div class="info-row info-total"><span class="info-label bold">💰 Laba Bersih Sebelum Pajak</span><span class="info-value ${labaBersih>=0?'green-text':'red-text'}" style="font-size:15px;font-weight:800">${this.rp(labaBersih)}</span></div>
            ${rec.catatan ? `<div style="margin-top:10px;font-size:10px;color:#64748b">📝 ${rec.catatan}</div>` : ''}
          </div>`;
      } else {
        body += `<div class="empty-note">Tidak ada data P&L untuk ${periodeLabel}.</div>`;
      }
      body += `</div>`;
    }

    // ── Piutang ──
    if (seksi.includes('piutang')) {
      const piutangList = DATA.getPiutang().filter(r => r.bulan === bulan || !r.bulan);
      const totalPiutang = piutangList.reduce((s,r) => s+(r.total||0), 0);
      body += `
        <div class="section">
          <div class="section-title">Piutang (AR) — ${periodeLabel}</div>
          ${piutangList.length === 0 ? '<div class="empty-note">Tidak ada data piutang.</div>' : `
          <div class="summary-grid">
            <div class="summary-card"><div class="summary-label">Total Piutang</div><div class="summary-value orange">${this.rp(totalPiutang)}</div></div>
            <div class="summary-card"><div class="summary-label">Jumlah Pelanggan</div><div class="summary-value">${piutangList.length}</div></div>
            <div class="summary-card"><div class="summary-label">Macet (>60 hari)</div><div class="summary-value red">${this.rp(piutangList.reduce((s,r)=>s+(r.usia_gt60||0),0))}</div></div>
            <div class="summary-card"></div>
          </div>
          <table>
            <thead><tr>
              <th>Pelanggan</th>
              <th class="text-right">0–30 hari</th>
              <th class="text-right">31–60 hari</th>
              <th class="text-right red-text">&gt;60 hari</th>
              <th class="text-right">Total</th>
              <th>Status</th>
            </tr></thead>
            <tbody>${piutangList.map(r => `<tr>
              <td class="bold">${DATA.getPelangganNama(r.pelanggan_id)}</td>
              <td class="text-right">${this.rp(r.usia_0_30)}</td>
              <td class="text-right orange-text">${this.rp(r.usia_31_60)}</td>
              <td class="text-right red-text bold">${this.rp(r.usia_gt60)}</td>
              <td class="text-right bold">${this.rp(r.total)}</td>
              <td><span class="badge ${r.usia_gt60>0?'badge-red':r.usia_31_60>0?'badge-orange':'badge-green'}">${r.usia_gt60>0?'Macet':r.usia_31_60>0?'Perhatian':'Lancar'}</span></td>
            </tr>`).join('')}</tbody>
            <tfoot><tr class="total">
              <td class="bold">TOTAL</td>
              <td class="text-right bold">${this.rp(piutangList.reduce((s,r)=>s+(r.usia_0_30||0),0))}</td>
              <td class="text-right bold orange-text">${this.rp(piutangList.reduce((s,r)=>s+(r.usia_31_60||0),0))}</td>
              <td class="text-right bold red-text">${this.rp(piutangList.reduce((s,r)=>s+(r.usia_gt60||0),0))}</td>
              <td class="text-right bold">${this.rp(totalPiutang)}</td>
              <td></td>
            </tr></tfoot>
          </table>`}
        </div>`;
    }

    // ── Hutang ──
    if (seksi.includes('hutang')) {
      const hutangList = DATA.getHutang().filter(r => r.bulan === bulan || !r.bulan);
      const totalHutang = hutangList.reduce((s,r) => s+(r.total||0), 0);
      body += `
        <div class="section">
          <div class="section-title">Hutang ke Pabrik (AP) — ${periodeLabel}</div>
          ${hutangList.length === 0 ? '<div class="empty-note">Tidak ada data hutang.</div>' : `
          <div class="summary-grid">
            <div class="summary-card"><div class="summary-label">Total Hutang</div><div class="summary-value red">${this.rp(totalHutang)}</div></div>
            <div class="summary-card"><div class="summary-label">Jumlah Supplier</div><div class="summary-value">${hutangList.length}</div></div>
            <div class="summary-card"><div class="summary-label">Terlambat</div><div class="summary-value red">${hutangList.filter(r=>r.status==='Terlambat').length} tagihan</div></div>
            <div class="summary-card"></div>
          </div>
          <table>
            <thead><tr><th>Supplier</th><th class="text-right">Total Hutang</th><th>Jatuh Tempo</th><th>Status</th><th>Keterangan</th></tr></thead>
            <tbody>${hutangList.map(r => `<tr>
              <td class="bold">${DATA.getSupplierNama(r.supplier_id)}</td>
              <td class="text-right bold red-text">${this.rp(r.total)}</td>
              <td>${r.jatuh_tempo || '—'}</td>
              <td><span class="badge ${r.status==='Lunas'?'badge-green':r.status==='Terlambat'?'badge-red':'badge-orange'}">${r.status||'Belum Lunas'}</span></td>
              <td style="font-size:10px;color:#64748b">${r.catatan||'—'}</td>
            </tr>`).join('')}</tbody>
            <tfoot><tr class="total">
              <td class="bold">TOTAL HUTANG</td>
              <td class="text-right bold red-text">${this.rp(totalHutang)}</td>
              <td colspan="3"></td>
            </tr></tfoot>
          </table>`}
        </div>`;
    }

    // ── Kinerja Sales ──
    if (seksi.includes('kinerja')) {
      const kList = DATA.getKinerjaSales().filter(r => r.bulan === bulan);
      body += `
        <div class="section">
          <div class="section-title">Kinerja Sales — ${periodeLabel}</div>
          ${kList.length === 0 ? '<div class="empty-note">Tidak ada data kinerja sales.</div>' : `
          <table>
            <thead><tr><th>Sales</th><th>Area</th><th class="text-right">Target</th><th class="text-right">Realisasi</th><th class="text-right">Pencapaian</th><th>Status</th></tr></thead>
            <tbody>${kList.map(r => {
              const pct = r.target > 0 ? Math.round((r.realisasi/r.target)*100) : 0;
              return `<tr>
                <td class="bold">${DATA.getSalesNama(r.sales_id)}</td>
                <td>${DATA.getSalesById(r.sales_id)?.area||'—'}</td>
                <td class="text-right">${this.rp(r.target)}</td>
                <td class="text-right bold">${this.rp(r.realisasi)}</td>
                <td class="text-right bold ${pct>=100?'green-text':'orange-text'}">${pct}%</td>
                <td><span class="badge ${pct>=100?'badge-green':pct>=80?'badge-orange':'badge-red'}">${pct>=100?'Tercapai':pct>=80?'Mendekati':'Di Bawah Target'}</span></td>
              </tr>`;
            }).join('')}</tbody>
            <tfoot><tr class="total">
              <td colspan="2" class="bold">TOTAL</td>
              <td class="text-right bold">${this.rp(kList.reduce((s,r)=>s+r.target,0))}</td>
              <td class="text-right bold green-text">${this.rp(kList.reduce((s,r)=>s+r.realisasi,0))}</td>
              <td colspan="2"></td>
            </tr></tfoot>
          </table>`}
        </div>`;
    }

    // ── Biaya Operasional ──
    if (seksi.includes('biaya')) {
      const bList = DATA.getBiayaOperasional().filter(r => r.bulan === bulan);
      const totalBiaya = bList.reduce((s,r) => s+(r.total||0), 0);
      body += `
        <div class="section">
          <div class="section-title">Biaya Operasional — ${periodeLabel}</div>
          ${bList.length === 0 ? '<div class="empty-note">Tidak ada data biaya operasional.</div>' : `
          <div class="summary-grid">
            <div class="summary-card"><div class="summary-label">Total Biaya</div><div class="summary-value red">${this.rp(totalBiaya)}</div></div>
            <div class="summary-card"><div class="summary-label">Kategori</div><div class="summary-value">${bList.length}</div></div>
            <div class="summary-card"></div><div class="summary-card"></div>
          </div>
          <table>
            <thead><tr><th>Kategori Biaya</th><th class="text-right">Jumlah</th><th>Keterangan</th></tr></thead>
            <tbody>${bList.map(r => `<tr>
              <td class="bold">${r.kategori||r.nama||'—'}</td>
              <td class="text-right red-text bold">${this.rp(r.total||r.jumlah)}</td>
              <td style="font-size:10px;color:#64748b">${r.catatan||r.keterangan||'—'}</td>
            </tr>`).join('')}</tbody>
            <tfoot><tr class="total">
              <td class="bold">TOTAL BIAYA</td>
              <td class="text-right bold red-text">${this.rp(totalBiaya)}</td>
              <td></td>
            </tr></tfoot>
          </table>`}
        </div>`;
    }

    this._openPrintWindow(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Laporan Bulanan — ${periodeLabel}</title>${this._printCSS()}</head><body><div class="print-page">
      ${this._printHeader('LAPORAN BULANAN', 'Evaluasi kinerja bisnis bulanan TRS Water', periodeLabel)}
      ${body}
      ${this._printFooter()}
    </div></body></html>`);
    APP.closeModal();
  }
};

window.CETAK_LAPORAN = CETAK_LAPORAN;
