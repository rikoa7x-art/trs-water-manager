/**
 * TRS Water — Konfigurasi Supabase
 * Inisialisasi koneksi ke Supabase backend
 */

const SUPABASE_URL  = 'https://auxjvxjgcwywuxjszxzp.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1eGp2eGpnY3d5d3V4anN6eHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjk5MDAsImV4cCI6MjA5NzY0NTkwMH0.7KcrMi88HuA7cyqs-SDmBEzQDYGe2DZBmM1-Qg-rp3c';

// Buat client Supabase (tersedia via CDN sebagai window.supabase)
try {
  window._supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('[Supabase] Client berhasil dibuat ✓');
} catch (e) {
  console.error('[Supabase] Gagal membuat client:', e.message);
  window._supa = null;
}
