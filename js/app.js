/**
 * TRS Water — AMDK Manager
 * Main App Router & Controller
 */

const ROUTES = {
  'dashboard':          { title: 'Dashboard',              subtitle: 'Ringkasan kondisi bisnis hari ini',          module: DASHBOARD },
  'kpi':                { title: 'KPI & Analytics',        subtitle: 'Indikator kinerja kunci bulanan',             module: KPI_PAGE },
  'penjualan-harian':   { title: 'Penjualan Harian',       subtitle: 'Laporan penjualan per produk setiap hari',    module: PENJUALAN_HARIAN },
  'stok-harian':        { title: 'Stok / Gudang',          subtitle: 'Mutasi barang masuk, keluar, dan retur',      module: STOK_HARIAN },
  'kas-harian':         { title: 'Kas Harian',             subtitle: 'Saldo kas, penerimaan, pengeluaran harian',   module: KAS_HARIAN },
  'armada-harian':      { title: 'Pengiriman & Armada',    subtitle: 'Kendaraan, driver, rute, BBM setiap hari',    module: ARMADA_HARIAN },
  'laba-rugi':          { title: 'Laba Rugi (P&L)',        subtitle: 'Evaluasi profitabilitas bulanan',             module: LABA_RUGI },
  'stock-opname':       { title: 'Stock Opname',           subtitle: 'Stok sistem vs fisik, deteksi kebocoran',     module: STOCK_OPNAME },
  'piutang':            { title: 'Piutang (AR)',           subtitle: 'Aging accounts receivable per pelanggan',     module: PIUTANG_PAGE },
  'hutang':             { title: 'Hutang ke Pabrik (AP)',  subtitle: 'Aging accounts payable per supplier',         module: HUTANG_PAGE },
  'pembelian':          { title: 'Pembelian dari Pabrik',  subtitle: 'Harga beli, kuantitas, dan lead time',        module: PEMBELIAN_PAGE },
  'kinerja-sales':      { title: 'Kinerja Sales',          subtitle: 'Target vs realisasi per sales dan area',      module: KINERJA_SALES },
  'biaya-operasional':  { title: 'Biaya Operasional',      subtitle: 'Gaji, BBM, sewa, pemeliharaan, listrik',      module: BIAYA_OPERASIONAL },
  'master-produk':      { title: 'Master Produk',          subtitle: 'Daftar produk AMDK yang dijual',              module: MASTER_PRODUK },
  'master-pelanggan':   { title: 'Master Pelanggan',       subtitle: 'Data toko, agen, dan warung pelanggan',       module: MASTER_PELANGGAN },
  'master-supplier':    { title: 'Master Supplier',        subtitle: 'Data pabrik dan supplier AMDK',               module: MASTER_SUPPLIER },
  'master-kendaraan':   { title: 'Master Kendaraan',       subtitle: 'Data kendaraan dan driver pengiriman',        module: MASTER_KENDARAAN },
  'master-sales':       { title: 'Master Sales & Driver',  subtitle: 'Data tim sales dan target per area',          module: MASTER_SALES },
};

/* =============================================
   CHART.JS GLOBAL DEFAULTS — TRS LIGHT THEME
   ============================================= */
if (typeof Chart !== 'undefined') {
  Chart.defaults.color = '#475569';
  Chart.defaults.borderColor = '#e5e7eb';
  Chart.defaults.plugins.tooltip.backgroundColor = '#0f172a';
  Chart.defaults.plugins.tooltip.borderColor = '#334155';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
  Chart.defaults.plugins.tooltip.bodyColor = '#94a3b8';
  Chart.defaults.plugins.legend.labels.color = '#475569';
  Chart.defaults.scale.grid.color = '#f1f5f9';
  Chart.defaults.scale.ticks.color = '#475569';
}

