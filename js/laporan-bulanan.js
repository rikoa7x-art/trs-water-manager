/**
 * AMDK Manager — Laporan Bulanan
 * P&L, Stock Opname, Piutang (AR), Hutang (AP), Pembelian, Kinerja Sales, Biaya Operasional
 */

/* =============================================
   LABA RUGI (P&L)
   ============================================= */
const LABA_RUGI = {
  charts: {},

  render() {
    const bulan = currentMonth();
    const records = DATA.getLabaRugi();
    const rec = records.find(r => r.bulan === bulan);
    const allRecords = records.sort((a,b) => b.bulan.localeCompare(a.bulan));

    return `
      <div class="page-enter">
        <div class="section-header mb-6">
          <div>
            <h2 class="section-title">Laporan Laba Rugi (P&L)</h2>
            <p class="section-desc">Evaluasi bulanan — apakah bisnis benar-benar untung setelah semua biaya</p>
          </div>
          <div style="display:flex;gap:10px">
            <div class="month-selector">
              <select id="plMonthSel" onchange="LABA_RUGI.renderByMonth(this.value)">
                ${this.monthOptions(records)}
              </select>
            </div>
            <button class="btn btn-primary" onclick="LABA_RUGI.showForm()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              ${rec ? 'Edit' : 'Input'} P&L
            </button>
          </div>
        </div>

        <div id="plContent">${this.renderDetail(rec, bulan)}</div>

        <!-- Tren 6 Bulan -->
        ${allRecords.length > 1 ? `
        <div class="card mt-6">
          <div class="card-header">
            <div class="card-title">Tren Laba Bersih 6 Bulan</div>
          </div>
          <div class="chart-container" style="height:220px">
            <canvas id="chartPLTrend"></canvas>
          </div>
        </div>` : ''}
      </div>
    `;
  },

  renderDetail(rec, bulan) {
    if (!rec) return `
      <div class="card">
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3v18h18"/><polyline points="18.5,8 12,12.5 8,10 3,14"/></svg>
          <h3>Belum ada data P&L untuk ${formatMonth(bulan)}</h3>
          <p>Klik "Input P&L" untuk memasukkan data bulan ini</p>
          <button class="btn btn-primary btn-sm mt-4" onclick="LABA_RUGI.showForm()">Input P&L</button>
        </div>
      </div>
    `;

    const labaKotor = rec.penjualan_bersih - rec.hpp;
    const labaBersih = labaKotor - rec.biaya_operasional - rec.biaya_penyusutan;
    const marginKotor = rec.penjualan_bersih > 0 ? ((labaKotor/rec.penjualan_bersih)*100).toFixed(1) : 0;
    const marginBersih = rec.penjualan_bersih > 0 ? ((labaBersih/rec.penjualan_bersih)*100).toFixed(1) : 0;

    return `
      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">P&L — ${formatMonth(rec.bulan)}</div>
              <div class="card-subtitle">Laporan Laba Rugi Bulanan</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="LABA_RUGI.showForm('${rec.id}')">Edit</button>
          </div>
          <div class="stat-row">
            <span class="stat-row-label">Penjualan Bersih</span>
            <span class="stat-row-value">${formatRpFull(rec.penjualan_bersih)}</span>
          </div>
          <div class="stat-row sub negative">
            <span class="stat-row-label">- Harga Pokok Penjualan (HPP)</span>
            <span class="stat-row-value text-danger">(${formatRpFull(rec.hpp)})</span>
          </div>
          <div class="stat-row highlight">
            <span class="stat-row-label">Laba Kotor</span>
            <span class="stat-row-value">${formatRpFull(labaKotor)} <span style="font-size:13px;color:var(--accent-cyan)">(${marginKotor}%)</span></span>
          </div>
          <div class="stat-row sub negative">
            <span class="stat-row-label">- Biaya Operasional</span>
            <span class="stat-row-value text-danger">(${formatRpFull(rec.biaya_operasional)})</span>
          </div>
          <div class="stat-row sub negative">
            <span class="stat-row-label">- Biaya Penyusutan Kendaraan</span>
            <span class="stat-row-value text-danger">(${formatRpFull(rec.biaya_penyusutan)})</span>
          </div>
          <div class="stat-row" style="border-top:2px solid var(--accent-green);padding-top:14px;margin-top:4px">
            <span class="stat-row-label" style="font-size:16px;font-weight:800;color:var(--text-primary)">💰 Laba Bersih Sebelum Pajak</span>
            <span style="font-size:20px;font-weight:800;color:${labaBersih >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">${formatRpFull(labaBersih)}</span>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card">
            <div class="card-title mb-4">📊 Margin Summary</div>
            <div style="display:flex;flex-direction:column;gap:14px">
              <div>
                <div class="flex-between mb-4">
                  <span style="font-size:13px;color:var(--text-secondary)">Margin Kotor</span>
                  <span style="font-weight:700;color:var(--accent-cyan)">${marginKotor}%</span>
                </div>
                <div class="progress-bar"><div class="progress-fill blue" style="width:${Math.min(100,marginKotor)}%"></div></div>
              </div>
              <div>
                <div class="flex-between mb-4">
                  <span style="font-size:13px;color:var(--text-secondary)">Margin Bersih</span>
                  <span style="font-weight:700;color:${parseFloat(marginBersih) >= 10 ? 'var(--accent-green)' : 'var(--accent-orange)'}">${marginBersih}%</span>
                </div>
                <div class="progress-bar"><div class="progress-fill ${parseFloat(marginBersih) >= 10 ? 'green' : 'orange'}" style="width:${Math.min(100, marginBersih*3)}%"></div></div>
              </div>
              <div>
                <div class="flex-between mb-4">
                  <span style="font-size:13px;color:var(--text-secondary)">Rasio HPP</span>
                  <span style="font-weight:700;color:var(--accent-orange)">${rec.penjualan_bersih > 0 ? ((rec.hpp/rec.penjualan_bersih)*100).toFixed(1) : 0}%</span>
                </div>
                <div class="progress-bar"><div class="progress-fill orange" style="width:${rec.penjualan_bersih > 0 ? Math.min(100,(rec.hpp/rec.penjualan_bersih)*100) : 0}%"></div></div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-title mb-4">Komposisi</div>
            <div class="chart-container" style="height:170px">
              <canvas id="chartPLKomposisi"></canvas>
            </div>
          </div>
        </div>
      </div>
      ${rec.catatan ? `<div class="card mt-4"><div style="font-size:13px;color:var(--text-muted)">📝 ${rec.catatan}</div></div>` : ''}
    `;
  },

  monthOptions(records) {
    const now = new Date();
    let opts = '';
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const hasData = records.some(r => r.bulan === val);
      opts += `<option value="${val}" ${i===0?'selected':''}>${formatMonth(val)}${hasData ? '' : ' (kosong)'}</option>`;
    }
    return opts;
  },

  renderByMonth(bulan) {
    const rec = DATA.getLabaRugi().find(r => r.bulan === bulan);
    document.getElementById('plContent').innerHTML = this.renderDetail(rec, bulan);
    setTimeout(() => this.initCharts(rec), 100);
  },

  initCharts(rec) {
    if (!rec) return;
    const labaKotor = rec.penjualan_bersih - rec.hpp;
    const labaBersih = labaKotor - rec.biaya_operasional - rec.biaya_penyusutan;

    const ctx = document.getElementById('chartPLKomposisi');
    if (ctx) {
      if (this.charts.komposisi) this.charts.komposisi.destroy();
      this.charts.komposisi = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['HPP', 'Biaya Ops', 'Penyusutan', 'Laba Bersih'],
          datasets: [{ data: [rec.hpp, rec.biaya_operasional, rec.biaya_penyusutan, Math.max(0, labaBersih)],
            backgroundColor: ['rgba(239,68,68,0.7)','rgba(249,115,22,0.7)','rgba(132,204,22,0.7)','rgba(22,163,74,0.8)'],
            borderColor: ['#ffffff','#ffffff','#ffffff','#ffffff'], borderWidth: 2 }]
        },
        options: { responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position:'bottom', labels:{ color:'#475569', font:{size:10}, padding:8 } },
            tooltip: { backgroundColor:'#0f172a', borderColor: '#334155', borderWidth: 1, titleColor: '#ffffff', bodyColor: '#94a3b8', callbacks:{ label: ctx => ` ${ctx.label}: ${formatRp(ctx.parsed)}` } } } }
      });
    }

    // Trend chart
    const allRecords = DATA.getLabaRugi().sort((a,b) => a.bulan.localeCompare(b.bulan)).slice(-6);
    const trendCtx = document.getElementById('chartPLTrend');
    if (trendCtx && allRecords.length > 0) {
      if (this.charts.trend) this.charts.trend.destroy();
      this.charts.trend = new Chart(trendCtx, {
        type: 'bar',
        data: {
          labels: allRecords.map(r => formatMonth(r.bulan)),
          datasets: [
            { label: 'Laba Kotor', data: allRecords.map(r => r.penjualan_bersih - r.hpp), backgroundColor: 'rgba(8,145,178,0.7)', borderColor:'#0891b2', borderWidth:1.5 },
            { label: 'Laba Bersih', data: allRecords.map(r => r.penjualan_bersih - r.hpp - r.biaya_operasional - r.biaya_penyusutan), backgroundColor: 'rgba(22,163,74,0.75)', borderColor:'#16a34a', borderWidth:1.5 }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false,
          plugins: { legend:{ labels:{ color:'#475569', font:{size:11} } }, tooltip:{ backgroundColor:'#0f172a', borderColor: '#334155', borderWidth: 1, titleColor: '#ffffff', bodyColor: '#94a3b8', callbacks:{ label: ctx => ` ${ctx.dataset.label}: ${formatRp(ctx.parsed.y)}` } } },
          scales: { x:{ grid:{ color:'#f1f5f9' }, ticks:{color:'#475569'} }, y:{ grid:{ color:'#f1f5f9' }, ticks:{ color:'#475569', callback: v => formatRp(v) } } } }
      });
    }
  },

  showForm(id = null) {
    const rec = id ? DATA.getLabaRugi().find(r => r.id === id) : null;
    const now = new Date();
    const defBulan = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    APP.openModal(id ? 'Edit Laba Rugi' : 'Input Laba Rugi Bulanan', `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Bulan</label>
          <select class="form-control" id="lr_bulan">
            ${Array.from({length:6},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-i,1);const v=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;return`<option value="${v}" ${(rec?rec.bulan:defBulan)===v?'selected':''}>${formatMonth(v)}</option>`;}).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Penjualan Bersih (Rp)</label><input class="form-control" type="number" id="lr_penjualan" value="${rec ? rec.penjualan_bersih : 0}" min="0"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">HPP dari Pabrik (Rp)</label><input class="form-control" type="number" id="lr_hpp" value="${rec ? rec.hpp : 0}" min="0"/></div>
        <div class="form-group"><label class="form-label">Biaya Operasional (Rp)</label><input class="form-control" type="number" id="lr_biaya" value="${rec ? rec.biaya_operasional : 0}" min="0"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Biaya Penyusutan (Rp)</label><input class="form-control" type="number" id="lr_penyusutan" value="${rec ? rec.biaya_penyusutan : 0}" min="0"/></div>
        <div class="form-group"><label class="form-label">Catatan</label><input class="form-control" type="text" id="lr_catatan" value="${rec ? rec.catatan : ''}" /></div>
      </div>
    `, () => {
      const data = { bulan: document.getElementById('lr_bulan').value, penjualan_bersih: parseInt(document.getElementById('lr_penjualan').value)||0, hpp: parseInt(document.getElementById('lr_hpp').value)||0, biaya_operasional: parseInt(document.getElementById('lr_biaya').value)||0, biaya_penyusutan: parseInt(document.getElementById('lr_penyusutan').value)||0, catatan: document.getElementById('lr_catatan').value };
      if (rec) { DATA.updateItem('laba_rugi', id, data); APP.toast('P&L diperbarui', 'success'); }
      else { DATA.addItem('laba_rugi', data); APP.toast('P&L disimpan', 'success'); }
      APP.closeModal(); APP.navigate('laba-rugi');
    });
  }
};

