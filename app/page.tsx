'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StatusResponse, ServerStatus, BroadcastMessage } from '../lib/types';

// Import komponen-komponen utama halaman
import { BroadcastBanner } from '../components/BroadcastBanner';
import { StatusBadge } from '../components/StatusBadge';
import { StatsCard } from '../components/StatsCard';
import { PlayerList } from '../components/PlayerList';
import { TabBar } from '../components/TabBar';
import { DownloadSection } from '../components/DownloadSection';
import { GuideSection } from '../components/GuideSection';
import { CommunitySection } from '../components/CommunitySection';
import { Footer } from '../components/Footer';
import { Toast } from '../components/Toast';
import { LangSwitch } from '../components/LangSwitch';
import { LuaModal } from '../components/LuaModal';
import { AdminDashboard } from '../components/AdminDashboard';

export default function HomePage() {
  // State data status server dari API /api/status
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [broadcast, setBroadcast] = useState<BroadcastMessage | null>(null);

  // State navigasi & bahasa
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [activeTab, setActiveTab] = useState<'download' | 'guide' | 'community'>('download');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAdminPortal, setShowAdminPortal] = useState<boolean>(false);

  // Menampilkan notifikasi popup toast ringkas
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  // Mengambil status server terkini dari endpoint /api/status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status', {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: StatusResponse = await res.json();
        setStatusData(json);
      }
    } catch (err: unknown) {
      console.error('[Client] Gagal memuat status dari /api/status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mengambil data broadcast pengumuman
  const fetchBroadcast = useCallback(async () => {
    try {
      const res = await fetch('/api/broadcast', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.broadcast && json.broadcast.active) {
          setBroadcast(json.broadcast);
        } else {
          setBroadcast(null);
        }
      }
    } catch {
      // Broadcast opsional
    }
  }, []);

  // Polling data status setiap 5 detik dengan useEffect + setInterval
  useEffect(() => {
    fetchStatus();
    fetchBroadcast();

    const intervalId = setInterval(() => {
      fetchStatus();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchStatus, fetchBroadcast]);

  // Handler salin IP server
  const handleCopyIp = () => {
    const ip = statusData?.server.ip || '15.235.227.241';
    navigator.clipboard.writeText(ip);
    showToast(lang === 'id' ? `IP ${ip} berhasil disalin!` : `IP ${ip} copied!`);
  };

  // Handler salin konfigurasi host GTPS
  const handleCopyHost = () => {
    const ip = statusData?.server.ip || '15.235.227.241';
    const hostContent = `${ip} growtopia1.com\n${ip} growtopia2.com\n${ip} www.growtopia1.com\n${ip} www.growtopia2.com`;
    navigator.clipboard.writeText(hostContent);
    showToast(lang === 'id' ? 'Hosts text berhasil disalin!' : 'Hosts text copied!');
  };

  // Handler unduh file host
  const handleDownloadHost = () => {
    const link = document.createElement('a');
    link.href = '/gtps.host';
    link.download = 'gtps.host';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(lang === 'id' ? 'Mengunduh gtps.host...' : 'Downloading gtps.host...');
  };

  // Handler unduh konfigurasi iOS Surge 5
  const handleDownloadIos = () => {
    const link = document.createElement('a');
    link.href = '/api/ios';
    link.download = 'LegendTopia-Surge.conf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(lang === 'id' ? 'Mengunduh konfigurasi Surge iOS...' : 'Downloading Surge iOS config...');
  };

  const handleCopyPowerTunnel = () => {
    const ip = statusData?.server.ip || '15.235.227.241';
    navigator.clipboard.writeText(`growtopia1.com=${ip}\ngrowtopia2.com=${ip}`);
    showToast(lang === 'id' ? 'DNS Rule PowerTunnel disalin!' : 'PowerTunnel DNS Rule copied!');
  };

  const handleCopyHostGo = () => {
    handleCopyHost();
  };

  // Kirim heartbeat pengujian dari antarmuka Lua
  const handleSendHeartbeat = async (count: number, status: 'online' | 'offline') => {
    try {
      const res = await fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: '193679634487',
          serverName: 'DrivePs',
          playerCount: status === 'online' ? count : 0,
          maxPlayers: 1000,
          uptime: '1h 0m',
          players:
            status === 'online'
              ? [
                  { name: 'DrLegend', world: 'START', role: 'Owner' },
                  { name: 'EmeraldKing', world: 'TRADE', role: 'Admin' },
                ]
              : [],
        }),
      });
      if (res.ok) {
        showToast(lang === 'id' ? 'Heartbeat simulasi terkirim!' : 'Simulated heartbeat sent!');
        fetchStatus();
      }
    } catch {
      showToast('Gagal mengirim heartbeat simulasi');
    }
  };

  // Data status server yang telah di-fallback
  const server = statusData?.server;
  const currentStatus: ServerStatus = statusData?.status || 'OFFLINE';
  const playerCount = server?.playerCount ?? 0;
  const maxPlayers = server?.maxPlayers ?? 1000;
  const uptime = server?.uptime ?? '0h 0m';
  const worldCount = server?.worldCount ?? 0;
  const serverIp = server?.ip ?? '15.235.227.241';
  const serverPort = server?.port ?? 17091;
  const players = server?.players ?? [];
  const lastSeenSecondsAgo = server?.lastSeenSecondsAgo ?? 999999;
  const serverName = server?.name ?? 'DrivePs';

  // Halaman Admin Dashboard jika sedang dibuka
  if (showAdminPortal) {
    return (
      <main className="min-h-screen p-4 sm:p-6 max-w-4xl mx-auto">
        <AdminDashboard
          onBackToSite={() => setShowAdminPortal(false)}
          showToast={showToast}
        />
      </main>
    );
  }

  return (
    <div className="relative min-h-screen text-[#1e293b] flex flex-col justify-between selection:bg-[#facc15] selection:text-black">
      {/* Toast notifikasi mengambang */}
      {toastMessage && <Toast message={toastMessage} />}

      {/* Broadcast pengumuman global jika ada */}
      {broadcast && broadcast.active && (
        <BroadcastBanner broadcast={broadcast} />
      )}

      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 relative z-10">
        {/* Header atas: Pengganti Bahasa & Modal Lua Code */}
        <header className="flex items-center justify-between gap-3 mb-6">
          <LuaModal
            lang={lang}
            onCopyScript={() => showToast(lang === 'id' ? 'Script Lua disalin!' : 'Lua script copied!')}
            onSendHeartbeat={handleSendHeartbeat}
          />

          <LangSwitch currentLang={lang} onSwitch={setLang} />
        </header>

        {/* Brand / Logo Server DrivePs */}
        <div className="text-center mb-6">
          <h1 className="sandbox-title text-3xl sm:text-5xl font-black">
            {serverName}
          </h1>
          <p className="sandbox-subtitle mt-2">
            {lang === 'id'
              ? '★ GROWTOPIA PRIVATE SERVER • STATUS REAL-TIME ★'
              : '★ GROWTOPIA PRIVATE SERVER • REAL-TIME MONITOR ★'}
          </p>
        </div>

        {/* 1. Status Badge (ONLINE / STALE / OFFLINE) */}
        <StatusBadge
          online={statusData?.online ?? (currentStatus === 'ONLINE')}
          stale={statusData?.stale ?? (currentStatus === 'STALE')}
        />

        {/* 2. Kartu Statistik Server (Menggunakan .stats-grid & pure CSS) */}
        <div className="stats-grid">
          <StatsCard
            label={lang === 'id' ? 'Pemain Online' : 'Players Online'}
            value={currentStatus === 'OFFLINE' ? 0 : `${playerCount} / ${maxPlayers}`}
          />
          <StatsCard
            label={lang === 'id' ? 'Server Uptime' : 'Uptime'}
            value={currentStatus === 'OFFLINE' ? '0h 0m' : uptime}
          />
          <StatsCard
            label="World Aktif"
            value={currentStatus === 'OFFLINE' ? 0 : worldCount}
          />
          <StatsCard
            label="Server Port"
            value={serverPort}
          />
        </div>

        {/* 3. Section Pemain Online Aktif */}
        <PlayerList
          players={
            currentStatus === 'OFFLINE'
              ? []
              : players.map((p) => (typeof p === 'string' ? p : p.name))
          }
        />

        {/* 4. Tab Navigasi Kategori (Download / Panduan / Komunitas) */}
        <TabBar
          activeTab={activeTab}
          onTabClick={(id) => setActiveTab(id as 'download' | 'guide' | 'community')}
          lang={lang}
        />

        {/* 5. Konten Section (Download, Community, Guide) */}
        <div className="mt-2 space-y-6">
          <DownloadSection
            onCopyHost={handleCopyHost}
            onDownloadHost={handleDownloadHost}
            onCopyPowerTunnel={handleCopyPowerTunnel}
            onCopyHostGo={handleCopyHostGo}
            onDownloadIos={handleDownloadIos}
            lang={lang}
          />

          <CommunitySection lang={lang} />

          <GuideSection
            lang={lang}
            onLangSwitch={setLang}
            onCopyIpOnly={handleCopyIp}
          />
        </div>
      </main>

      {/* Footer & Link Admin Portal */}
      <Footer
        serverName={serverName}
        lang={lang}
        onOpenAdmin={() => setShowAdminPortal(true)}
      />
    </div>
  );
}
