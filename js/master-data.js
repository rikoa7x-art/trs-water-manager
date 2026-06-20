/**
 * AMDK Manager — Master Data
 * CRUD: Produk, Pelanggan, Supplier, Kendaraan, Sales
 */

function masterPage(key, title, icon, columns, items, addLabel, renderRow, showFormFn) {
  return `
    <div class="page-enter">
      <div class="section-header mb-6">
        <div>
          <h2 class="section-title">${icon} ${title}</h2>
          <p class="section-desc">${items.length} data terdaftar</p>
        </div>
        <button class="btn btn-primary" onclick="${showFormFn}()">${addLabel}</button>
      </div>
      <div class="card">
        ${items.length === 0 ? `<div class="empty-state"><h3>Belum ada data ${title}</h3><p>Klik tombol "${addLabel}" untuk menambah</p></div>` :
        `<div class="table-wrapper">
          <table>
            <thead><tr>${columns.map(c => `<th>${c}</th>`).join('')}<th></th></tr></thead>
            <tbody>${items.map(item => renderRow(item)).join('')}</tbody>
          </table>
        </div>`}
      </div>
    </div>
  `;
}

/* =============================================
   MASTER PRODUK
   ============================================= */
const MASTER_PRODUK = {
  render() {
    const produk = DATA.getProduk();
    const stokData = DB.get('stok') || {};
    return masterPage('produk', 'Master Produk', '📦',
      ['Kode', 'Nama Produk', 'Satuan', 'Harga Jual', 'Harga Beli', 'Margin', 'Stok Min', 'Stok Saat Ini'],
      produk, '+ Tambah Produk',
      (p) => {
        const stok = stokData[p.id] || 0;
        const margin = p.harga_jual > 0 ? (((p.harga_jual - p.harga_beli) / p.harga_jual) * 100).toFixed(1) : 0;
        return `<tr>
          <td><span class="badge badge-info">${p.id}</span></td>
          <td class="bold">${p.nama}</td>
          <td>${p.satuan}</td>
          <td class="positive">${formatRpFull(p.harga_jual)}</td>
          <td class="warning">${formatRpFull(p.harga_beli)}</td>
          <td><span class="badge badge-success">${margin}%</span></td>
          <td>${p.stok_minimal}</td>
          <td class="${stok <= p.stok_minimal ? 'negative' : 'positive'} bold">${stok}</td>
          <td>
            <button class="btn btn-ghost btn-xs" onclick="MASTER_PRODUK.showForm('${p.id}')">Edit</button>
            <button class="btn-icon" onclick="MASTER_PRODUK.delete('${p.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
          </td>
        </tr>`;
      }, 'MASTER_PRODUK.showForm'
    );
  },

  showForm(id = null) {
    const produk = id ? DATA.getProdukById(id) : null;
    APP.openModal(id ? 'Edit Produk' : 'Tambah Produk', `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Kode Produk</label><input class="form-control" type="text" id="mp_id" value="${produk ? produk.id : ''}" placeholder="P1, P2, ..." ${id ? 'readonly' : ''}/></div>
        <div class="form-group"><label class="form-label">Nama Produk</label><input class="form-control" type="text" id="mp_nama" value="${produk ? produk.nama : ''}" placeholder="Galon 19L"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Satuan</label><input class="form-control" type="text" id="mp_satuan" value="${produk ? produk.satuan : 'Unit'}" /></div>
        <div class="form-group"><label class="form-label">Stok Minimal</label><input class="form-control" type="number" id="mp_min" value="${produk ? produk.stok_minimal : 20}" min="0"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Harga Jual (Rp)</label><input class="form-control" type="number" id="mp_jual" value="${produk ? produk.harga_jual : 0}" min="0"/></div>
        <div class="form-group"><label class="form-label">Harga Beli (Rp)</label><input class="form-control" type="number" id="mp_beli" value="${produk ? produk.harga_beli : 0}" min="0"/></div>
      </div>
    `, () => {
      const data = { id: document.getElementById('mp_id').value.trim(), nama: document.getElementById('mp_nama').value.trim(), satuan: document.getElementById('mp_satuan').value.trim(), stok_minimal: parseInt(document.getElementById('mp_min').value)||0, harga_jual: parseInt(document.getElementById('mp_jual').value)||0, harga_beli: parseInt(document.getElementById('mp_beli').value)||0 };
      if (!data.nama || !data.id) { APP.toast('Kode dan nama harus diisi', 'error'); return; }
      const list = DATA.getProduk();
      if (!id && list.find(p => p.id === data.id)) { APP.toast('Kode produk sudah ada', 'error'); return; }
      if (id) { DATA.updateItem('produk', id, data); APP.toast('Produk diperbarui', 'success'); }
      else { DATA.addItem('produk', data); APP.toast('Produk ditambahkan', 'success'); }
      APP.closeModal(); APP.navigate('master-produk');
    });
  },

  delete(id) {
    if (confirm('Hapus produk ini?')) {
      DATA.deleteItem('produk', id);
      APP.toast('Produk dihapus', 'warning');
      APP.navigate('master-produk');
    }
  }
};

