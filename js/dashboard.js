/**
 * AMDK Manager — Dashboard & KPI
 */

const DASHBOARD = {
  chartInstance: null,

  render() {
    const stats = DATA.getDashboardStats();
    const alerts = DATA.getAlerts();
    const trend = DATA.getOmzetTrend();

    const omzetChange = stats.omzetKemarin > 0
      ? Math.round(((stats.omzetHariIni - stats.omzetKemarin) / stats.omzetKemarin) * 100) : 0;

    return `
      <div class="page-enter">
        <!-- KPI Cards -->
        <div class="kpi-grid">
          ${this.kpiCard('blue', `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
            'Omzet Hari Ini', formatRp(stats.omzetHariIni),
            omzetChange, 'vs kemarin')}
          ${this.kpiCard('green', `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
            'Saldo Kas', formatRp(stats.saldoKas), null, 'hari ini')}
          ${this.kpiCard('cyan', `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><polyline points="18.5,8 12,12.5 8,10 3,14"/></svg>`,
            'Omzet Bulanan', formatRp(stats.omzetBulanan), null, currentMonth())}
          ${this.kpiCard('purple', `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="16,12 12,8 8,12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>`,
            'Laba Bersih', formatRp(stats.labaBersih), null, `Margin ${stats.marginBersih}%`)}
          ${this.kpiCard(stats.piutangMacet > 0 ? 'red' : 'orange', `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg>`,
            'Total Piutang', formatRp(stats.totalPiutang), null, `Macet: ${formatRp(stats.piutangMacet)}`)}
          ${this.kpiCard(stats.hutangTerlambat > 0 ? 'red' : 'orange', `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
            'Total Hutang', formatRp(stats.totalHutang), null, `Terlambat: ${formatRp(stats.hutangTerlambat)}`)}
        </div>

        <!-- Alerts -->
        ${alerts.length > 0 ? `
        <div class="mb-6">
          <div class="section-header">
            <div>
              <h2 class="section-title">⚠️ Perhatian Diperlukan</h2>
              <p class="section-desc">${alerts.length} item membutuhkan tindakan segera</p>
            </div>
          </div>
          <div class="alert-list">
            ${alerts.map(a => `
              <div class="alert-item ${a.type}">
                <div class="alert-item-icon">
                  ${a.type === 'danger' ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>` :
                    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`}
                </div>
                <div class="alert-item-content">
                  <div class="alert-item-title">${a.title}</div>
                  <div class="alert-item-desc">${a.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        <!-- Charts & Info Grid -->
        <div class="dashboard-grid">
          <!-- Trend Chart -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Tren Omzet 7 Hari Terakhir</div>
                <div class="card-subtitle">Penjualan harian dalam Rupiah</div>
              </div>
            </div>
            <div class="chart-container" style="height:240px">
              <canvas id="chartTrendOmzet"></canvas>
            </div>
          </div>

          <!-- Right Column -->
          <div style="display:flex;flex-direction:column;gap:16px">
            <!-- Produk Summary -->
            <div class="card">
              <div class="card-header">
                <div class="card-title">Stok Produk</div>
                <a href="#stok-harian" class="text-sm text-info">Lihat detail →</a>
              </div>
              ${this.renderStokMini()}
            </div>

            <!-- Quick Links -->
            <div class="card">
              <div class="card-title" style="margin-bottom:14px">Akses Cepat</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                ${[
                  ['#penjualan-harian','📊','Penjualan'],
                  ['#kas-harian','💰','Kas Harian'],
                  ['#piutang','📋','Piutang'],
                  ['#laba-rugi','📈','Laba Rugi'],
                ].map(([href, icon, label]) => `
                  <a href="${href}" class="quick-link-btn" style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);text-decoration:none;color:var(--text-secondary);font-size:13px;font-weight:500;transition:var(--transition)" onmouseover="this.style.background='var(--bg-card-hover)';this.style.color='var(--text-primary)'" onmouseout="this.style.background='var(--bg-card)';this.style.color='var(--text-secondary)'">
                    <span style="font-size:18px">${icon}</span><span>${label}</span>
                  </a>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Penjualan Hari Ini Detail -->
        <div class="card mt-6">
          <div class="card-header">
            <div>
              <div class="card-title">Penjualan Hari Ini</div>
              <div class="card-subtitle">${formatDate(today(0))}</div>
            </div>
            <a href="#penjualan-harian" class="btn btn-ghost btn-sm">Kelola</a>
          </div>
          ${this.renderTodaySales()}
        </div>
      </div>

      <style>
        .page-enter { animation: fadeInUp 0.35s ease; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      </style>
    `;
  },

  kpiCard(color, iconSvg, label, value, change, sub) {
    const changeHtml = change !== null && change !== undefined
      ? `<div class="kpi-change ${change >= 0 ? 'up' : 'down'}">
          ${change >= 0
            ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>`
            : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`}
          ${Math.abs(change)}% ${sub}
        </div>`
      : `<div class="kpi-change neutral">${sub}</div>`;

    return `
      <div class="kpi-card ${color}">
        <div class="kpi-icon ${color}">${iconSvg}</div>
        <div class="kpi-label">${label}</div>
        <div class="kpi-value">${value}</div>
        ${changeHtml}
      </div>
    `;
  },

  renderStokMini() {
    const produk = DATA.getProduk();
    const stokData = DB.get('stok') || {};
    return produk.map(p => {
      const stok = stokData[p.id] || 0;
      const pct = Math.min(100, Math.round((stok / (p.stok_minimal * 5)) * 100));
      const color = stok <= p.stok_minimal ? 'red' : stok <= p.stok_minimal * 2 ? 'orange' : 'green';
      return `
        <div style="margin-bottom:12px">
          <div class="flex-between mb-4">
            <span style="font-size:13px;color:var(--text-secondary)">${p.nama}</span>
            <span style="font-size:13px;font-weight:700;color:var(--text-primary)">${stok} ${p.satuan}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${color}" style="width:${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderTodaySales() {
    const todayStr = today(0);
    const record = DATA.getPenjualanHarian().find(p => p.tanggal === todayStr);
    if (!record) {
      return `<div class="empty-state" style="padding:24px">
        <p>Belum ada data penjualan hari ini.</p>
        <button class="btn btn-primary btn-sm mt-4" onclick="APP.navigate('penjualan-harian')">+ Input Penjualan</button>
      </div>`;
    }
    const totalOmzet = record.items.reduce((s, i) => s + (i.terjual * i.harga), 0);
    return `
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th>Produk</th><th>Terjual</th><th>Harga/Unit</th><th class="text-right">Omzet</th>
          </tr></thead>
          <tbody>
            ${record.items.map(item => `
              <tr>
                <td class="bold">${DATA.getProdukNama(item.produk_id)}</td>
                <td>${item.terjual.toLocaleString('id-ID')}</td>
                <td>${formatRpFull(item.harga)}</td>
                <td class="text-right bold positive">${formatRp(item.terjual * item.harga)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="table-summary">
              <td colspan="3" class="font-bold">TOTAL OMZET</td>
              <td class="text-right positive font-bold">${formatRp(totalOmzet)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  },

  initCharts() {
    const trend = DATA.getOmzetTrend();
    const ctx = document.getElementById('chartTrendOmzet');
    if (!ctx) return;

    if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }

    const labels = trend.map(t => {
      const d = new Date(t.tanggal + 'T00:00:00');
      return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    });
    const values = trend.map(t => t.omzet);

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Omzet',
          data: values,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22,163,74,0.06)',
          borderWidth: 2.5,
          pointBackgroundColor: '#16a34a',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            borderColor: '#334155',
            borderWidth: 1,
            titleColor: '#ffffff',
            bodyColor: '#94a3b8',
            callbacks: { label: ctx => ' ' + formatRp(ctx.parsed.y) }
          }
        },
        scales: {
          x: { grid: { color: '#f1f5f9' }, ticks: { color: '#475569', font: { size: 11 } } },
          y: { grid: { color: '#f1f5f9' }, ticks: { color: '#475569', font: { size: 11 }, callback: v => formatRp(v) } }
        }
      }
    });
  }
};

