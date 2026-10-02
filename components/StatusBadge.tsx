import React from 'react';

export interface StatusBadgeProps {
  online: boolean;
  stale?: boolean;
}

/**
 * Komponen StatusBadge (Tema Sandbox / Blocky)
 *
 * Menampilkan status server "ONLINE", "STALE", atau "OFFLINE"
 * dengan gaya balok 8-bit retro, badge berbingkai hitam, dan GIF 28px.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ online, stale }) => {
  let statusText = 'OFFLINE';
  let badgeColorClass = 'offline';
  let gifSrc = '/gif/offline.gif';

  if (online) {
    statusText = 'ONLINE';
    badgeColorClass = 'online';
    gifSrc = '/gif/online.gif';
  } else if (stale) {
    statusText = 'STALE';
    badgeColorClass = 'stale';
    gifSrc = '/gif/online.gif';
  }

  return (
    <div id="server-status" className="server-status">
      <span className="status-label">SERVER STATUS:</span>
      <div className="status-badge-container">
        <div className={`status-badge-box ${badgeColorClass}`}>
          <span className="status-dot-block" />
          <span>{statusText}</span>
        </div>
        <img
          src={gifSrc}
          alt={statusText}
          className="status-gif"
          width={28}
          height={28}
        />
      </div>
    </div>
  );
};

export default StatusBadge;
