import React from 'react';

export interface PlayerListProps {
  players: string[];
}

/**
 * Komponen PlayerList
 *
 * Menampilkan daftar nama pemain yang sedang online dalam tata letak
 * grid auto-fill minmax(160px, 1fr) dengan titik hijau dan animasi transisi fade.
 * Jika kosong, menampilkan pesan "Tidak ada pemain online" dengan gaya italic.
 * Menggunakan class CSS murni (.player-list, .player-item, .player-dot, .empty).
 */
export const PlayerList: React.FC<PlayerListProps> = ({ players }) => {
  const hasPlayers = players && players.length > 0;

  return (
    <div className="player-list-container">
      <div className="player-list-header">
        <div className="player-list-title">
          <svg
            className="player-title-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <span>Pemain Online</span>
        </div>
        <span className="player-list-count">
          {hasPlayers ? players.length : 0} Online
        </span>
      </div>

      {!hasPlayers ? (
        <div className="empty">Tidak ada pemain online</div>
      ) : (
        <div className="player-list">
          {players.map((name, index) => (
            <div key={`${name}-${index}`} className="player-item">
              <span className="player-dot" />
              <span className="player-name">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerList;