/* =============================================
   KPI ANALYTICS PAGE
   ============================================= */
const KPI_PAGE = {
  render() {
    const lr = DATA.getLabaRugi();
    const currentLR = lr.find(l => l.bulan === currentMonth()) || {};
    const penjualan = DATA.getPenjualanHarian();
    const piutang = DATA.getPiutang();
    const hutang = DATA.getHutang();
    const ks = DATA.getKinerjaSales();
    const opname = DATA.getStockOpname();
    const currentOpname = opname.find(o => o.bulan === currentMonth()) || { items: [] };

    const penjBersih = currentLR.penjualan_bersih || 0;
    const hpp = currentLR.hpp || 0;
    const biaya = currentLR.biaya_operasional || 0;
    const penyusutan = currentLR.biaya_penyusutan || 0;
    const labaKotor = penjBersih - hpp;
    const labaBersih = labaKotor - biaya - penyusutan;
    const marginKotor = penjBersih > 0 ? ((labaKotor/penjBersih)*100).toFixed(1) : 0;
    const marginBersih = penjBersih > 0 ? ((labaBersih/penjBersih)*100).toFixed(1) : 0;

    const totalPiutang = piutang.reduce((s,p)=>s+p.total,0);
    const piutangMacet = piutang.reduce((s,p)=>s+(p.usia_gt60||0),0);
    const pctMacet = totalPiutang > 0 ? ((piutangMacet/totalPiutang)*100).toFixed(1) : 0;

    const totalRealisasi = ks.reduce((s,k)=>s+(k.realisasi||0),0);
    const totalTarget = ks.reduce((s,k)=>s+(k.target||0),0);
    const pctTarget = totalTarget > 0 ? Math.round((totalRealisasi/totalTarget)*100) : 0;

    // Stok hari jual
    const produk = DATA.getProduk();
    const stokData = DB.get('stok') || {};
    const avgHariJual = produk.map(p => {
      const stok = stokData[p.id] || 0;
      const lastPenjualan = penjualan.slice(-7);
      const avgTerjual = lastPenjualan.length > 0
        ? lastPenjualan.reduce((s,d) => s + ((d.items.find(i=>i.produk_id===p.id)||{}).terjual||0), 0) / lastPenjualan.length : 1;
      return avgTerjual > 0 ? Math.round(stok / avgTerjual) : 999;
    });
    const minHariJual = Math.min(...avgHariJual);

    return `
      <div class="page-enter">
        <div class="section-header mb-6">
          <div>
            <h2 class="section-title">KPI & Analytics</h2>
            <p class="section-desc">Indikator kinerja kunci — ${formatMonth(currentMonth())}</p>
          </div>
          <div class="month-selector">
            <select id="kpiMonthSel" onchange="KPI_PAGE.renderCharts()">
              ${this.monthOptions()}
            </select>
          </div>
        </div>

        <!-- KPI Table -->
        <div class="card mb-6">
          <div class="card-title mb-6">📊 KPI Utama</div>
          <div class="table-wrapper">
            <table>
              <thead><tr>
                <th>KPI</th><th>Nilai</th><th>Status</th><th>Frekuensi</th>
              </tr></thead>
              <tbody>
                <tr>
                  <td class="bold">Omzet vs Target</td>
                  <td class="bold">${formatRp(totalRealisasi)} / ${formatRp(totalTarget)}</td>
                  <td><span class="badge ${pctTarget >= 95 ? 'badge-success' : pctTarget >= 80 ? 'badge-warning' : 'badge-danger'}">${pctTarget}%</span></td>
                  <td class="text-muted">Harian & Bulanan</td>
                </tr>
                <tr>
                  <td class="bold">Margin Kotor (%)</td>
                  <td class="bold">${marginKotor}%</td>
                  <td><span class="badge ${parseFloat(marginKotor) >= 20 ? 'badge-success' : parseFloat(marginKotor) >= 15 ? 'badge-warning' : 'badge-danger'}">${parseFloat(marginKotor) >= 20 ? 'Baik' : parseFloat(marginKotor) >= 15 ? 'Cukup' : 'Rendah'}</span></td>
                  <td class="text-muted">Bulanan</td>
                </tr>
                <tr>
                  <td class="bold">Margin Bersih (%)</td>
                  <td class="bold">${marginBersih}%</td>
                  <td><span class="badge ${parseFloat(marginBersih) >= 10 ? 'badge-success' : parseFloat(marginBersih) >= 5 ? 'badge-warning' : 'badge-danger'}">${parseFloat(marginBersih) >= 10 ? 'Baik' : parseFloat(marginBersih) >= 5 ? 'Cukup' : 'Rendah'}</span></td>
                  <td class="text-muted">Bulanan</td>
                </tr>
                <tr>
                  <td class="bold">Stok Hari Jual (Days of Supply)</td>
                  <td class="bold">${minHariJual} hari (min)</td>
                  <td><span class="badge ${minHariJual >= 14 ? 'badge-success' : minHariJual >= 7 ? 'badge-warning' : 'badge-danger'}">${minHariJual >= 14 ? 'Aman' : minHariJual >= 7 ? 'Perhatian' : 'Kritis'}</span></td>
                  <td class="text-muted">Mingguan</td>
                </tr>
                <tr>
                  <td class="bold">Persentase Piutang Macet</td>
                  <td class="bold">${pctMacet}%</td>
                  <td><span class="badge ${parseFloat(pctMacet) === 0 ? 'badge-success' : parseFloat(pctMacet) <= 10 ? 'badge-warning' : 'badge-danger'}">${parseFloat(pctMacet) === 0 ? 'Bersih' : parseFloat(pctMacet) <= 10 ? 'Perhatian' : 'Tinggi'}</span></td>
                  <td class="text-muted">Bulanan</td>
                </tr>
                ${currentOpname.items.map(item => {
                  const selisih = (item.stok_fisik || 0) - item.stok_sistem;
                  return `
                    <tr>
                      <td class="bold">Stock Variance — ${DATA.getProdukNama(item.produk_id)}</td>
                      <td class="${selisih < 0 ? 'negative' : 'positive'}">${selisih > 0 ? '+' : ''}${selisih}</td>
                      <td><span class="badge ${selisih === 0 ? 'badge-success' : 'badge-danger'}">${selisih === 0 ? 'Cocok' : 'Selisih'}</span></td>
                      <td class="text-muted">Bulanan</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- P&L Chart -->
        <div class="grid-2">
          <div class="card">
            <div class="card-title mb-6">Komposisi Biaya vs Pendapatan</div>
            <div class="chart-container" style="height:220px">
              <canvas id="chartPL"></canvas>
            </div>
          </div>
          <div class="card">
            <div class="card-title mb-6">Pencapaian Sales per Area</div>
            <div class="chart-container" style="height:220px">
              <canvas id="chartSales"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  monthOptions() {
    const now = new Date();
    let opts = '';
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      opts += `<option value="${val}" ${i===0?'selected':''}>${formatMonth(val)}</option>`;
    }
    return opts;
  },

  charts: {},

  renderCharts() {
    const lr = DATA.getLabaRugi();
    const currentLR = lr.find(l => l.bulan === currentMonth()) || {};
    const penjBersih = currentLR.penjualan_bersih || 0;
    const hpp = currentLR.hpp || 0;
    const biaya = currentLR.biaya_operasional || 0;
    const penyusutan = currentLR.biaya_penyusutan || 0;
    const labaKotor = penjBersih - hpp;
    const labaBersih = labaKotor - biaya - penyusutan;

    const plCtx = document.getElementById('chartPL');
    if (plCtx) {
      if (this.charts.pl) this.charts.pl.destroy();
      this.charts.pl = new Chart(plCtx, {
        type: 'doughnut',
        data: {
          labels: ['HPP', 'Biaya Operasional', 'Penyusutan', 'Laba Bersih'],
          datasets: [{
            data: [hpp, biaya, penyusutan, Math.max(0, labaBersih)],
            backgroundColor: ['rgba(239,68,68,0.7)','rgba(249,115,22,0.7)','rgba(132,204,22,0.7)','rgba(22,163,74,0.8)'],
            borderColor: ['#ffffff','#ffffff','#ffffff','#ffffff'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#475569', font: { size: 11 }, padding: 12 } },
            tooltip: {
              backgroundColor: '#0f172a',
              borderColor: '#334155', borderWidth: 1,
              titleColor: '#ffffff',
              bodyColor: '#94a3b8',
              callbacks: { label: ctx => ` ${ctx.label}: ${formatRp(ctx.parsed)}` }
            }
          }
        }
      });
    }

    const ks = DATA.getKinerjaSales();
    const salesCtx = document.getElementById('chartSales');
    if (salesCtx && ks.length > 0) {
      if (this.charts.sales) this.charts.sales.destroy();
      this.charts.sales = new Chart(salesCtx, {
        type: 'bar',
        data: {
          labels: ks.map(k => DATA.getSalesNama(k.sales_id)),
          datasets: [
            { label: 'Target', data: ks.map(k => k.target), backgroundColor: 'rgba(101,163,13,0.15)', borderColor: '#65a30d', borderWidth: 1.5, borderRadius: 4 },
            { label: 'Realisasi', data: ks.map(k => k.realisasi), backgroundColor: 'rgba(22,163,74,0.7)', borderColor: '#16a34a', borderWidth: 1.5, borderRadius: 4 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#475569', font: { size: 11 } } },
            tooltip: { backgroundColor: '#0f172a', borderColor: '#334155', borderWidth: 1, titleColor: '#ffffff', bodyColor: '#94a3b8', callbacks: { label: ctx => ` ${ctx.dataset.label}: ${formatRp(ctx.parsed.y)}` } }
          },
          scales: {
            x: { grid: { color: '#f1f5f9' }, ticks: { color: '#475569' } },
            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#475569', callback: v => formatRp(v) } }
          }
        }
      });
    }
  }
};

window.DASHBOARD = DASHBOARD;
window.KPI_PAGE = KPI_PAGE;