/* =============================================
   MASTER PELANGGAN
   ============================================= */
const MASTER_PELANGGAN = {
  render() {
    const pelanggan = DATA.getPelanggan();
    return masterPage('pelanggan', 'Master Pelanggan', '👥',
      ['Kode', 'Nama', 'Tipe', 'Alamat', 'Telepon', 'Limit Kredit'],
      pelanggan, '+ Tambah Pelanggan',
      (p) => `<tr>
        <td><span class="badge badge-neutral">${p.id}</span></td>
        <td class="bold">${p.nama}</td>
        <td><span class="badge ${p.tipe==='Agen'?'badge-purple':p.tipe==='Minimarket'?'badge-info':p.tipe==='Toko'?'badge-success':'badge-neutral'}">${p.tipe}</span></td>
        <td class="text-muted">${p.alamat}</td>
        <td>${p.telepon}</td>
        <td class="bold">${formatRp(p.limit_kredit)}</td>
        <td>
          <button class="btn btn-ghost btn-xs" onclick="MASTER_PELANGGAN.showForm('${p.id}')">Edit</button>
          <button class="btn-icon" onclick="MASTER_PELANGGAN.delete('${p.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
        </td>
      </tr>`,
      'MASTER_PELANGGAN.showForm'
    );
  },

  showForm(id = null) {
    const p = id ? DATA.getPelangganById(id) : null;
    APP.openModal(id ? 'Edit Pelanggan' : 'Tambah Pelanggan', `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Nama Pelanggan</label><input class="form-control" type="text" id="mc_nama" value="${p ? p.nama : ''}"/></div>
        <div class="form-group"><label class="form-label">Tipe</label>
          <select class="form-control" id="mc_tipe">
            ${['Toko','Agen','Warung','Minimarket','Lainnya'].map(t=>`<option ${p&&p.tipe===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group"><label class="form-label">Alamat</label><input class="form-control" type="text" id="mc_alamat" value="${p ? p.alamat : ''}"/></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Telepon</label><input class="form-control" type="text" id="mc_tlp" value="${p ? p.telepon : ''}"/></div>
        <div class="form-group"><label class="form-label">Limit Kredit (Rp)</label><input class="form-control" type="number" id="mc_limit" value="${p ? p.limit_kredit : 0}" min="0"/></div>
      </div>
    `, () => {
      const data = { nama: document.getElementById('mc_nama').value.trim(), tipe: document.getElementById('mc_tipe').value, alamat: document.getElementById('mc_alamat').value.trim(), telepon: document.getElementById('mc_tlp').value.trim(), limit_kredit: parseInt(document.getElementById('mc_limit').value)||0 };
      if (!data.nama) { APP.toast('Nama harus diisi', 'error'); return; }
      if (id) { DATA.updateItem('pelanggan', id, data); APP.toast('Pelanggan diperbarui', 'success'); }
      else { DATA.addItem('pelanggan', {...data, id: 'C' + Date.now()}); APP.toast('Pelanggan ditambahkan', 'success'); }
      APP.closeModal(); APP.navigate('master-pelanggan');
    });
  },

  delete(id) { if (confirm('Hapus pelanggan?')) { DATA.deleteItem('pelanggan', id); APP.toast('Dihapus','warning'); APP.navigate('master-pelanggan'); } }
};

/* =============================================
   MASTER SUPPLIER
   ============================================= */
const MASTER_SUPPLIER = {
  render() {
    const supplier = DATA.getSupplier();
    return masterPage('supplier', 'Master Supplier / Pabrik', '🏭',
      ['Kode', 'Nama Pabrik', 'Alamat', 'Telepon', 'Kontak Person'],
      supplier, '+ Tambah Supplier',
      (s) => `<tr>
        <td><span class="badge badge-info">${s.id}</span></td>
        <td class="bold">${s.nama}</td>
        <td class="text-muted">${s.alamat}</td>
        <td>${s.telepon}</td>
        <td>${s.kontak}</td>
        <td>
          <button class="btn btn-ghost btn-xs" onclick="MASTER_SUPPLIER.showForm('${s.id}')">Edit</button>
          <button class="btn-icon" onclick="MASTER_SUPPLIER.delete('${s.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
        </td>
      </tr>`,
      'MASTER_SUPPLIER.showForm'
    );
  },

  showForm(id = null) {
    const s = id ? DATA.getSupplierById(id) : null;
    APP.openModal(id ? 'Edit Supplier' : 'Tambah Supplier', `
      <div class="form-group"><label class="form-label">Nama Pabrik / Supplier</label><input class="form-control" type="text" id="ms_nama" value="${s ? s.nama : ''}"/></div>
      <div class="form-group"><label class="form-label">Alamat</label><input class="form-control" type="text" id="ms_alamat" value="${s ? s.alamat : ''}"/></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Telepon</label><input class="form-control" type="text" id="ms_tlp" value="${s ? s.telepon : ''}"/></div>
        <div class="form-group"><label class="form-label">Kontak Person</label><input class="form-control" type="text" id="ms_kontak" value="${s ? s.kontak : ''}"/></div>
      </div>
    `, () => {
      const data = { nama: document.getElementById('ms_nama').value.trim(), alamat: document.getElementById('ms_alamat').value.trim(), telepon: document.getElementById('ms_tlp').value.trim(), kontak: document.getElementById('ms_kontak').value.trim() };
      if (!data.nama) { APP.toast('Nama harus diisi', 'error'); return; }
      if (id) { DATA.updateItem('supplier', id, data); APP.toast('Supplier diperbarui','success'); }
      else { DATA.addItem('supplier', {...data, id: 'S'+Date.now()}); APP.toast('Supplier ditambahkan','success'); }
      APP.closeModal(); APP.navigate('master-supplier');
    });
  },

  delete(id) { if (confirm('Hapus supplier?')) { DATA.deleteItem('supplier', id); APP.toast('Dihapus','warning'); APP.navigate('master-supplier'); } }
};

/* =============================================
   MASTER KENDARAAN
   ============================================= */
const MASTER_KENDARAAN = {
  render() {
    const kendaraan = DATA.getKendaraan();
    return masterPage('kendaraan', 'Master Kendaraan', '🚚',
      ['Kode', 'No. Plat', 'Jenis', 'Driver', 'Area', 'Status'],
      kendaraan, '+ Tambah Kendaraan',
      (k) => `<tr>
        <td><span class="badge badge-neutral">${k.id}</span></td>
        <td class="bold">${k.nomor_plat}</td>
        <td>${k.jenis}</td>
        <td>${k.driver}</td>
        <td>${k.area}</td>
        <td><span class="badge ${k.status==='Aktif'?'badge-success':'badge-danger'}">${k.status}</span></td>
        <td>
          <button class="btn btn-ghost btn-xs" onclick="MASTER_KENDARAAN.showForm('${k.id}')">Edit</button>
          <button class="btn-icon" onclick="MASTER_KENDARAAN.delete('${k.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
        </td>
      </tr>`,
      'MASTER_KENDARAAN.showForm'
    );
  },

  showForm(id = null) {
    const k = id ? DATA.getKendaraanById(id) : null;
    APP.openModal(id ? 'Edit Kendaraan' : 'Tambah Kendaraan', `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Nomor Plat</label><input class="form-control" type="text" id="mk_plat" value="${k ? k.nomor_plat : ''}"/></div>
        <div class="form-group"><label class="form-label">Jenis Kendaraan</label><input class="form-control" type="text" id="mk_jenis" value="${k ? k.jenis : ''}" placeholder="L300, Pickup, Truk..."/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Nama Driver</label><input class="form-control" type="text" id="mk_driver" value="${k ? k.driver : ''}"/></div>
        <div class="form-group"><label class="form-label">Area / Rute</label><input class="form-control" type="text" id="mk_area" value="${k ? k.area : ''}"/></div>
      </div>
      <div class="form-group"><label class="form-label">Status</label>
        <select class="form-control" id="mk_status">
          ${['Aktif','Non-aktif','Dalam Perbaikan'].map(s=>`<option ${k&&k.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    `, () => {
      const data = { nomor_plat: document.getElementById('mk_plat').value.trim(), jenis: document.getElementById('mk_jenis').value.trim(), driver: document.getElementById('mk_driver').value.trim(), area: document.getElementById('mk_area').value.trim(), status: document.getElementById('mk_status').value };
      if (!data.nomor_plat || !data.driver) { APP.toast('Plat dan driver harus diisi','error'); return; }
      if (id) { DATA.updateItem('kendaraan', id, data); APP.toast('Kendaraan diperbarui','success'); }
      else { DATA.addItem('kendaraan', {...data, id:'K'+Date.now()}); APP.toast('Kendaraan ditambahkan','success'); }
      APP.closeModal(); APP.navigate('master-kendaraan');
    });
  },

  delete(id) { if (confirm('Hapus kendaraan?')) { DATA.deleteItem('kendaraan', id); APP.toast('Dihapus','warning'); APP.navigate('master-kendaraan'); } }
};

/* =============================================
   MASTER SALES
   ============================================= */
const MASTER_SALES = {
  render() {
    const sales = DATA.getSales();
    return masterPage('sales', 'Master Sales & Driver', '👤',
      ['Kode', 'Nama', 'Area', 'Telepon', 'Target Bulanan'],
      sales, '+ Tambah Sales',
      (s) => `<tr>
        <td><span class="badge badge-purple">${s.id}</span></td>
        <td class="bold">${s.nama}</td>
        <td>${s.area}</td>
        <td>${s.telepon}</td>
        <td class="positive bold">${formatRp(s.target_bulanan)}</td>
        <td>
          <button class="btn btn-ghost btn-xs" onclick="MASTER_SALES.showForm('${s.id}')">Edit</button>
          <button class="btn-icon" onclick="MASTER_SALES.delete('${s.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
        </td>
      </tr>`,
      'MASTER_SALES.showForm'
    );
  },

  showForm(id = null) {
    const s = id ? DATA.getSalesById(id) : null;
    APP.openModal(id ? 'Edit Sales' : 'Tambah Sales', `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Nama Sales</label><input class="form-control" type="text" id="msl_nama" value="${s ? s.nama : ''}"/></div>
        <div class="form-group"><label class="form-label">Area</label><input class="form-control" type="text" id="msl_area" value="${s ? s.area : ''}"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Telepon</label><input class="form-control" type="text" id="msl_tlp" value="${s ? s.telepon : ''}"/></div>
        <div class="form-group"><label class="form-label">Target Bulanan (Rp)</label><input class="form-control" type="number" id="msl_target" value="${s ? s.target_bulanan : 0}" min="0"/></div>
      </div>
    `, () => {
      const data = { nama: document.getElementById('msl_nama').value.trim(), area: document.getElementById('msl_area').value.trim(), telepon: document.getElementById('msl_tlp').value.trim(), target_bulanan: parseInt(document.getElementById('msl_target').value)||0 };
      if (!data.nama) { APP.toast('Nama harus diisi','error'); return; }
      if (id) { DATA.updateItem('sales', id, data); APP.toast('Sales diperbarui','success'); }
      else { DATA.addItem('sales', {...data, id:'SL'+Date.now()}); APP.toast('Sales ditambahkan','success'); }
      APP.closeModal(); APP.navigate('master-sales');
    });
  },

  delete(id) { if (confirm('Hapus sales?')) { DATA.deleteItem('sales', id); APP.toast('Dihapus','warning'); APP.navigate('master-sales'); } }
};

window.MASTER_PRODUK = MASTER_PRODUK;
window.MASTER_PELANGGAN = MASTER_PELANGGAN;
window.MASTER_SUPPLIER = MASTER_SUPPLIER;
window.MASTER_KENDARAAN = MASTER_KENDARAAN;
window.MASTER_SALES = MASTER_SALES;
