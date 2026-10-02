import React, { useState, useEffect, useCallback } from 'react';
import { LUA_HEARTBEAT_SCRIPT } from '../lib/luaSnippet';
import { BroadcastMessage, BroadcastType, ServerStatus, StatusResponse } from '../lib/types';

interface AdminDashboardProps {
  onBackToSite: () => void;
  showToast: (msg: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToSite,
  showToast,
}) => {
  const [adminSecret, setAdminSecret] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginInput, setLoginInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active Admin Tab
  const [adminTab, setAdminTab] = useState<'broadcast' | 'cache' | 'lua'>('broadcast');

  // Broadcast state
  const [activeBroadcast, setActiveBroadcast] = useState<BroadcastMessage | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [broadcastType, setBroadcastType] = useState<BroadcastType>('announcement');
  const [isSavingBroadcast, setIsSavingBroadcast] = useState<boolean>(false);

  // Server state for cache view
  const [serverStatus, setServerStatus] = useState<ServerStatus>('OFFLINE');
  const [serverData, setServerData] = useState<StatusResponse['server'] | null>(null);
  const [isFlushingCache, setIsFlushingCache] = useState<boolean>(false);

  // Heartbeat Simulator in Admin
  const [simPlayers, setSimPlayers] = useState<number>(150);
  const [simUptime, setSimUptime] = useState<string>('14d 6h 30m');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Check saved session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('gtps_admin_secret');
    if (saved) {
      setAdminSecret(saved);
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch current broadcast
  const fetchBroadcast = useCallback(async () => {
    try {
      const res = await fetch('/api/broadcast');
      if (res.ok) {
        const data = await res.json();
        setActiveBroadcast(data.broadcast || null);
        if (data.broadcast?.message) {
          setBroadcastMessage(data.broadcast.message);
          setBroadcastType(data.broadcast.type);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch server status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status', { cache: 'no-store' });
      if (res.ok) {
        const data: StatusResponse = await res.json();
        setServerStatus(data.status);
        setServerData(data.server);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBroadcast();
      fetchStatus();
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchBroadcast, fetchStatus]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: loginInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const secret = loginInput.trim();
        setAdminSecret(secret);
        sessionStorage.setItem('gtps_admin_secret', secret);
        setIsAuthenticated(true);
        showToast('Login Admin berhasil!');
      } else {
        setLoginError(data.error || 'Password / GTPS_SECRET salah!');
      }
    } catch {
      setLoginError('Koneksi ke server gagal.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gtps_admin_secret');
    setAdminSecret('');
    setIsAuthenticated(false);
    setLoginInput('');
    showToast('Telah keluar dari Admin Portal');
  };

  // Broadcast Actions
  const handleSaveBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      showToast('Pesan broadcast tidak boleh kosong');
      return;
    }

    setIsSavingBroadcast(true);
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({
          message: broadcastMessage.trim(),
          type: broadcastType,
          active: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActiveBroadcast(data.broadcast);
        showToast('Broadcast berhasil dipublikasikan ke website!');
      } else {
        showToast(data.error || 'Gagal menyimpan broadcast');
      }
    } catch {
      showToast('Koneksi gagal');
    } finally {
      setIsSavingBroadcast(false);
    }
  };

  const handleClearBroadcast = async () => {
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'DELETE',
        headers: {
          'x-admin-secret': adminSecret,
        },
      });

      if (res.ok) {
        setActiveBroadcast(null);
        setBroadcastMessage('');
        showToast('Broadcast berhasil dimatikan/dihapus dari website');
      } else {
        showToast('Gagal menghapus broadcast');
      }
    } catch {
      showToast('Koneksi gagal');
    }
  };

  // Flush Redis Cache
  const handleFlushCache = async () => {
    if (!confirm('Apakah kamu yakin ingin force-refresh / mengosongkan cache status server di Redis?')) {
      return;
    }

    setIsFlushingCache(true);
    try {
      const res = await fetch('/api/admin/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
      });

      const data = await res.json();
      if (res.ok) {
        await fetchStatus();
        showToast(data.message || 'Cache Redis berhasil dibersihkan!');
      } else {
        showToast(data.error || 'Gagal membersihkan cache');
      }
    } catch {
      showToast('Koneksi gagal');
    } finally {
      setIsFlushingCache(false);
    }
  };

  // Heartbeat Simulator (Admin only)
  const handleSendTestHeartbeat = async (statusType: 'online' | 'offline') => {
    setIsSimulating(true);
    try {
      const count = statusType === 'offline' ? 0 : simPlayers;
      const res = await fetch('/api/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Soft-Authenticate-Key': adminSecret,
        },
        body: JSON.stringify({
          secret: adminSecret,
          serverName: 'LegendTopia',
          playerCount: count,
          maxPlayers: 1000,
          players:
            statusType === 'offline'
              ? []
              : [
                  { name: 'DrLegend', world: 'START', level: 120, role: 'Owner' },
                  { name: 'EmeraldKing', world: 'TRADE', level: 85, role: 'Admin' },
                  { name: 'PixelPro', world: 'BUYGHC', level: 64 },
                  { name: 'RayhanGT', world: 'FARM', level: 52 },
                  { name: 'SkyGrower', world: 'BFG', level: 41 },
                  { name: 'VortexX', world: 'CASINO', level: 99 },
                ],
          worldCount: statusType === 'offline' ? 0 : 38,
          uptime: statusType === 'offline' ? '0h 0m' : simUptime,
          version: '4.45',
        }),
      });

      if (res.ok) {
        await fetchStatus();
        showToast(`⚡ Test Heartbeat (${statusType.toUpperCase()}) terkirim! Status terupdate.`);
      } else {
        showToast('Gagal mengirim heartbeat');
      }
    } catch {
      showToast('Koneksi API gagal');
    } finally {
      setIsSimulating(false);
    }
  };

  // If NOT Authenticated, show Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full glass-panel p-6 sm:p-8 border border-emerald-500/30 bg-neutral-950/90 shadow-2xl relative overflow-hidden animate-[fadeInScale_0.5s_ease-out]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Masukkan <strong className="text-emerald-400 font-mono">GTPS_SECRET</strong> untuk mengakses dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Password / GTPS_SECRET
              </label>
              <input
                type="password"
                required
                placeholder="Masukkan GTPS_SECRET server kamu..."
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 focus:border-emerald-500 rounded-xl text-white placeholder-neutral-500 text-sm outline-none transition"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
            </button>

            <button
              type="button"
              onClick={onBackToSite}
              className="w-full py-2.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer text-center"
            >
              &larr; Kembali ke Halaman Utama
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Once Authenticated: Full Admin Dashboard
  return (
    <div className="max-w-[1000px] w-full mx-auto px-4 py-6 z-10 animate-[fadeIn_0.4s_ease-out]">
      {/* Admin Header */}
      <div className="glass-panel p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-500/30">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </span>
            <h1 className="text-xl font-bold text-white">LegendTopia Admin Portal</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              AUTHORIZED
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Status Server Sekarang:{' '}
            <strong
              className={
                serverStatus === 'ONLINE'
                  ? 'text-emerald-400'
                  : serverStatus === 'STALE'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }
            >
              {serverStatus}
            </strong>{' '}
            ({serverData?.playerCount || 0} pemain online)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToSite}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs border border-white/10 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>&larr; Lihat Website</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs border border-rose-500/30 transition cursor-pointer"
          >
            Keluar (Logout)
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setAdminTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            adminTab === 'broadcast'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'text-neutral-400 hover:text-white bg-neutral-900/60'
          }`}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
          <span>Broadcast Pengumuman</span>
        </button>

        <button
          onClick={() => setAdminTab('cache')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            adminTab === 'cache'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'text-neutral-400 hover:text-white bg-neutral-900/60'
          }`}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
          </svg>
          <span>Status &amp; Cache Redis</span>
        </button>

        <button
          onClick={() => setAdminTab('lua')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            adminTab === 'lua'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'text-neutral-400 hover:text-white bg-neutral-900/60'
          }`}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
          </svg>
          <span>Integrasi Lua (GTPS Cloud)</span>
        </button>
      </div>

      {/* TAB 1: BROADCAST MANAGER */}
      {adminTab === 'broadcast' && (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
          {/* Current Broadcast Preview */}
          <div className="glass-panel p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                Status Broadcast di Website
              </h2>
              {activeBroadcast?.active && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  SEDANG TAMPIL DI WEBSITE
                </span>
              )}
            </div>

            {activeBroadcast && activeBroadcast.active ? (
              <div className="p-4 rounded-xl bg-neutral-900/90 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase font-bold px-2.5 py-1 rounded bg-emerald-500 text-black">
                    {activeBroadcast.type}
                  </span>
                  <p className="text-sm font-medium text-white">{activeBroadcast.message}</p>
                </div>
                <button
                  onClick={handleClearBroadcast}
                  className="px-3 py-1.5 text-xs rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white border border-rose-500/40 transition cursor-pointer"
                >
                  Matikan Broadcast
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-900/40 border border-dashed border-neutral-700 text-center text-xs text-neutral-400">
                Belum ada broadcast aktif di website. Tulis pesan di bawah untuk menampilkan pengumuman banner di bagian atas website!
              </div>
            )}
          </div>

          {/* Form Create/Update Broadcast */}
          <div className="glass-panel p-6 border border-emerald-500/20">
            <h2 className="text-base font-bold text-white mb-4">Buat / Perbarui Broadcast Website</h2>

            <form onSubmit={handleSaveBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Tipe Broadcast
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'announcement', label: 'Announcement', color: 'border-emerald-500 text-emerald-400' },
                    { id: 'event', label: 'Event Game', color: 'border-purple-500 text-purple-400' },
                    { id: 'maintenance', label: 'Maintenance', color: 'border-rose-500 text-rose-400' },
                    { id: 'info', label: 'Info Update', color: 'border-blue-500 text-blue-400' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setBroadcastType(t.id as BroadcastType)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                        broadcastType === t.id
                          ? `bg-neutral-800 ${t.color} shadow-[0_0_12px_rgba(16,185,129,0.2)]`
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Teks Pengumuman
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Server sedang ada EVENT DROP PARTY jam 20:00 WIB di World START!"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full p-3.5 bg-neutral-900 border border-neutral-700 focus:border-emerald-500 rounded-xl text-white placeholder-neutral-500 text-sm outline-none transition"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-400">
                  Banner langsung muncul di semua pengunjung secara real-time.
                </span>
                <button
                  type="submit"
                  disabled={isSavingBroadcast}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/25 transition cursor-pointer disabled:opacity-50"
                >
                  {isSavingBroadcast ? 'Menyimpan...' : '🚀 Siarkan ke Website'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: STATUS & CACHE REDIS */}
      {adminTab === 'cache' && (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
          {/* Cache Control Card */}
          <div className="glass-panel p-6 border border-emerald-500/20">
            <h2 className="text-base font-bold text-white mb-2">Kontrol Cache Redis Server</h2>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Jika status server terasa macet atau ingin mereset data status secara instan tanpa menunggu waktu kedaluwarsa 180 detik, kamu bisa melakukan force-flush cache Redis di sini.
            </p>

            <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <button
                onClick={handleFlushCache}
                disabled={isFlushingCache}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
                <span>{isFlushingCache ? 'Membersihkan...' : 'Force-Flush Cache Status Redis'}</span>
              </button>

              <button
                onClick={() => fetchStatus().then(() => showToast('Status diperbarui dari server!'))}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs border border-white/10 transition cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                </svg>
                <span>Cek Ulang Status (Poll Sekarang)</span>
              </button>
            </div>
          </div>

          {/* Test Heartbeat Simulator (In Admin) */}
          <div className="glass-panel p-6 border border-white/10">
            <h2 className="text-base font-bold text-white mb-2">Simulator Sinyal Heartbeat</h2>
            <p className="text-xs text-neutral-400 mb-4">
              Uji coba sistem heartbeat seolah-olah server GTPS Cloud kamu sedang online atau offline.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Jumlah Pemain Online
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={simPlayers}
                  onChange={(e) => setSimPlayers(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Waktu Uptime
                </label>
                <input
                  type="text"
                  value={simUptime}
                  onChange={(e) => setSimUptime(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleSendTestHeartbeat('online')}
                disabled={isSimulating}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <span>⚡ Kirim Heartbeat (Set ONLINE)</span>
              </button>

              <button
                onClick={() => handleSendTestHeartbeat('offline')}
                disabled={isSimulating}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-rose-300 border border-rose-500/30 font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                <span>Simulasikan OFFLINE (0 Players)</span>
              </button>
            </div>
          </div>

          {/* Raw State Diagnostic */}
          <div className="glass-panel p-5 border border-white/10 font-mono text-xs">
            <h3 className="text-neutral-400 font-bold mb-2">RAW REDIS SERVER STATE:</h3>
            <pre className="p-3 bg-neutral-950 rounded-lg overflow-x-auto text-emerald-400/90 leading-relaxed">
              {JSON.stringify(serverData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: INTEGRATION LUA (PRIVATE TO ADMIN) */}
      {adminTab === 'lua' && (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
          <div className="glass-panel p-6 border border-emerald-500/30">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Script Lua Heartbeat GTPS Cloud</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    Kerahasiaan Tinggi
                  </span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Bagian ini hanya bisa dilihat oleh Admin. Jangan berikan script ini atau GTPS_SECRET kepada sembarang orang.
                </p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(LUA_HEARTBEAT_SCRIPT);
                  showToast('Script Lua GTPS Cloud disalin ke clipboard!');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
                <span>Salin Script Lua Lengkap</span>
              </button>
            </div>

            {/* Quick credentials cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs font-mono">
              <div className="p-3 bg-neutral-900/80 rounded-xl border border-white/5">
                <span className="text-neutral-400 block mb-1">Target Endpoint URL:</span>
                <span className="text-emerald-400 font-bold select-all break-all">
                  https://legendtopia.vercel.app/api/heartbeat
                </span>
              </div>

              <div className="p-3 bg-neutral-900/80 rounded-xl border border-white/5">
                <span className="text-neutral-400 block mb-1">Header Autentikasi:</span>
                <span className="text-emerald-400 font-bold select-all break-all">
                  X-Soft-Authenticate-Key: {adminSecret || '193679634487'}
                </span>
              </div>
            </div>

            {/* Code Box */}
            <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
              <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400 font-mono">
                <span>gtps_heartbeat.lua (GTPS Cloud)</span>
                <span>Async Coroutine &bull; Interval 30s</span>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-96 leading-relaxed">
                {LUA_HEARTBEAT_SCRIPT}
              </pre>
            </div>

            {/* Implementation Instructions */}
            <div className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-neutral-300 space-y-2">
              <h4 className="font-bold text-emerald-400">Petunjuk Pemasangan di GTPS Cloud:</h4>
              <p>1. Buka folder script server GTPS kamu (misal di folder <code className="text-emerald-300">scripts/</code> atau file startup).</p>
              <p>2. Paste kode Lua di atas.</p>
              <p>3. Ganti URL jika domain Vercel kamu berbeda.</p>
              <p>4. Script ini otomatis berjalan non-blocking di dalam coroutine setiap 30 detik tanpa mengganggu kinerja server game.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