/* =============================================
   STOCK OPNAME
   ============================================= */
const STOCK_OPNAME = {
  render() {
    const records = DATA.getStockOpname().sort((a,b) => b.bulan.localeCompare(a.bulan));
    return `
      <div class="page-enter">
        <div class="section-header mb-6">
          <div><h2 class="section-title">Stock Opname Bulanan</h2><p class="section-desc">Stok sistem vs fisik — deteksi kebocoran (susut, rusak, hilang)</p></div>
          <button class="btn btn-primary" onclick="STOCK_OPNAME.showForm()">+ Input Opname</button>
        </div>
        ${records.length === 0 ? `<div class="card"><div class="empty-state"><h3>Belum ada data opname</h3></div></div>` :
          records.map(rec => this.renderCard(rec)).join('')}
      </div>
    `;
  },

  renderCard(rec) {
    const totalLoss = rec.items.reduce((s, item) => {
      const selisih = (item.stok_fisik||0) - item.stok_sistem;
      if (selisih < 0) {
        const p = DATA.getProdukById(item.produk_id);
        return s + (Math.abs(selisih) * (p ? p.harga_jual : 0));
      }
      return s;
    }, 0);

    return `
      <div class="card mb-6">
        <div class="card-header">
          <div class="card-title">Opname — ${formatMonth(rec.bulan)}</div>
          <div style="display:flex;gap:8px;align-items:center">
            ${totalLoss > 0 ? `<span class="badge badge-danger">Est. Kerugian: ${formatRp(totalLoss)}</span>` : `<span class="badge badge-success">✓ Tidak ada selisih</span>`}
            <button class="btn btn-ghost btn-sm" onclick="STOCK_OPNAME.showForm('${rec.id}')">Edit</button>
            <button class="btn-icon" onclick="STOCK_OPNAME.delete('${rec.id}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
          </div>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Produk</th><th>Stok Sistem</th><th>Stok Fisik</th><th>Selisih</th><th>Estimasi Kerugian</th></tr></thead>
            <tbody>
              ${rec.items.map(item => {
                const selisih = (item.stok_fisik||0) - item.stok_sistem;
                const p = DATA.getProdukById(item.produk_id);
                const kerugian = selisih < 0 ? Math.abs(selisih) * (p ? p.harga_jual : 0) : 0;
                return `<tr>
                  <td class="bold">${DATA.getProdukNama(item.produk_id)}</td>
                  <td>${item.stok_sistem}</td>
                  <td>${item.stok_fisik ?? '-'}</td>
                  <td class="${selisih < 0 ? 'negative' : selisih > 0 ? 'positive' : 'text-muted'}">${selisih > 0 ? '+' : ''}${selisih}</td>
                  <td class="${kerugian > 0 ? 'negative' : 'text-muted'}">${kerugian > 0 ? formatRpFull(kerugian) : '-'}</td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot>
              <tr class="table-summary">
                <td colspan="4">Total Estimasi Kerugian</td>
                <td class="${totalLoss > 0 ? 'negative' : 'positive'}">${totalLoss > 0 ? formatRpFull(totalLoss) : 'Rp 0'}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  },

  showForm(id = null) {
    const produk = DATA.getProduk();
    const rec = id ? DATA.getStockOpname().find(r => r.id === id) : null;
    const now = new Date();
    const defBulan = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const itemsHtml = produk.map(p => {
      const item = rec ? rec.items.find(i => i.produk_id === p.id) : null;
      return `<div class="form-row" style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;margin-bottom:8px">
        <div><span style="font-weight:600;color:var(--text-primary)">${p.nama}</span></div>
        <div class="form-group" style="margin:0"><label class="form-label">Stok Sistem</label><input class="form-control" type="number" id="so_sistem_${p.id}" value="${item ? item.stok_sistem : 0}" min="0"/></div>
        <div class="form-group" style="margin:0"><label class="form-label">Stok Fisik</label><input class="form-control" type="number" id="so_fisik_${p.id}" value="${item ? (item.stok_fisik??'') : ''}" min="0" placeholder="Hasil hitung fisik"/></div>
      </div>`;
    }).join('');
    APP.openModal(id ? 'Edit Stock Opname' : 'Input Stock Opname', `
      <div class="form-group"><label class="form-label">Bulan</label>
        <select class="form-control" id="so_bulan">
          ${Array.from({length:6},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-i,1);const v=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;return`<option value="${v}" ${(rec?rec.bulan:defBulan)===v?'selected':''}>${formatMonth(v)}</option>`;}).join('')}
        </select>
      </div>
      ${itemsHtml}
    `, () => {
      const items = produk.map(p => ({ produk_id: p.id, stok_sistem: parseInt(document.getElementById(`so_sistem_${p.id}`).value)||0, stok_fisik: parseInt(document.getElementById(`so_fisik_${p.id}`).value)||0 }));
      const data = { bulan: document.getElementById('so_bulan').value, items };
      if (rec) { DATA.updateItem('stock_opname', id, data); APP.toast('Opname diperbarui', 'success'); }
      else { DATA.addItem('stock_opname', data); APP.toast('Opname disimpan', 'success'); }
      APP.closeModal(); APP.navigate('stock-opname');
    });
  },

  delete(id) { if (confirm('Hapus data opname?')) { DATA.deleteItem('stock_opname', id); APP.toast('Dihapus','warning'); APP.navigate('stock-opname'); } }
};