const APP = {
  currentPage: 'dashboard',

  init() {
    // Date display
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });

    // Company name
    const companyName = DB.get('company_name') || 'TRS water';
    const el = document.getElementById('companyNameDisplay');
    if (el) el.textContent = companyName;

    // Nav items in sidebar (data-page attribute)
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(el.dataset.page);
      });
    });

    // Sidebar toggle (desktop)
    const sidebar = document.getElementById('sidebar');
    document.getElementById('sidebarToggle').addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });

    // Mobile toggle
    const overlay = document.getElementById('sidebarOverlay');
    document.getElementById('mobileToggle').addEventListener('click', () => {
      sidebar.classList.add('mobile-open');
      overlay.classList.add('active');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
    });

    // Modal
    document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
    document.getElementById('modalCancel').addEventListener('click', () => this.closeModal());
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('modalOverlay')) this.closeModal();
    });

    // Hash router
    window.addEventListener('hashchange', () => {
      const page = window.location.hash.slice(1) || 'dashboard';
      this.navigate(page, false);
    });

    // Init page
    const initialPage = window.location.hash.slice(1) || 'dashboard';
    this.navigate(initialPage, false);
  },

  navigate(page, updateHash = true) {
    if (!ROUTES[page]) page = 'dashboard';
    this.currentPage = page;

    if (updateHash) {
      history.pushState(null, '', '#' + page);
    }

    // Update nav active — sidebar
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    // Update mobile bottom nav
    document.querySelectorAll('.mobile-nav-item[data-page]').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    // Page meta
    const route = ROUTES[page];
    document.getElementById('pageTitle').textContent = route.title;
    document.getElementById('pageSubtitle').textContent = route.subtitle;

    // Render
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = '<div class="loading-screen"><div class="loading-spinner"></div><p>Memuat...</p></div>';

    requestAnimationFrame(() => {
      try {
        contentArea.innerHTML = route.module.render();
        setTimeout(() => this.postRender(page), 60);
      } catch (err) {
        contentArea.innerHTML = `
          <div class="card">
            <div class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <h3>Terjadi kesalahan</h3>
              <p style="color:var(--accent-red)">${err.message}</p>
              <button class="btn btn-ghost btn-sm mt-4" onclick="APP.navigate('dashboard')">Kembali ke Dashboard</button>
            </div>
          </div>
        `;
        console.error('Render error on page:', page, err);
      }
    });

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('sidebarOverlay').classList.remove('active');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  },

  postRender(page) {
    switch (page) {
      case 'dashboard':
        if (typeof DASHBOARD !== 'undefined') DASHBOARD.initCharts();
        break;
      case 'kpi':
        if (typeof KPI_PAGE !== 'undefined') KPI_PAGE.renderCharts();
        break;
      case 'laba-rugi':
        const lr = DATA.getLabaRugi().find(l => l.bulan === currentMonth());
        if (typeof LABA_RUGI !== 'undefined') LABA_RUGI.initCharts(lr);
        break;
    }
  },

  openModal(title, bodyHtml, onSave) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalOverlay').classList.add('active');

    const saveBtn = document.getElementById('modalSave');
    const newBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newBtn, saveBtn);
    newBtn.addEventListener('click', onSave);

    // Focus first input on modal open
    requestAnimationFrame(() => {
      const first = document.querySelector('.modal-body input, .modal-body select');
      if (first && window.innerWidth > 767) first.focus();
    });
  },

  closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    setTimeout(() => {
      document.getElementById('modalBody').innerHTML = '';
    }, 250);
  },

  toast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    const icons = {
      success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
      error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
      warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>`,
      info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7cc86e" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${icons[type] || icons.info}<span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'all 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px) scale(0.9)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  showQuickAdd() {
    const map = {
      'penjualan-harian':  () => PENJUALAN_HARIAN.showForm(),
      'stok-harian':       () => STOK_HARIAN.showForm(),
      'kas-harian':        () => KAS_HARIAN.showForm(),
      'armada-harian':     () => ARMADA_HARIAN.showForm(),
      'laba-rugi':         () => LABA_RUGI.showForm(),
      'stock-opname':      () => STOCK_OPNAME.showForm(),
      'piutang':           () => PIUTANG_PAGE.showForm(),
      'hutang':            () => HUTANG_PAGE.showForm(),
      'pembelian':         () => PEMBELIAN_PAGE.showForm(),
      'kinerja-sales':     () => KINERJA_SALES.showForm(),
      'biaya-operasional': () => BIAYA_OPERASIONAL.showForm(),
      'master-produk':     () => MASTER_PRODUK.showForm(),
      'master-pelanggan':  () => MASTER_PELANGGAN.showForm(),
      'master-supplier':   () => MASTER_SUPPLIER.showForm(),
      'master-kendaraan':  () => MASTER_KENDARAAN.showForm(),
      'master-sales':      () => MASTER_SALES.showForm(),
    };
    const fn = map[this.currentPage];
    if (fn) fn();
    else PENJUALAN_HARIAN.showForm();
  },

  openMobileMenu() {
    // Show full mobile menu (all pages)
    const pages = [
      { page: 'dashboard',       label: 'Dashboard',           icon: '🏠' },
      { page: 'kpi',             label: 'KPI & Analytics',     icon: '📊' },
      { page: 'stok-harian',     label: 'Stok / Gudang',       icon: '📦' },
      { page: 'armada-harian',   label: 'Pengiriman & Armada', icon: '🚚' },
      { page: 'laba-rugi',       label: 'Laba Rugi (P&L)',     icon: '📈' },
      { page: 'stock-opname',    label: 'Stock Opname',        icon: '📋' },
      { page: 'hutang',          label: 'Hutang ke Pabrik',    icon: '🏭' },
      { page: 'pembelian',       label: 'Pembelian',           icon: '🛒' },
      { page: 'kinerja-sales',   label: 'Kinerja Sales',       icon: '👥' },
      { page: 'biaya-operasional', label: 'Biaya Operasional', icon: '⚙️' },
      { page: 'master-produk',   label: 'Master Produk',       icon: '📋' },
      { page: 'master-pelanggan', label: 'Pelanggan',          icon: '👤' },
      { page: 'master-supplier', label: 'Supplier',            icon: '🏢' },
      { page: 'master-kendaraan', label: 'Kendaraan',          icon: '🚛' },
      { page: 'master-sales',    label: 'Sales & Driver',      icon: '🧑' },
    ];

    this.openModal('Menu Lengkap',
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${pages.map(p => `
          <button onclick="APP.closeModal();APP.navigate('${p.page}')" style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);text-align:left;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;color:var(--text-secondary);transition:var(--transition)" onmouseover="this.style.background='var(--bg-card-hover)';this.style.color='var(--text-primary)'" onmouseout="this.style.background='var(--bg-card)';this.style.color='var(--text-secondary)'">
            <span style="font-size:20px">${p.icon}</span>
            <span>${p.label}</span>
          </button>
        `).join('')}
      </div>`,
      null
    );
    // Hide save button for this modal
    document.getElementById('modalSave').style.display = 'none';
    document.getElementById('modalCancel').textContent = 'Tutup';
  }
};

window.APP = APP;

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Restore save button in case it was hidden
  document.getElementById('modalCancel').addEventListener('click', () => {
    const saveBtn = document.getElementById('modalSave');
    if (saveBtn) saveBtn.style.display = '';
    const cancelBtn = document.getElementById('modalCancel');
    if (cancelBtn) cancelBtn.textContent = 'Batal';
  });

  APP.init();
});
