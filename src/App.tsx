import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { StatsCard } from '../components/StatsCard';
import { PlayerList } from '../components/PlayerList';
import { TabBar } from '../components/TabBar';
import { DownloadSection } from '../components/DownloadSection';
import { CommunitySection } from '../components/CommunitySection';
import { GuideSection } from '../components/GuideSection';
import { BroadcastBanner } from '../components/BroadcastBanner';
import { AdminDashboard } from '../components/AdminDashboard';
import { Toast } from '../components/Toast';
import { Footer } from '../components/Footer';
import { StatusResponse, ServerStatus, PlayerInfo, BroadcastMessage } from '../lib/types';

const HOSTS_FILE_CONTENT = `15.235.227.241 growtopia1.com
15.235.227.241 growtopia2.com
15.235.227.241 www.growtopia1.com
15.235.227.241 www.growtopia2.com`;

export default function App() {
  const [currentView, setCurrentView] = useState<'public' | 'admin'>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      return 'admin';
    }
    return 'public';
  });

  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [activeTab, setActiveTab] = useState('download');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Broadcast
  const [broadcast, setBroadcast] = useState<BroadcastMessage | null>(null);

  // Server Live Status
  const [status, setStatus] = useState<ServerStatus>('ONLINE');
  const [serverName, setServerName] = useState('LegendTopia');
  const [playerCount, setPlayerCount] = useState(142);
  const [maxPlayers, setMaxPlayers] = useState(1000);
  const [players, setPlayers] = useState<PlayerInfo[]>([
    { name: 'DrLegend', world: 'START', level: 120, role: 'Owner' },
    { name: 'EmeraldKing', world: 'TRADE', level: 85, role: 'Admin' },
    { name: 'PixelPro', world: 'BUYGHC', level: 64 },
    { name: 'RayhanGT', world: 'FARM', level: 52 },
    { name: 'SkyGrower', world: 'BFG', level: 41 },
    { name: 'VortexX', world: 'CASINO', level: 99 },
    { name: 'Ahmad_ID', world: 'START', level: 33 },
    { name: 'ZeusTopia', world: 'PARKOUR', level: 77 },
    { name: 'IndoPride', world: 'VEND', level: 29 },
    { name: 'GrowMaster', world: 'LEGEND', level: 110, role: 'Mod' },
  ]);
  const [uptime, setUptime] = useState('14d 6h 32m');
  const [worldCount, setWorldCount] = useState(38);
  const [lastSeenSecondsAgo, setLastSeenSecondsAgo] = useState(5);
  const [ip, setIp] = useState('15.235.227.241');
  const [port, setPort] = useState(17091);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // Handle URL changes & history
  const navigateTo = useCallback((view: 'public' | 'admin') => {
    setCurrentView(view);
    const targetPath = view === 'admin' ? '/admin' : '/';
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/admin')) {
        setCurrentView('admin');
      } else {
        setCurrentView('public');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch broadcast
  const fetchBroadcast = useCallback(async () => {
    try {
      const res = await fetch('/api/broadcast');
      if (res.ok) {
        const data = await res.json();
        setBroadcast(data.broadcast || null);
      }
    } catch {
      // ignore
    }
  }, []);

  // Poll status endpoint every 5 seconds (Heartbeat architecture requirement)
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status', { cache: 'no-store' });
      if (!res.ok) throw new Error('Status fetch failed');
      const data: StatusResponse = await res.json();

      if (data && data.server) {
        setStatus(data.status);
        setServerName(data.server.name || 'LegendTopia');
        setPlayerCount(data.server.playerCount ?? 0);
        setMaxPlayers(data.server.maxPlayers || 1000);
        if (data.server.players && data.server.players.length > 0) {
          setPlayers(data.server.players);
        }
        setUptime(data.server.uptime || 'Active');
        setWorldCount(data.server.worldCount || 0);
        setLastSeenSecondsAgo(data.server.lastSeenSecondsAgo || 0);
        if (data.server.ip) setIp(data.server.ip);
        if (data.server.port) setPort(data.server.port);
      }
    } catch {
      // In case server is offline or unreachable
      setStatus((prev) => (prev === 'OFFLINE' ? 'OFFLINE' : 'STALE'));
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchBroadcast();
    const interval = setInterval(() => {
      fetchStatus();
      fetchBroadcast();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchBroadcast]);

  // Tab scroll navigation
  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Scroll spy to update active tab
  useEffect(() => {
    if (currentView !== 'public') return;
    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const sections = ['download', 'community', 'guide'];
        const scrollPosition = window.scrollY + 160;

        for (const sectionId of sections) {
          const el = document.getElementById(sectionId);
          if (el) {
            const top = el.offsetTop;
            const bottom = top + el.offsetHeight;
            if (scrollPosition >= top && scrollPosition < bottom) {
              setActiveTab(sectionId);
              break;
            }
          }
        }
      }, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, [currentView]);

  // Action Handlers
  const handleCopyHost = () => {
    navigator.clipboard
      .writeText(HOSTS_FILE_CONTENT)
      .then(() => {
        showToast(lang === 'id' ? 'Host berhasil disalin!' : 'Hosts text copied successfully!');
      })
      .catch(() => {
        showToast(lang === 'id' ? 'Gagal menyalin host' : 'Failed to copy host');
      });
  };

  const handleCopyIpOnly = () => {
    navigator.clipboard
      .writeText(ip)
      .then(() => {
        showToast(lang === 'id' ? `IP ${ip} berhasil disalin!` : `IP ${ip} copied to clipboard!`);
      })
      .catch(() => {
        showToast(lang === 'id' ? 'Gagal menyalin IP' : 'Failed to copy IP');
      });
  };

  const handleDownloadHost = () => {
    const blob = new Blob([HOSTS_FILE_CONTENT], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'host.txt';
    link.click();
    showToast(lang === 'id' ? 'File host.txt berhasil diunduh!' : 'File host.txt downloaded!');
  };

  const handleCopyPowerTunnel = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://legendtopia.vercel.app';
    const url = `${origin}/gtps-host.txt`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        showToast(lang === 'id' ? 'PowerTunnel URL disalin!' : 'PowerTunnel URL copied!');
      })
      .catch(() => {
        showToast('Gagal menyalin URL');
      });
  };

  const handleCopyHostGo = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://legendtopia.vercel.app';
    const url = `${origin}/gtps.host`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        showToast(lang === 'id' ? 'Host GO URL disalin!' : 'Host GO URL copied!');
      })
      .catch(() => {
        showToast('Gagal menyalin URL');
      });
  };

  const handleDownloadIos = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://legendtopia.vercel.app';
    window.location.href = `${origin}/api/ios`;
  };

  // If in Admin view, render AdminDashboard
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen relative flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
        <AdminDashboard
          onBackToSite={() => navigateTo('public')}
          showToast={showToast}
        />
        <Footer serverName={serverName} lang={lang} />
        <Toast message={toastMessage} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-between selection:bg-[#facc15] selection:text-black text-[#1e293b]">
      {/* Broadcast Announcement Banner */}
      <BroadcastBanner broadcast={broadcast} />

      {/* Sticky Tab Bar */}
      <TabBar activeTab={activeTab} onTabClick={scrollToSection} lang={lang} />

      <main className="max-w-[1000px] w-full mx-auto px-4 py-4 sm:py-8 z-10 flex-1">
        {/* Header Section */}
        <header className="text-center mb-6 pt-2">
          <h1 className="sandbox-title text-3xl sm:text-5xl md:text-6xl font-black">
            {serverName}
          </h1>
          <p className="sandbox-subtitle mt-2">
            {lang === 'id'
              ? '★ GROWTOPIA PRIVATE SERVER • STATUS REAL-TIME ★'
              : '★ GROWTOPIA PRIVATE SERVER • REAL-TIME MONITOR ★'}
          </p>
        </header>

        {/* Server Status Badge with GIF & near real-time pulse */}
        <StatusBadge
          online={status === 'ONLINE'}
          stale={status === 'STALE'}
        />

        {/* Statistics Card */}
        <div className="stats-grid">
          <StatsCard
            label={lang === 'id' ? 'Pemain Online' : 'Players Online'}
            value={status === 'OFFLINE' ? 0 : `${playerCount} / ${maxPlayers}`}
          />
          <StatsCard
            label={lang === 'id' ? 'Server Uptime' : 'Uptime'}
            value={status === 'OFFLINE' ? '0h 0m' : uptime}
          />
          <StatsCard
            label="World Aktif"
            value={status === 'OFFLINE' ? 0 : worldCount}
          />
          <StatsCard
            label="Server Port"
            value={port}
          />
        </div>

        {/* Online Player List */}
        <PlayerList
          players={
            status === 'OFFLINE'
              ? []
              : players.map((p) => (typeof p === 'string' ? p : p.name))
          }
        />

        {/* Download & Host Section */}
        <DownloadSection
          onCopyHost={handleCopyHost}
          onDownloadHost={handleDownloadHost}
          onCopyPowerTunnel={handleCopyPowerTunnel}
          onCopyHostGo={handleCopyHostGo}
          onDownloadIos={handleDownloadIos}
          lang={lang}
        />

        {/* Community Section */}
        <CommunitySection
          whatsappUrl="https://chat.whatsapp.com/Be7XDHPekX75w51D5wz1WY?mode=wwt"
          discordUrl="https://discord.gg/y8YhFER2K3"
          lang={lang}
        />

        {/* How to Play Guide Slider */}
        <GuideSection
          lang={lang}
          onLangSwitch={setLang}
          onCopyIpOnly={handleCopyHost}
        />
      </main>

      {/* Footer with Admin Portal Access */}
      <Footer
        serverName={serverName}
        lang={lang}
        onOpenAdmin={() => navigateTo('admin')}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}

