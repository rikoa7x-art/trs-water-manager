/**
 * TRS Water — Supabase Sync Layer
 *
 * Strategi: Write-Through Cache
 *   - localStorage  → cache lokal, pembacaan instan, bekerja offline
 *   - Supabase      → penyimpanan permanen, multi-device, cloud backup
 *
 * Alur:
 *   Login          → pullAll()   : tarik semua data Supabase → localStorage
 *   Tambah/Edit    → push()      : tulis localStorage dulu → Supabase async
 *   Hapus          → push()      : hapus localStorage dulu → Supabase async
 *   Update Stok    → pushStok()  : update tabel stok (format khusus)
 *   Refresh halaman→ pullAll()   : background refresh tanpa block UI
 */

const SYNC = {

  TABLES: [
    'produk', 'pelanggan', 'supplier', 'kendaraan', 'sales',
    'penjualan_harian', 'mutasi_gudang', 'kas_harian', 'pengiriman_harian',
    'laba_rugi', 'stock_opname', 'piutang', 'hutang', 'pembelian',
    'kinerja_sales', 'biaya_operasional'
  ],

  _initialized: false,
  _pulling: false,

  /* ============================================================
     INISIALISASI
     ============================================================ */
  init() {
    if (this._initialized) return;
    this._initialized = true;

    // Patch DB.set — intercept setiap update stok
    const _origSet = DB.set.bind(DB);
    DB.set = (key, value) => {
      _origSet(key, value);
      if (key === 'stok' && !SYNC._pulling && window._supa) {
        SYNC.pushStok(value);
      }
    };

    // Indikator sync di topbar
    this._createIndicator();

    // Event online/offline
    window.addEventListener('online',  () => SYNC._updateIndicator('online'));
    window.addEventListener('offline', () => SYNC._updateIndicator('offline'));

    if (!window._supa) {
      this._updateIndicator('error');
      console.warn('[SYNC] Supabase tidak tersedia, running dalam mode offline.');
    } else {
      this._updateIndicator('online');
    }
  },

  /* ============================================================
     INDIKATOR STATUS
     ============================================================ */
  _createIndicator() {
    if (document.getElementById('syncDot')) return;
    const topRight = document.querySelector('.topbar-right');
    if (!topRight) return;

    const wrap = document.createElement('div');
    wrap.id = 'syncDot';
    wrap.style.cssText = [
      'display:flex', 'align-items:center', 'gap:5px',
      'font-size:10px', 'font-weight:600', 'color:var(--text-muted)',
      'cursor:default', 'user-select:none', 'flex-shrink:0'
    ].join(';');
    wrap.innerHTML = `
      <div id="syncDotInner" style="
        width:7px;height:7px;border-radius:50%;background:#94a3b8;
        flex-shrink:0;transition:background .4s, box-shadow .4s;
      "></div>
      <span id="syncDotLabel" class="hide-on-mobile">Cloud</span>
    `;
    wrap.title = 'Status sinkronisasi Supabase';
    topRight.insertBefore(wrap, topRight.firstChild);
  },

  _updateIndicator(status) {
    const dot   = document.getElementById('syncDotInner');
    const label = document.getElementById('syncDotLabel');
    if (!dot) return;

    const map = {
      online:  { bg: '#22c55e', glow: 'rgba(34,197,94,0.35)',   txt: 'Sync ✓' },
      syncing: { bg: '#f59e0b', glow: 'rgba(245,158,11,0.35)',  txt: 'Sync...' },
      error:   { bg: '#ef4444', glow: 'rgba(239,68,68,0.35)',   txt: 'Offline' },
      offline: { bg: '#94a3b8', glow: 'rgba(148,163,184,0.2)',  txt: 'Offline' },
    };
    const c = map[status] || map.offline;
    dot.style.background  = c.bg;
    dot.style.boxShadow   = `0 0 0 3px ${c.glow}`;
    if (label) label.textContent = c.txt;
    document.getElementById('syncDot').title = `Supabase: ${status}`;
  },

  /* ============================================================
     PULL SEMUA DATA DARI SUPABASE → localStorage
     ============================================================ */
  async pullAll() {
    if (!window._supa) return;
    this._pulling = true;
    this._updateIndicator('syncing');
    let hasData = false;

    try {
      // Tarik setiap tabel
      for (const table of this.TABLES) {
        try {
          const { data, error } = await _supa.from(table).select('*');
          if (error) {
            console.warn(`[SYNC] Pull error [${table}]:`, error.message);
            continue;
          }
          if (data && data.length > 0) {
            hasData = true;
            // Tulis langsung ke localStorage (bypass patch DB.set)
            localStorage.setItem(DB.PREFIX + table, JSON.stringify(data));
          }
        } catch (e) {
          console.warn(`[SYNC] Pull exception [${table}]:`, e.message || e);
        }
      }

      // Stok — format berbeda: rows [{produk_id, jumlah}] → object {P1: 350}
      try {
        const { data: stokRows, error } = await _supa.from('stok').select('*');
        if (!error && stokRows && stokRows.length > 0) {
          hasData = true;
          const stokObj = {};
          stokRows.forEach(r => { stokObj[r.produk_id] = r.jumlah; });
          localStorage.setItem(DB.PREFIX + 'stok', JSON.stringify(stokObj));
        }
      } catch (e) {
        console.warn('[SYNC] Pull stok error:', e.message || e);
      }

      // Jika Supabase kosong → ini pertama kali → migrasi data dari localStorage
      if (!hasData) {
        console.log('[SYNC] Database Supabase kosong. Migrasi data awal...');
        await this._pushLocalToSupabase();
      }

      this._updateIndicator('online');
      console.log('[SYNC] Pull selesai ✓');

    } catch (e) {
      console.error('[SYNC] pullAll error:', e);
      this._updateIndicator('error');
      setTimeout(() => this._updateIndicator(navigator.onLine ? 'online' : 'offline'), 4000);
    } finally {
      this._pulling = false;
    }
  },

  /* ============================================================
     MIGRASI AWAL: localStorage → Supabase (satu kali saja)
     ============================================================ */
  async _pushLocalToSupabase() {
    if (!window._supa) return;
    this._updateIndicator('syncing');
    let count = 0;

    for (const table of this.TABLES) {
      const data = DB.get(table);
      if (!data || data.length === 0) continue;
      try {
        const { error } = await _supa.from(table).upsert(data, { onConflict: 'id' });
        if (error) {
          console.warn(`[SYNC] Migrasi error [${table}]:`, error.message);
        } else {
          count += data.length;
        }
      } catch (e) {
        console.warn(`[SYNC] Migrasi exception [${table}]:`, e.message || e);
      }
    }

    // Stok
    const stokObj = DB.get('stok') || {};
    await this.pushStok(stokObj);

    console.log(`[SYNC] Migrasi selesai — ${count} record dipush ke Supabase ✓`);
    this._updateIndicator('online');
  },

  /* ============================================================
     PUSH PERUBAHAN RECORD → Supabase (insert / update / delete)
     ============================================================ */
  async push(table, record, operation) {
    if (!window._supa) return;
    try {
      if (operation === 'delete') {
        const { error } = await _supa.from(table).delete().eq('id', record.id);
        if (error) console.warn(`[SYNC] Delete error [${table}]:`, error.message);
      } else {
        const { error } = await _supa.from(table).upsert([record], { onConflict: 'id' });
        if (error) console.warn(`[SYNC] Upsert error [${table}]:`, error.message);
      }
    } catch (e) {
      console.warn(`[SYNC] push exception [${table}]:`, e.message || e);
    }
  },

  /* ============================================================
     PUSH UPDATE STOK → Supabase
     Stok disimpan sebagai object {P1: 350, P2: 120} di localStorage
     tapi sebagai rows [{produk_id, jumlah}] di Supabase
     ============================================================ */
  async pushStok(stokObj) {
    if (!window._supa || !stokObj) return;
    try {
      const rows = Object.entries(stokObj)
        .map(([produk_id, jumlah]) => ({ produk_id, jumlah }));
      if (rows.length > 0) {
        const { error } = await _supa
          .from('stok')
          .upsert(rows, { onConflict: 'produk_id' });
        if (error) console.warn('[SYNC] pushStok error:', error.message);
      }
    } catch (e) {
      console.warn('[SYNC] pushStok exception:', e.message || e);
    }
  }
};

window.SYNC = SYNC;
