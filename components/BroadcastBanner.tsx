import React, { useState } from 'react';
import { BroadcastMessage } from '../lib/types';

interface BroadcastBannerProps {
  broadcast: BroadcastMessage | null;
}

/**
 * Komponen BroadcastBanner (Tema Sandbox / Blocky)
 *
 * Pengumuman global dengan latar kuning retro #facc15,
 * border tebal #ca8a04, dan badge 8-bit berbingkai hitam.
 */
export const BroadcastBanner: React.FC<BroadcastBannerProps> = ({ broadcast }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!broadcast || !broadcast.active || dismissed) return null;

  return (
    <aside
      aria-label="Server Broadcast Announcement"
      className="w-full py-2.5 px-4 bg-[#facc15] border-b-4 border-[#ca8a04] text-[#1e293b] shadow-[0_4px_0_#ca8a04]"
    >
      <div className="max-w-[1000px] mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
          <span className="font-pixel text-[9px] uppercase bg-black text-[#facc15] px-2 py-1 border border-black rounded-[2px] shadow-[2px_2px_0_#000] shrink-0">
            {broadcast.type.toUpperCase()}
          </span>
          <p className="font-retro text-lg sm:text-xl font-bold truncate text-[#1e293b]">
            {broadcast.message}
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="font-pixel text-xs text-black/70 hover:text-black p-1 hover:bg-black/10 rounded transition shrink-0 cursor-pointer"
          title="Tutup banner"
        >
          [X]
        </button>
      </div>
    </aside>
  );
};

export default BroadcastBanner;
