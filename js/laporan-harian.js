/**
 * AMDK Manager — Laporan Harian
 * Penjualan Harian, Stok/Gudang, Kas Harian, Pengiriman & Armada
 */

/* =============================================
   PENJUALAN HARIAN
   ============================================= */
const PENJUALAN_HARIAN = {
  render() {
    const records = DATA.getPenjualanHarian().sort((a,b) => b.tanggal.localeCompare(a.tanggal));
    return `
      <div class="page-enter">
        <div class="section-header mb-6">
          <div>
            <h2 class="section-title">Laporan Penjualan Harian</h2>
            <p class="section-desc">Direkap setiap sore/malam oleh admin/kasir dari nota penjualan</p>
          </div>
          <button class="btn btn-primary" onclick="PENJUALAN_HARIAN.showForm()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Input Penjualan
          </button>
        </div>

        ${records.length === 0 ? `<div class="card"><div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3v18h18"/><polyline points="18.5,8 12,12.5 8,10 3,14"/></svg>
          <h3>Belum ada data penjualan</h3><p>Klik tombol "Input Penjualan" untuk mulai merekap</p>
        </div></div>` : records.map(rec => this.renderCard(rec)).join('')}
      </div>
    `;
  },

  renderCard(rec) {
    const omzet = rec.items.reduce((s, i) => s + (i.terjual * i.harga), 0);
    const totalUnit = rec.items.reduce((s, i) => s + i.terjual, 0);
    return `
      <div class="card mb-6">
        <div class="card-header">
          <div>
            <div class="card-title">${formatDate(rec.tanggal)}</div>
            ${rec.catatan ? `<div class="card-subtitle">📝 ${rec.catatan}</div>` : ''}
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <div style="text-align:right">
              <div style="font-size:18px;font-weight:800;color:var(--accent-green)">${formatRp(omzet)}</div>
              <div style="font-size:11px;color:var(--text-muted)">${totalUnit} unit terjual</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="PENJUALAN_HARIAN.showForm('${rec.id}')">Edit</button>
            <button class="btn-icon" onclick="PENJUALAN_HARIAN.delete('${rec.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>Produk</th><th>Stok Awal</th><th>Terjual</th><th>Harga/Unit</th><th class="text-right">Total Omzet</th><th>Sisa Stok</th>
            </tr></thead>
            <tbody>
              ${rec.items.map(item => `
                <tr>
                  <td class="bold">${DATA.getProdukNama(item.produk_id)}</td>
                  <td>${item.stok_awal}</td>
                  <td class="positive">${item.terjual}</td>
                  <td>${formatRpFull(item.harga)}</td>
                  <td class="text-right bold positive">${formatRp(item.terjual * item.harga)}</td>
                  <td>${item.stok_awal - item.terjual}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="table-summary">
                <td colspan="4" class="font-bold">TOTAL OMZET HARI INI</td>
                <td class="text-right positive font-bold">${formatRp(omzet)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  },

  showForm(id = null) {
    const produk = DATA.getProduk();
    const stokData = DB.get('stok') || {};
    const rec = id ? DATA.getPenjualanHarian().find(r => r.id === id) : null;

    const itemsHtml = produk.map((p, idx) => {
      const item = rec ? rec.items.find(i => i.produk_id === p.id) : null;
      return `
        <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:10px">
          <div style="font-weight:600;color:var(--text-primary);margin-bottom:10px">${p.nama}</div>
          <div class="form-row-3">
            <div class="form-group" style="margin:0">
              <label class="form-label">Stok Awal</label>
              <input class="form-control" type="number" id="stok_awal_${p.id}" value="${item ? item.stok_awal : (stokData[p.id] || 0)}" min="0" />
            </div>
            <div class="form-group" style="margin:0">
              <label class="form-label">Terjual</label>
              <input class="form-control" type="number" id="terjual_${p.id}" value="${item ? item.terjual : 0}" min="0" />
            </div>
            <div class="form-group" style="margin:0">
              <label class="form-label">Harga/Unit (Rp)</label>
              <input class="form-control" type="number" id="harga_${p.id}" value="${item ? item.harga : p.harga_jual}" min="0" />
            </div>
          </div>
        </div>
      `;
    }).join('');

    APP.openModal(id ? 'Edit Penjualan' : 'Input Penjualan Harian', `
      <div class="form-group">
        <label class="form-label">Tanggal</label>
        <input class="form-control" type="date" id="ph_tanggal" value="${rec ? rec.tanggal : today(0)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Catatan (opsional)</label>
        <input class="form-control" type="text" id="ph_catatan" placeholder="Misal: ada komplain, retur, lonjakan pesanan..." value="${rec ? rec.catatan : ''}" />
      </div>
      <div style="margin-top:16px"><div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px">Data Per Produk</div>${itemsHtml}</div>
    `, () => {
      const tanggal = document.getElementById('ph_tanggal').value;
      const catatan = document.getElementById('ph_catatan').value;
      const items = produk.map(p => ({
        produk_id: p.id,
        stok_awal: parseInt(document.getElementById(`stok_awal_${p.id}`).value) || 0,
        terjual: parseInt(document.getElementById(`terjual_${p.id}`).value) || 0,
        harga: parseInt(document.getElementById(`harga_${p.id}`).value) || p.harga_jual
      }));
      if (!tanggal) { APP.toast('Tanggal harus diisi', 'error'); return; }
      const data = { tanggal, catatan, items };
      if (rec) {
        DATA.updateItem('penjualan_harian', id, data);
        APP.toast('Penjualan berhasil diperbarui', 'success');
      } else {
        DATA.addItem('penjualan_harian', data);
        APP.toast('Penjualan berhasil disimpan', 'success');
      }
      APP.closeModal();
      APP.navigate('penjualan-harian');
    });
  },

  delete(id) {
    if (confirm('Hapus data penjualan ini?')) {
      DATA.deleteItem('penjualan_harian', id);
      APP.toast('Data dihapus', 'warning');
      APP.navigate('penjualan-harian');
    }
  }
};

/* =============================================
   STOK / MUTASI GUDANG HARIAN
   ============================================= */
const STOK_HARIAN = {
  render() {
    const records = DATA.getMutasiGudang().sort((a,b) => b.tanggal.localeCompare(a.tanggal));
    const stokData = DB.get('stok') || {};
    const produk = DATA.getProduk();

    return `
      <div class="page-enter">
        <div class="section-header mb-6">
          <div>
            <h2 class="section-title">Stok & Mutasi Gudang Harian</h2>
            <p class="section-desc">Barang masuk (dari pabrik) dan keluar (ke market). Sinkronisasi stok fisik.</p>
          </div>
          <button class="btn btn-primary" onclick="STOK_HARIAN.showForm()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Input Mutasi
          </button>
        </div>

        <!-- Stok Saat Ini -->
        <div class="card mb-6">
          <div class="card-title mb-4">📦 Stok Saat Ini</div>
          <div class="table-wrapper">
            <table>
              <thead><tr><th>Produk</th><th>Stok</th><th>Satuan</th><th>Min. Stok</th><th>Status</th></tr></thead>
              <tbody>
                ${produk.map(p => {
                  const stok = stokData[p.id] || 0;
                  const status = stok <= p.stok_minimal ? 'danger' : stok <= p.stok_minimal * 2 ? 'warning' : 'success';
                  const label = stok <= p.stok_minimal ? '⚠️ Menipis' : stok <= p.stok_minimal * 2 ? 'Perhatian' : '✓ Aman';
                  return `<tr>
                    <td class="bold">${p.nama}</td>
                    <td class="${status === 'danger' ? 'negative' : status === 'warning' ? 'warning' : 'positive'} bold">${stok}</td>
                    <td>${p.satuan}</td>
                    <td>${p.stok_minimal}</td>
                    <td><span class="badge badge-${status}">${label}</span></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- History -->
        ${records.length === 0 ? `<div class="card"><div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
          <h3>Belum ada data mutasi</h3><p>Klik "Input Mutasi" untuk mencatat pergerakan barang</p>
        </div></div>` : records.map(rec => this.renderCard(rec)).join('')}
      </div>
    `;
  },

  renderCard(rec) {
    const totalMasuk = rec.items.reduce((s,i) => s + i.masuk, 0);
    const totalKeluar = rec.items.reduce((s,i) => s + i.keluar, 0);
    const totalRetur = rec.items.reduce((s,i) => s + i.retur, 0);
    return `
      <div class="card mb-6">
        <div class="card-header">
          <div class="card-title">${formatDate(rec.tanggal)}</div>
          <div style="display:flex;gap:16px;align-items:center">
            <span class="badge badge-success">+${totalMasuk} masuk</span>
            <span class="badge badge-info">-${totalKeluar} keluar</span>
            ${totalRetur > 0 ? `<span class="badge badge-danger">${totalRetur} retur</span>` : ''}
            <button class="btn btn-ghost btn-sm" onclick="STOK_HARIAN.showForm('${rec.id}')">Edit</button>
            <button class="btn-icon" onclick="STOK_HARIAN.delete('${rec.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>Produk</th><th>Stok Awal</th><th class="positive">Masuk (Pabrik)</th><th class="warning">Keluar (Market)</th><th class="negative">Retur/Rusak</th><th>Stok Akhir</th>
            </tr></thead>
            <tbody>
              ${rec.items.map(item => {
                const akhir = item.stok_awal + item.masuk - item.keluar - item.retur;
                return `<tr>
                  <td class="bold">${DATA.getProdukNama(item.produk_id)}</td>
                  <td>${item.stok_awal}</td>
                  <td class="positive">+${item.masuk}</td>
                  <td class="warning">-${item.keluar}</td>
                  <td class="${item.retur > 0 ? 'negative' : 'text-muted'}">${item.retur > 0 ? '-'+item.retur : '-'}</td>
                  <td class="bold">${akhir}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  showForm(id = null) {
    const produk = DATA.getProduk();
    const stokData = DB.get('stok') || {};
    const rec = id ? DATA.getMutasiGudang().find(r => r.id === id) : null;

    const itemsHtml = produk.map(p => {
      const item = rec ? rec.items.find(i => i.produk_id === p.id) : null;
      return `
        <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:10px">
          <div style="font-weight:600;color:var(--text-primary);margin-bottom:10px">${p.nama}</div>
          <div class="form-row" style="grid-template-columns:1fr 1fr 1fr 1fr">
            <div class="form-group" style="margin:0">
              <label class="form-label">Stok Awal</label>
              <input class="form-control" type="number" id="mg_awal_${p.id}" value="${item ? item.stok_awal : (stokData[p.id] || 0)}" min="0"/>
            </div>
            <div class="form-group" style="margin:0">
              <label class="form-label">Masuk</label>
              <input class="form-control" type="number" id="mg_masuk_${p.id}" value="${item ? item.masuk : 0}" min="0"/>
            </div>
            <div class="form-group" style="margin:0">
              <label class="form-label">Keluar</label>
              <input class="form-control" type="number" id="mg_keluar_${p.id}" value="${item ? item.keluar : 0}" min="0"/>
            </div>
            <div class="form-group" style="margin:0">
              <label class="form-label">Retur/Rusak</label>
              <input class="form-control" type="number" id="mg_retur_${p.id}" value="${item ? item.retur : 0}" min="0"/>
            </div>
          </div>
        </div>
      `;
    }).join('');

    APP.openModal(id ? 'Edit Mutasi Gudang' : 'Input Mutasi Gudang', `
      <div class="form-group">
        <label class="form-label">Tanggal</label>
        <input class="form-control" type="date" id="mg_tanggal" value="${rec ? rec.tanggal : today(0)}" />
      </div>
      <div style="margin-top:16px"><div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:12px">Mutasi Per Produk</div>${itemsHtml}</div>
    `, () => {
      const tanggal = document.getElementById('mg_tanggal').value;
      if (!tanggal) { APP.toast('Tanggal harus diisi', 'error'); return; }
      const items = produk.map(p => ({
        produk_id: p.id,
        stok_awal: parseInt(document.getElementById(`mg_awal_${p.id}`).value) || 0,
        masuk: parseInt(document.getElementById(`mg_masuk_${p.id}`).value) || 0,
        keluar: parseInt(document.getElementById(`mg_keluar_${p.id}`).value) || 0,
        retur: parseInt(document.getElementById(`mg_retur_${p.id}`).value) || 0
      }));
      // Update stok
      const newStok = {};
      produk.forEach(p => {
        const item = items.find(i => i.produk_id === p.id);
        newStok[p.id] = item.stok_awal + item.masuk - item.keluar - item.retur;
      });
      DB.set('stok', newStok);
      const data = { tanggal, items };
      if (rec) { DATA.updateItem('mutasi_gudang', id, data); APP.toast('Data diperbarui', 'success'); }
      else { DATA.addItem('mutasi_gudang', data); APP.toast('Mutasi berhasil disimpan', 'success'); }
      APP.closeModal(); APP.navigate('stok-harian');
    });
  },

  delete(id) {
    if (confirm('Hapus data mutasi ini?')) {
      DATA.deleteItem('mutasi_gudang', id);
      APP.toast('Data dihapus', 'warning');
      APP.navigate('stok-harian');
    }
  }
};

/* =============================================
   KAS HARIAN
   ============================================= */
const KAS_HARIAN = {
  render() {
    const records = DATA.getKasHarian().sort((a,b) => b.tanggal.localeCompare(a.tanggal));
    return `
      <div class="page-enter">
        <div class="section-header mb-6">
          <div>
            <h2 class="section-title">Laporan Kas Harian</h2>
            <p class="section-desc">Saldo kas, penerimaan, pengeluaran, dan setoran bank setiap hari</p>
          </div>
          <button class="btn btn-primary" onclick="KAS_HARIAN.showForm()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Input Kas
          </button>
        </div>

        ${records.length === 0 ? `<div class="card"><div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          <h3>Belum ada data kas</h3><p>Klik "Input Kas" untuk mulai mencatat</p>
        </div></div>` : records.map(rec => this.renderCard(rec)).join('')}
      </div>
    `;
  },

  renderCard(rec) {
    const saldoAkhir = rec.saldo_awal + rec.penerimaan_tunai + rec.penerimaan_piutang - rec.pengeluaran - rec.setoran_bank;
    return `
      <div class="card mb-6">
        <div class="card-header">
          <div class="card-title">${formatDate(rec.tanggal)}</div>
          <div style="display:flex;gap:8px;align-items:center">
            <div style="text-align:right">
              <div style="font-size:16px;font-weight:700;color:${saldoAkhir >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">${formatRpFull(saldoAkhir)}</div>
              <div style="font-size:11px;color:var(--text-muted)">Saldo Akhir</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="KAS_HARIAN.showForm('${rec.id}')">Edit</button>
            <button class="btn-icon" onclick="KAS_HARIAN.delete('${rec.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:2px">
          <div class="stat-row sub"><span class="stat-row-label">Saldo Kas Awal Hari</span><span class="stat-row-value">${formatRpFull(rec.saldo_awal)}</span></div>
          <div class="stat-row sub"><span class="stat-row-label" style="color:var(--accent-green)">+ Penerimaan Penjualan Tunai</span><span class="stat-row-value text-success">+${formatRpFull(rec.penerimaan_tunai)}</span></div>
          <div class="stat-row sub"><span class="stat-row-label" style="color:var(--accent-green)">+ Penerimaan Pembayaran Piutang</span><span class="stat-row-value text-success">+${formatRpFull(rec.penerimaan_piutang)}</span></div>
          <div class="stat-row sub"><span class="stat-row-label" style="color:var(--accent-orange)">- Pengeluaran (Operasional, BBM, dll)</span><span class="stat-row-value text-warning">-${formatRpFull(rec.pengeluaran)}</span></div>
          <div class="stat-row sub"><span class="stat-row-label" style="color:var(--accent-red)">- Setoran ke Bank</span><span class="stat-row-value text-danger">-${formatRpFull(rec.setoran_bank)}</span></div>
          <div class="stat-row highlight"><span class="stat-row-label">💰 Saldo Kas Akhir Hari</span><span class="stat-row-value">${formatRpFull(saldoAkhir)}</span></div>
        </div>
        ${rec.catatan ? `<div style="margin-top:10px;padding:10px;background:var(--bg-input);border-radius:var(--radius-sm);font-size:12px;color:var(--text-muted)">📝 ${rec.catatan}</div>` : ''}
      </div>
    `;
  },

  showForm(id = null) {
    const rec = id ? DATA.getKasHarian().find(r => r.id === id) : null;
    APP.openModal(id ? 'Edit Kas Harian' : 'Input Kas Harian', `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Tanggal</label><input class="form-control" type="date" id="kh_tgl" value="${rec ? rec.tanggal : today(0)}" /></div>
        <div class="form-group"><label class="form-label">Saldo Kas Awal (Rp)</label><input class="form-control" type="number" id="kh_awal" value="${rec ? rec.saldo_awal : 0}" min="0"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Penerimaan Tunai (Rp)</label><input class="form-control" type="number" id="kh_tunai" value="${rec ? rec.penerimaan_tunai : 0}" min="0"/></div>
        <div class="form-group"><label class="form-label">Penerimaan Piutang (Rp)</label><input class="form-control" type="number" id="kh_piutang" value="${rec ? rec.penerimaan_piutang : 0}" min="0"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Pengeluaran (Rp)</label><input class="form-control" type="number" id="kh_keluar" value="${rec ? rec.pengeluaran : 0}" min="0"/></div>
        <div class="form-group"><label class="form-label">Setoran ke Bank (Rp)</label><input class="form-control" type="number" id="kh_bank" value="${rec ? rec.setoran_bank : 0}" min="0"/></div>
      </div>
      <div class="form-group"><label class="form-label">Catatan</label><input class="form-control" type="text" id="kh_catatan" value="${rec ? rec.catatan : ''}" placeholder="Keterangan opsional..."/></div>
    `, () => {
      const data = {
        tanggal: document.getElementById('kh_tgl').value,
        saldo_awal: parseInt(document.getElementById('kh_awal').value) || 0,
        penerimaan_tunai: parseInt(document.getElementById('kh_tunai').value) || 0,
        penerimaan_piutang: parseInt(document.getElementById('kh_piutang').value) || 0,
        pengeluaran: parseInt(document.getElementById('kh_keluar').value) || 0,
        setoran_bank: parseInt(document.getElementById('kh_bank').value) || 0,
        catatan: document.getElementById('kh_catatan').value
      };
      if (!data.tanggal) { APP.toast('Tanggal harus diisi', 'error'); return; }
      if (rec) { DATA.updateItem('kas_harian', id, data); APP.toast('Kas diperbarui', 'success'); }
      else { DATA.addItem('kas_harian', data); APP.toast('Kas berhasil disimpan', 'success'); }
      APP.closeModal(); APP.navigate('kas-harian');
    });
  },

  delete(id) {
    if (confirm('Hapus data kas ini?')) {
      DATA.deleteItem('kas_harian', id);
      APP.toast('Data dihapus', 'warning');
      APP.navigate('kas-harian');
    }
  }
};

/* =============================================
   PENGIRIMAN & ARMADA HARIAN
   ============================================= */
const ARMADA_HARIAN = {
  render() {
    const records = DATA.getPengirimanHarian().sort((a,b) => b.tanggal.localeCompare(a.tanggal));
    return `
      <div class="page-enter">
        <div class="section-header mb-6">
          <div>
            <h2 class="section-title">Laporan Pengiriman & Armada</h2>
            <p class="section-desc">Data kendaraan, driver, rute, muatan, dan BBM setiap hari</p>
          </div>
          <button class="btn btn-primary" onclick="ARMADA_HARIAN.showForm()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Input Pengiriman
          </button>
        </div>

        ${records.length === 0 ? `<div class="card"><div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <h3>Belum ada data pengiriman</h3>
        </div></div>` : records.map(rec => this.renderCard(rec)).join('')}
      </div>
    `;
  },

  renderCard(rec) {
    const totalBBM = rec.items.reduce((s,i) => s + i.bbm, 0);
    const totalDrop = rec.items.reduce((s,i) => s + i.jumlah_drop, 0);
    return `
      <div class="card mb-6">
        <div class="card-header">
          <div class="card-title">${formatDate(rec.tanggal)}</div>
          <div style="display:flex;gap:12px;align-items:center">
            <span class="badge badge-info">${totalDrop} drop</span>
            <span class="badge badge-warning">BBM: ${formatRpFull(totalBBM)}</span>
            <button class="btn btn-ghost btn-sm" onclick="ARMADA_HARIAN.showForm('${rec.id}')">Edit</button>
            <button class="btn-icon" onclick="ARMADA_HARIAN.delete('${rec.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Kendaraan / Driver</th><th>Area / Rute</th><th>Jumlah Drop</th><th>Total Muatan</th><th>BBM (Rp)</th><th>Status</th></tr></thead>
            <tbody>
              ${rec.items.map(item => `
                <tr>
                  <td class="bold">${DATA.getKendaraanLabel(item.kendaraan_id)}</td>
                  <td>${item.area}</td>
                  <td>${item.jumlah_drop} toko</td>
                  <td>${item.total_muatan}</td>
                  <td>${formatRpFull(item.bbm)}</td>
                  <td><span class="badge ${item.status === 'Selesai' ? 'badge-success' : item.status === 'Proses' ? 'badge-warning' : 'badge-info'}">${item.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  showForm(id = null) {
    const kendaraan = DATA.getKendaraan();
    const rec = id ? DATA.getPengirimanHarian().find(r => r.id === id) : null;

    const itemsHtml = kendaraan.map((k, idx) => {
      const item = rec ? rec.items.find(i => i.kendaraan_id === k.id) : null;
      return `
        <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:10px">
          <div style="font-weight:600;color:var(--text-primary);margin-bottom:10px">${k.jenis} - ${k.driver}</div>
          <div class="form-row">
            <div class="form-group" style="margin:0"><label class="form-label">Area / Rute</label><input class="form-control" type="text" id="arm_area_${k.id}" value="${item ? item.area : k.area}" /></div>
            <div class="form-group" style="margin:0"><label class="form-label">Jumlah Drop (toko)</label><input class="form-control" type="number" id="arm_drop_${k.id}" value="${item ? item.jumlah_drop : 0}" min="0"/></div>
          </div>
          <div class="form-row">
            <div class="form-group" style="margin:0"><label class="form-label">Total Muatan</label><input class="form-control" type="text" id="arm_muatan_${k.id}" value="${item ? item.total_muatan : ''}" placeholder="cth: 150 galon" /></div>
            <div class="form-group" style="margin:0"><label class="form-label">BBM (Rp)</label><input class="form-control" type="number" id="arm_bbm_${k.id}" value="${item ? item.bbm : 0}" min="0"/></div>
          </div>
          <div class="form-group" style="margin:4px 0 0"><label class="form-label">Status</label>
            <select class="form-control" id="arm_status_${k.id}">
              <option ${(!item || item.status==='Berangkat')?'selected':''}>Berangkat</option>
              <option ${item && item.status==='Proses'?'selected':''}>Proses</option>
              <option ${item && item.status==='Selesai'?'selected':''}>Selesai</option>
            </select>
          </div>
        </div>
      `;
    }).join('');

    APP.openModal(id ? 'Edit Pengiriman' : 'Input Pengiriman Harian', `
      <div class="form-group"><label class="form-label">Tanggal</label><input class="form-control" type="date" id="arm_tgl" value="${rec ? rec.tanggal : today(0)}" /></div>
      <div style="margin-top:16px"><div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:12px">Per Kendaraan</div>${itemsHtml}</div>
    `, () => {
      const tanggal = document.getElementById('arm_tgl').value;
      if (!tanggal) { APP.toast('Tanggal harus diisi', 'error'); return; }
      const items = kendaraan.map(k => ({
        kendaraan_id: k.id,
        area: document.getElementById(`arm_area_${k.id}`).value,
        jumlah_drop: parseInt(document.getElementById(`arm_drop_${k.id}`).value) || 0,
        total_muatan: document.getElementById(`arm_muatan_${k.id}`).value,
        bbm: parseInt(document.getElementById(`arm_bbm_${k.id}`).value) || 0,
        status: document.getElementById(`arm_status_${k.id}`).value
      }));
      const data = { tanggal, items };
      if (rec) { DATA.updateItem('pengiriman_harian', id, data); APP.toast('Data diperbarui', 'success'); }
      else { DATA.addItem('pengiriman_harian', data); APP.toast('Pengiriman disimpan', 'success'); }
      APP.closeModal(); APP.navigate('armada-harian');
    });
  },

  delete(id) {
    if (confirm('Hapus data pengiriman ini?')) {
      DATA.deleteItem('pengiriman_harian', id);
      APP.toast('Data dihapus', 'warning');
      APP.navigate('armada-harian');
    }
  }
};

window.PENJUALAN_HARIAN = PENJUALAN_HARIAN;
window.STOK_HARIAN = STOK_HARIAN;
window.KAS_HARIAN = KAS_HARIAN;
window.ARMADA_HARIAN = ARMADA_HARIAN;