/* =============================================
   PIUTANG (AR)
   ============================================= */
const PIUTANG_PAGE = {
  render() {
    const records = DATA.getPiutang().sort((a,b) => b.bulan.localeCompare(a.bulan));
    const totalPiutang = records.reduce((s,p) => s + p.total, 0);
    const piutangMacet = records.reduce((s,p) => s + (p.usia_gt60||0), 0);
    return `
      <div class="page-enter">
        <div class="section-header mb-6">
          <div><h2 class="section-title">Laporan Piutang Pelanggan (Aging AR)</h2><p class="section-desc">Pantau ketepatan pembayaran — piutang macet gerus cashflow</p></div>
          <button class="btn btn-primary" onclick="PIUTANG_PAGE.showForm()">+ Tambah Piutang</button>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card orange"><div class="kpi-icon orange"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg></div><div class="kpi-label">Total Piutang</div><div class="kpi-value">${formatRp(totalPiutang)}</div></div>
          <div class="kpi-card red"><div class="kpi-icon red"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg></div><div class="kpi-label">Piutang Macet (>60 hari)</div><div class="kpi-value">${formatRp(piutangMacet)}</div><div class="kpi-change ${piutangMacet > 0 ? 'down' : 'up'}">${piutangMacet > 0 ? '⚠️ Perlu tindakan' : '✓ Bersih'}</div></div>
          <div class="kpi-card green"><div class="kpi-icon green"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div class="kpi-label">Rasio Piutang Macet</div><div class="kpi-value">${totalPiutang > 0 ? ((piutangMacet/totalPiutang)*100).toFixed(1) : 0}%</div></div>
        </div>

        <div class="card">
          <div class="card-title mb-4">📋 Aging Piutang Per Pelanggan</div>
          ${records.length === 0 ? `<div class="empty-state"><h3>Belum ada data piutang</h3></div>` :
          `<div class="table-wrapper">
            <table>
              <thead><tr>
                <th>Pelanggan</th><th>Bulan</th><th>Total Piutang</th>
                <th style="color:#10b981">0-7 hari</th>
                <th style="color:#f59e0b">8-30 hari</th>
                <th style="color:#ef4444">31-60 hari</th>
                <th style="color:#dc2626">⚠️ >60 hari (Macet)</th>
                <th>Catatan</th><th></th>
              </tr></thead>
              <tbody>
                ${records.map(rec => `
                  <tr>
                    <td class="bold">${DATA.getPelangganNama(rec.pelanggan_id)}</td>
                    <td>${formatMonth(rec.bulan)}</td>
                    <td class="bold">${formatRpFull(rec.total)}</td>
                    <td class="positive">${rec.usia_0_7 > 0 ? formatRpFull(rec.usia_0_7) : '-'}</td>
                    <td class="warning">${rec.usia_8_30 > 0 ? formatRpFull(rec.usia_8_30) : '-'}</td>
                    <td class="negative">${rec.usia_31_60 > 0 ? formatRpFull(rec.usia_31_60) : '-'}</td>
                    <td class="negative bold">${rec.usia_gt60 > 0 ? `⚠️ ${formatRpFull(rec.usia_gt60)}` : '-'}</td>
                    <td class="text-muted text-sm">${rec.catatan || '-'}</td>
                    <td>
                      <button class="btn btn-ghost btn-xs" onclick="PIUTANG_PAGE.showForm('${rec.id}')">Edit</button>
                      <button class="btn-icon" onclick="PIUTANG_PAGE.delete('${rec.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="table-summary">
                  <td colspan="2" class="font-bold">TOTAL</td>
                  <td class="font-bold">${formatRpFull(totalPiutang)}</td>
                  <td class="positive">${formatRp(records.reduce((s,r)=>s+(r.usia_0_7||0),0))}</td>
                  <td class="warning">${formatRp(records.reduce((s,r)=>s+(r.usia_8_30||0),0))}</td>
                  <td class="negative">${formatRp(records.reduce((s,r)=>s+(r.usia_31_60||0),0))}</td>
                  <td class="negative">${formatRp(piutangMacet)}</td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>`}
        </div>
      </div>
    `;
  },

  showForm(id = null) {
    const rec = id ? DATA.getPiutang().find(r => r.id === id) : null;
    const pelanggan = DATA.getPelanggan();
    const now = new Date();
    const defBulan = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    APP.openModal(id ? 'Edit Piutang' : 'Tambah Piutang', `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Pelanggan</label>
          <select class="form-control" id="ar_pelanggan">
            ${pelanggan.map(p => `<option value="${p.id}" ${rec&&rec.pelanggan_id===p.id?'selected':''}>${p.nama}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Bulan</label>
          <select class="form-control" id="ar_bulan">
            ${Array.from({length:6},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-i,1);const v=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;return`<option value="${v}" ${(rec?rec.bulan:defBulan)===v?'selected':''}>${formatMonth(v)}</option>`;}).join('')}
          </select>
        </div>
      </div>
      <div class="form-group"><label class="form-label">Total Piutang (Rp)</label><input class="form-control" type="number" id="ar_total" value="${rec ? rec.total : 0}" min="0"/></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">0-7 hari (Rp)</label><input class="form-control" type="number" id="ar_07" value="${rec ? rec.usia_0_7 : 0}" min="0"/></div>
        <div class="form-group"><label class="form-label">8-30 hari (Rp)</label><input class="form-control" type="number" id="ar_830" value="${rec ? rec.usia_8_30 : 0}" min="0"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">31-60 hari (Rp)</label><input class="form-control" type="number" id="ar_3160" value="${rec ? rec.usia_31_60 : 0}" min="0"/></div>
        <div class="form-group"><label class="form-label">>60 hari / Macet (Rp)</label><input class="form-control" type="number" id="ar_gt60" value="${rec ? rec.usia_gt60 : 0}" min="0"/></div>
      </div>
      <div class="form-group"><label class="form-label">Catatan</label><input class="form-control" type="text" id="ar_catatan" value="${rec ? rec.catatan : ''}" /></div>
    `, () => {
      const data = { pelanggan_id: document.getElementById('ar_pelanggan').value, bulan: document.getElementById('ar_bulan').value, total: parseInt(document.getElementById('ar_total').value)||0, usia_0_7: parseInt(document.getElementById('ar_07').value)||0, usia_8_30: parseInt(document.getElementById('ar_830').value)||0, usia_31_60: parseInt(document.getElementById('ar_3160').value)||0, usia_gt60: parseInt(document.getElementById('ar_gt60').value)||0, catatan: document.getElementById('ar_catatan').value };
      if (rec) { DATA.updateItem('piutang', id, data); APP.toast('Piutang diperbarui','success'); }
      else { DATA.addItem('piutang', data); APP.toast('Piutang disimpan','success'); }
      APP.closeModal(); APP.navigate('piutang');
    });
  },

  delete(id) { if (confirm('Hapus data piutang?')) { DATA.deleteItem('piutang', id); APP.toast('Dihapus','warning'); APP.navigate('piutang'); } }
};

/* =============================================
   HUTANG (AP)
   ============================================= */
const HUTANG_PAGE = {
  render() {
    const records = DATA.getHutang().sort((a,b) => b.bulan.localeCompare(a.bulan));
    const totalHutang = records.reduce((s,h) => s + h.total, 0);
    const terlambat = records.filter(h => h.status === 'Terlambat');
    return `
      <div class="page-enter">
        <div class="section-header mb-6">
          <div><h2 class="section-title">Laporan Hutang ke Pabrik (Aging AP)</h2><p class="section-desc">Pantau kewajiban ke supplier dan jatuh tempo pembayaran</p></div>
          <button class="btn btn-primary" onclick="HUTANG_PAGE.showForm()">+ Tambah Hutang</button>
        </div>

        ${terlambat.length > 0 ? `
        <div class="alert-box danger mb-6">
          <div class="alert-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
          <div><strong>⚠️ ${terlambat.length} Hutang Terlambat!</strong><br/>
          ${terlambat.map(h => `${DATA.getSupplierNama(h.supplier_id)}: ${formatRpFull(h.total)}`).join(' | ')}
          </div>
        </div>` : ''}

        <div class="card">
          <div class="card-title mb-4">📋 Data Hutang ke Pabrik</div>
          ${records.length === 0 ? `<div class="empty-state"><h3>Belum ada data hutang</h3></div>` :
          `<div class="table-wrapper">
            <table>
              <thead><tr><th>Supplier / Pabrik</th><th>Bulan</th><th>Total Hutang</th><th>Jatuh Tempo</th><th>Status</th><th>Catatan</th><th></th></tr></thead>
              <tbody>
                ${records.map(rec => `
                  <tr>
                    <td class="bold">${DATA.getSupplierNama(rec.supplier_id)}</td>
                    <td>${formatMonth(rec.bulan)}</td>
                    <td class="bold">${formatRpFull(rec.total)}</td>
                    <td>${formatDate(rec.jatuh_tempo)}</td>
                    <td><span class="badge ${rec.status==='Terlambat'?'badge-danger':rec.status==='Lunas'?'badge-success':'badge-warning'}">${rec.status}</span></td>
                    <td class="text-muted text-sm">${rec.catatan||'-'}</td>
                    <td>
                      <button class="btn btn-ghost btn-xs" onclick="HUTANG_PAGE.showForm('${rec.id}')">Edit</button>
                      <button class="btn-icon" onclick="HUTANG_PAGE.delete('${rec.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot><tr class="table-summary"><td colspan="2">TOTAL</td><td>${formatRpFull(totalHutang)}</td><td colspan="4"></td></tr></tfoot>
            </table>
          </div>`}
        </div>
      </div>
    `;
  },

  showForm(id = null) {
    const rec = id ? DATA.getHutang().find(r => r.id === id) : null;
    const supplier = DATA.getSupplier();
    const now = new Date();
    const defBulan = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    APP.openModal(id ? 'Edit Hutang' : 'Tambah Hutang', `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Supplier / Pabrik</label>
          <select class="form-control" id="ap_supplier">
            ${supplier.map(s => `<option value="${s.id}" ${rec&&rec.supplier_id===s.id?'selected':''}>${s.nama}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Bulan</label>
          <select class="form-control" id="ap_bulan">
            ${Array.from({length:6},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-i,1);const v=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;return`<option value="${v}" ${(rec?rec.bulan:defBulan)===v?'selected':''}>${formatMonth(v)}</option>`;}).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Total Hutang (Rp)</label><input class="form-control" type="number" id="ap_total" value="${rec ? rec.total : 0}" min="0"/></div>
        <div class="form-group"><label class="form-label">Jatuh Tempo</label><input class="form-control" type="date" id="ap_jatuh" value="${rec ? rec.jatuh_tempo : ''}" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-control" id="ap_status">
            ${['Belum jatuh tempo','Jatuh tempo','Terlambat','Lunas'].map(s=>`<option ${rec&&rec.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Catatan</label><input class="form-control" type="text" id="ap_catatan" value="${rec ? rec.catatan : ''}" /></div>
      </div>
    `, () => {
      const data = { supplier_id: document.getElementById('ap_supplier').value, bulan: document.getElementById('ap_bulan').value, total: parseInt(document.getElementById('ap_total').value)||0, jatuh_tempo: document.getElementById('ap_jatuh').value, status: document.getElementById('ap_status').value, catatan: document.getElementById('ap_catatan').value };
      if (rec) { DATA.updateItem('hutang', id, data); APP.toast('Hutang diperbarui','success'); }
      else { DATA.addItem('hutang', data); APP.toast('Hutang disimpan','success'); }
      APP.closeModal(); APP.navigate('hutang');
    });
  },

  delete(id) { if (confirm('Hapus data hutang?')) { DATA.deleteItem('hutang', id); APP.toast('Dihapus','warning'); APP.navigate('hutang'); } }
};

/* =============================================
   PEMBELIAN DARI PABRIK
   ============================================= */
const PEMBELIAN_PAGE = {
  render() {
    const records = DATA.getPembelian().sort((a,b) => b.bulan.localeCompare(a.bulan));
    return `
      <div class="page-enter">
        <div class="section-header mb-6">
          <div><h2 class="section-title">Laporan Pembelian dari Pabrik</h2><p class="section-desc">Pantau harga beli, kuantitas, dan ketepatan pengiriman supplier</p></div>
          <button class="btn btn-primary" onclick="PEMBELIAN_PAGE.showForm()">+ Tambah Pembelian</button>
        </div>
        ${records.length === 0 ? `<div class="card"><div class="empty-state"><h3>Belum ada data pembelian</h3></div></div>` :
          records.map(rec => this.renderCard(rec)).join('')}
      </div>
    `;
  },

  renderCard(rec) {
    const total = rec.items.reduce((s,i) => s + (i.qty * i.harga_beli), 0);
    return `
      <div class="card mb-6">
        <div class="card-header">
          <div><div class="card-title">${formatMonth(rec.bulan)} — ${DATA.getSupplierNama(rec.supplier_id)}</div></div>
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:16px;font-weight:700;color:var(--accent-orange)">${formatRp(total)}</span>
            <button class="btn btn-ghost btn-sm" onclick="PEMBELIAN_PAGE.showForm('${rec.id}')">Edit</button>
            <button class="btn-icon" onclick="PEMBELIAN_PAGE.delete('${rec.id}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
          </div>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Produk</th><th>Qty Dibeli</th><th>Harga Beli/Unit</th><th>Total Pembelian</th><th>Rata-rata Lead Time</th></tr></thead>
            <tbody>
              ${rec.items.map(item => `
                <tr>
                  <td class="bold">${DATA.getProdukNama(item.produk_id)}</td>
                  <td>${item.qty.toLocaleString('id-ID')}</td>
                  <td>${formatRpFull(item.harga_beli)}</td>
                  <td class="warning bold">${formatRpFull(item.qty * item.harga_beli)}</td>
                  <td>${item.lead_time} hari</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot><tr class="table-summary"><td colspan="3">TOTAL PEMBELIAN</td><td class="warning">${formatRpFull(total)}</td><td></td></tr></tfoot>
          </table>
        </div>
      </div>
    `;
  },

  showForm(id = null) {
    const produk = DATA.getProduk();
    const supplier = DATA.getSupplier();
    const rec = id ? DATA.getPembelian().find(r => r.id === id) : null;
    const now = new Date();
    const defBulan = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const itemsHtml = produk.map(p => {
      const item = rec ? rec.items.find(i => i.produk_id === p.id) : null;
      return `<div style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;margin-bottom:8px">
        <div style="font-weight:600;color:var(--text-primary);margin-bottom:8px">${p.nama}</div>
        <div class="form-row-3">
          <div class="form-group" style="margin:0"><label class="form-label">Qty</label><input class="form-control" type="number" id="pb_qty_${p.id}" value="${item?item.qty:0}" min="0"/></div>
          <div class="form-group" style="margin:0"><label class="form-label">Harga Beli (Rp)</label><input class="form-control" type="number" id="pb_harga_${p.id}" value="${item?item.harga_beli:p.harga_beli}" min="0"/></div>
          <div class="form-group" style="margin:0"><label class="form-label">Lead Time (hari)</label><input class="form-control" type="number" id="pb_lead_${p.id}" value="${item?item.lead_time:2}" min="0"/></div>
        </div>
      </div>`;
    }).join('');
    APP.openModal(id ? 'Edit Pembelian' : 'Input Pembelian', `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Bulan</label>
          <select class="form-control" id="pb_bulan">
            ${Array.from({length:6},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-i,1);const v=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;return`<option value="${v}" ${(rec?rec.bulan:defBulan)===v?'selected':''}>${formatMonth(v)}</option>`;}).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Supplier</label>
          <select class="form-control" id="pb_supplier">
            ${supplier.map(s => `<option value="${s.id}" ${rec&&rec.supplier_id===s.id?'selected':''}>${s.nama}</option>`).join('')}
          </select>
        </div>
      </div>
      ${itemsHtml}
    `, () => {
      const items = produk.map(p => ({ produk_id: p.id, qty: parseInt(document.getElementById(`pb_qty_${p.id}`).value)||0, harga_beli: parseInt(document.getElementById(`pb_harga_${p.id}`).value)||0, lead_time: parseInt(document.getElementById(`pb_lead_${p.id}`).value)||0 }));
      const data = { bulan: document.getElementById('pb_bulan').value, supplier_id: document.getElementById('pb_supplier').value, items };
      if (rec) { DATA.updateItem('pembelian', id, data); APP.toast('Pembelian diperbarui','success'); }
      else { DATA.addItem('pembelian', data); APP.toast('Pembelian disimpan','success'); }
      APP.closeModal(); APP.navigate('pembelian');
    });
  },

  delete(id) { if (confirm('Hapus?')) { DATA.deleteItem('pembelian', id); APP.toast('Dihapus','warning'); APP.navigate('pembelian'); } }
};

/* =============================================
   KINERJA SALES
   ============================================= */
const KINERJA_SALES = {
  render() {
    const records = DATA.getKinerjaSales().sort((a,b) => b.bulan.localeCompare(a.bulan));
    return `
      <div class="page-enter">
        <div class="section-header mb-6">
          <div><h2 class="section-title">Laporan Kinerja Sales & Area</h2><p class="section-desc">Target vs realisasi, customer aktif dan baru per sales</p></div>
          <button class="btn btn-primary" onclick="KINERJA_SALES.showForm()">+ Tambah Kinerja</button>
        </div>
        <div class="card">
          ${records.length === 0 ? `<div class="empty-state"><h3>Belum ada data kinerja sales</h3></div>` :
          `<div class="table-wrapper">
            <table>
              <thead><tr><th>Sales / Area</th><th>Bulan</th><th>Target Omzet</th><th>Realisasi</th><th>Pencapaian</th><th>Customer Aktif</th><th>Customer Baru</th><th></th></tr></thead>
              <tbody>
                ${records.map(rec => {
                  const pct = rec.target > 0 ? Math.round((rec.realisasi/rec.target)*100) : 0;
                  return `<tr>
                    <td class="bold">${DATA.getSalesNama(rec.sales_id)}</td>
                    <td>${formatMonth(rec.bulan)}</td>
                    <td>${formatRpFull(rec.target)}</td>
                    <td class="bold">${formatRpFull(rec.realisasi)}</td>
                    <td>
                      <div style="display:flex;align-items:center;gap:10px">
                        <span class="badge ${pct>=95?'badge-success':pct>=80?'badge-warning':'badge-danger'}">${pct}%</span>
                        <div style="width:80px"><div class="progress-bar"><div class="progress-fill ${pct>=95?'green':pct>=80?'orange':'red'}" style="width:${pct}%"></div></div></div>
                      </div>
                    </td>
                    <td>${rec.customer_aktif}</td>
                    <td class="positive">+${rec.customer_baru}</td>
                    <td>
                      <button class="btn btn-ghost btn-xs" onclick="KINERJA_SALES.showForm('${rec.id}')">Edit</button>
                      <button class="btn-icon" onclick="KINERJA_SALES.delete('${rec.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`}
        </div>
      </div>
    `;
  },

  showForm(id = null) {
    const rec = id ? DATA.getKinerjaSales().find(r => r.id === id) : null;
    const sales = DATA.getSales();
    const now = new Date();
    const defBulan = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    APP.openModal(id ? 'Edit Kinerja Sales' : 'Input Kinerja Sales', `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Sales</label>
          <select class="form-control" id="ks_sales">
            ${sales.map(s => `<option value="${s.id}" ${rec&&rec.sales_id===s.id?'selected':''}>${s.nama} (${s.area})</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Bulan</label>
          <select class="form-control" id="ks_bulan">
            ${Array.from({length:6},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-i,1);const v=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;return`<option value="${v}" ${(rec?rec.bulan:defBulan)===v?'selected':''}>${formatMonth(v)}</option>`;}).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Target Omzet (Rp)</label><input class="form-control" type="number" id="ks_target" value="${rec ? rec.target : 0}" min="0"/></div>
        <div class="form-group"><label class="form-label">Realisasi (Rp)</label><input class="form-control" type="number" id="ks_realisasi" value="${rec ? rec.realisasi : 0}" min="0"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Jumlah Customer Aktif</label><input class="form-control" type="number" id="ks_aktif" value="${rec ? rec.customer_aktif : 0}" min="0"/></div>
        <div class="form-group"><label class="form-label">Customer Baru</label><input class="form-control" type="number" id="ks_baru" value="${rec ? rec.customer_baru : 0}" min="0"/></div>
      </div>
      <div class="form-group"><label class="form-label">Catatan</label><input class="form-control" type="text" id="ks_catatan" value="${rec ? rec.catatan : ''}"/></div>
    `, () => {
      const data = { sales_id: document.getElementById('ks_sales').value, bulan: document.getElementById('ks_bulan').value, target: parseInt(document.getElementById('ks_target').value)||0, realisasi: parseInt(document.getElementById('ks_realisasi').value)||0, customer_aktif: parseInt(document.getElementById('ks_aktif').value)||0, customer_baru: parseInt(document.getElementById('ks_baru').value)||0, catatan: document.getElementById('ks_catatan').value };
      if (rec) { DATA.updateItem('kinerja_sales', id, data); APP.toast('Kinerja diperbarui','success'); }
      else { DATA.addItem('kinerja_sales', data); APP.toast('Kinerja disimpan','success'); }
      APP.closeModal(); APP.navigate('kinerja-sales');
    });
  },

  delete(id) { if (confirm('Hapus?')) { DATA.deleteItem('kinerja_sales', id); APP.toast('Dihapus','warning'); APP.navigate('kinerja-sales'); } }
};

/* =============================================
   BIAYA OPERASIONAL
   ============================================= */
const BIAYA_OPERASIONAL = {
  render() {
    const records = DATA.getBiayaOperasional().sort((a,b) => b.bulan.localeCompare(a.bulan));
    return `
      <div class="page-enter">
        <div class="section-header mb-6">
          <div><h2 class="section-title">Laporan Biaya Operasional</h2><p class="section-desc">Gaji, BBM, sewa, pemeliharaan kendaraan, listrik, dan biaya lain-lain</p></div>
          <button class="btn btn-primary" onclick="BIAYA_OPERASIONAL.showForm()">+ Input Biaya</button>
        </div>
        ${records.length === 0 ? `<div class="card"><div class="empty-state"><h3>Belum ada data biaya</h3></div></div>` :
          records.map(rec => this.renderCard(rec)).join('')}
      </div>
    `;
  },

  renderCard(rec) {
    const totalBulanIni = rec.gaji_insentif + rec.bbm_tol + rec.sewa_gudang + rec.pemeliharaan + rec.listrik_lain;
    const totalBulanLalu = rec.gaji_bulan_lalu + rec.bbm_bulan_lalu + rec.sewa_bulan_lalu + rec.pemeliharaan_bulan_lalu + rec.listrik_bulan_lalu;
    const selisih = totalBulanIni - totalBulanLalu;
    return `
      <div class="card mb-6">
        <div class="card-header">
          <div class="card-title">${formatMonth(rec.bulan)}</div>
          <div style="display:flex;gap:8px;align-items:center">
            <div style="text-align:right">
              <div style="font-size:16px;font-weight:700;color:var(--accent-orange)">${formatRpFull(totalBulanIni)}</div>
              <div style="font-size:11px;color:${selisih>0?'var(--accent-red)':'var(--accent-green)'}">
                ${selisih > 0 ? `+${formatRp(selisih)} vs bulan lalu` : selisih < 0 ? `${formatRp(selisih)} vs bulan lalu` : 'sama dengan bulan lalu'}
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="BIAYA_OPERASIONAL.showForm('${rec.id}')">Edit</button>
          </div>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Kategori Biaya</th><th>Bulan Ini</th><th>Bulan Lalu</th><th>Selisih</th></tr></thead>
            <tbody>
              ${[
                ['Gaji & Insentif', rec.gaji_insentif, rec.gaji_bulan_lalu],
                ['BBM & Tol', rec.bbm_tol, rec.bbm_bulan_lalu],
                ['Sewa Gudang', rec.sewa_gudang, rec.sewa_bulan_lalu],
                ['Pemeliharaan Kendaraan', rec.pemeliharaan, rec.pemeliharaan_bulan_lalu],
                ['Listrik & Lain-lain', rec.listrik_lain, rec.listrik_bulan_lalu]
              ].map(([label, ini, lalu]) => {
                const sel = ini - lalu;
                return `<tr>
                  <td class="bold">${label}</td>
                  <td>${formatRpFull(ini)}</td>
                  <td class="text-muted">${formatRpFull(lalu)}</td>
                  <td class="${sel > 0 ? 'negative' : sel < 0 ? 'positive' : 'text-muted'}">${sel !== 0 ? (sel > 0 ? '+' : '') + formatRpFull(sel) : '-'}</td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot><tr class="table-summary"><td>TOTAL</td><td>${formatRpFull(totalBulanIni)}</td><td>${formatRpFull(totalBulanLalu)}</td><td class="${selisih>0?'negative':selisih<0?'positive':'text-muted'}">${selisih!==0?(selisih>0?'+':'')+formatRpFull(selisih):'-'}</td></tr></tfoot>
          </table>
        </div>
      </div>
    `;
  },

  showForm(id = null) {
    const rec = id ? DATA.getBiayaOperasional().find(r => r.id === id) : null;
    const now = new Date();
    const defBulan = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    APP.openModal(id ? 'Edit Biaya Operasional' : 'Input Biaya Operasional', `
      <div class="form-group"><label class="form-label">Bulan</label>
        <select class="form-control" id="bo_bulan">
          ${Array.from({length:6},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-i,1);const v=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;return`<option value="${v}" ${(rec?rec.bulan:defBulan)===v?'selected':''}>${formatMonth(v)}</option>`;}).join('')}
        </select>
      </div>
      <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin:12px 0 8px">Bulan Ini</div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Gaji & Insentif</label><input class="form-control" type="number" id="bo_gaji" value="${rec?rec.gaji_insentif:0}" min="0"/></div>
        <div class="form-group"><label class="form-label">BBM & Tol</label><input class="form-control" type="number" id="bo_bbm" value="${rec?rec.bbm_tol:0}" min="0"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Sewa Gudang</label><input class="form-control" type="number" id="bo_sewa" value="${rec?rec.sewa_gudang:0}" min="0"/></div>
        <div class="form-group"><label class="form-label">Pemeliharaan Kendaraan</label><input class="form-control" type="number" id="bo_pmh" value="${rec?rec.pemeliharaan:0}" min="0"/></div>
      </div>
      <div class="form-group"><label class="form-label">Listrik & Lain-lain</label><input class="form-control" type="number" id="bo_listrik" value="${rec?rec.listrik_lain:0}" min="0"/></div>
      <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin:12px 0 8px">Bulan Lalu (Pembanding)</div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Gaji & Insentif</label><input class="form-control" type="number" id="bo_gaji_l" value="${rec?rec.gaji_bulan_lalu:0}" min="0"/></div>
        <div class="form-group"><label class="form-label">BBM & Tol</label><input class="form-control" type="number" id="bo_bbm_l" value="${rec?rec.bbm_bulan_lalu:0}" min="0"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Sewa Gudang</label><input class="form-control" type="number" id="bo_sewa_l" value="${rec?rec.sewa_bulan_lalu:0}" min="0"/></div>
        <div class="form-group"><label class="form-label">Pemeliharaan</label><input class="form-control" type="number" id="bo_pmh_l" value="${rec?rec.pemeliharaan_bulan_lalu:0}" min="0"/></div>
      </div>
      <div class="form-group"><label class="form-label">Listrik & Lain-lain</label><input class="form-control" type="number" id="bo_listrik_l" value="${rec?rec.listrik_bulan_lalu:0}" min="0"/></div>
    `, () => {
      const data = { bulan: document.getElementById('bo_bulan').value, gaji_insentif: parseInt(document.getElementById('bo_gaji').value)||0, bbm_tol: parseInt(document.getElementById('bo_bbm').value)||0, sewa_gudang: parseInt(document.getElementById('bo_sewa').value)||0, pemeliharaan: parseInt(document.getElementById('bo_pmh').value)||0, listrik_lain: parseInt(document.getElementById('bo_listrik').value)||0, gaji_bulan_lalu: parseInt(document.getElementById('bo_gaji_l').value)||0, bbm_bulan_lalu: parseInt(document.getElementById('bo_bbm_l').value)||0, sewa_bulan_lalu: parseInt(document.getElementById('bo_sewa_l').value)||0, pemeliharaan_bulan_lalu: parseInt(document.getElementById('bo_pmh_l').value)||0, listrik_bulan_lalu: parseInt(document.getElementById('bo_listrik_l').value)||0 };
      if (rec) { DATA.updateItem('biaya_operasional', id, data); APP.toast('Biaya diperbarui','success'); }
      else { DATA.addItem('biaya_operasional', data); APP.toast('Biaya disimpan','success'); }
      APP.closeModal(); APP.navigate('biaya-operasional');
    });
  }
};

window.LABA_RUGI = LABA_RUGI;
window.STOCK_OPNAME = STOCK_OPNAME;
window.PIUTANG_PAGE = PIUTANG_PAGE;
window.HUTANG_PAGE = HUTANG_PAGE;
window.PEMBELIAN_PAGE = PEMBELIAN_PAGE;
window.KINERJA_SALES = KINERJA_SALES;
window.BIAYA_OPERASIONAL = BIAYA_OPERASIONAL;
