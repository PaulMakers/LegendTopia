import React from 'react';

export interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

/**
 * Komponen StatsCard
 *
 * Menampilkan kartu metrik dengan efek backdrop-blur, border tipis, dan rounded 16px.
 * Nilai angka/teks ditampilkan besar dan label kecil berada di atas.
 * Menggunakan class CSS murni (.stats-card, .stats-label, .stats-value, .stats-icon).
 */
export const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon }) => {
  return (
    <div className="stats-card">
      <div className="stats-header">
        <span className="stats-label">{label}</span>
        {icon && <div className="stats-icon">{icon}</div>}
      </div>
      <div className="stats-value">{value}</div>
    </div>
  );
};

export default StatsCard;
