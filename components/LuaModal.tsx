import React, { useState } from 'react';
import { LUA_HEARTBEAT_SCRIPT } from '../lib/luaSnippet';

interface LuaModalProps {
  onCopyScript: (script: string) => void;
  onSendHeartbeat: (count: number, status: 'online' | 'offline') => Promise<void>;
  lang: 'id' | 'en';
}

export const LuaModal: React.FC<LuaModalProps> = ({
  onCopyScript,
  onSendHeartbeat,
  lang,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [testPlayerCount, setTestPlayerCount] = useState(165);
  const [isSending, setIsSending] = useState(false);

  const handleTestHeartbeat = async (status: 'online' | 'offline') => {
    setIsSending(true);
    try {
      await onSendHeartbeat(testPlayerCount, status);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="lua-admin" className="glass-panel p-6 sm:p-8 mb-6 border border-emerald-500/20">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
            Lua
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>GTPS Cloud Heartbeat Integration</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                Lua 5.x
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              {lang === 'id'
                ? 'Script heartbeat otomatis untuk server Growtopia Private Server kamu'
                : 'Automated heartbeat script for your Growtopia Private Server'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCopyScript(LUA_HEARTBEAT_SCRIPT)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
            <span>{lang === 'id' ? 'Salin Script Lua' : 'Copy Lua Script'}</span>
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs border border-white/10 transition cursor-pointer"
          >
            {isOpen ? (lang === 'id' ? 'Tutup Preview' : 'Close Preview') : (lang === 'id' ? 'Lihat Code' : 'View Code')}
          </button>
        </div>
      </div>

      {/* Simulator Quick Action Banner */}
      <div className="bg-neutral-900/80 rounded-xl p-4 border border-emerald-500/20 mb-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-xs text-neutral-300">
          <span className="font-semibold text-emerald-400">
            {lang === 'id' ? 'Simulator Status:' : 'Status Simulator:'}{' '}
          </span>
          {lang === 'id'
            ? 'Uji kirim heartbeat langsung ke API tanpa harus menyalakan VPS GTPS'
            : 'Test sending heartbeats to the live API without running the full VPS'}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
            <span className="text-[11px] text-neutral-400">Players:</span>
            <input
              type="number"
              min="0"
              max="1000"
              value={testPlayerCount}
              onChange={(e) => setTestPlayerCount(Number(e.target.value))}
              className="w-14 text-center bg-transparent text-emerald-300 font-mono text-xs outline-none"
            />
          </div>

          <button
            onClick={() => handleTestHeartbeat('online')}
            disabled={isSending}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white font-medium text-xs border border-emerald-400/40 transition cursor-pointer disabled:opacity-50"
          >
            {isSending ? 'Sending...' : '⚡ Kirim Heartbeat (Online)'}
          </button>
        </div>
      </div>

      {/* Code Snippet Box */}
      {isOpen && (
        <div className="mt-3 relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950/90 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/80 border-b border-neutral-800 text-[11px] text-neutral-400 font-mono">
            <span>gtps_heartbeat.lua (GTPS Cloud)</span>
            <span>POST /api/heartbeat (interval: 30s)</span>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-72 leading-relaxed">
            {LUA_HEARTBEAT_SCRIPT}
          </pre>
        </div>
      )}
    </section>
  );
};
