import React from 'react';

interface DownloadSectionProps {
  onCopyHost: () => void;
  onDownloadHost: () => void;
  onCopyPowerTunnel: () => void;
  onCopyHostGo: () => void;
  onDownloadIos: () => void;
  lang: 'id' | 'en';
}

/**
 * Komponen DownloadSection (Tema Sandbox / Blocky)
 *
 * Menampilkan grid tombol tindakan Host & Download dengan efek 3D block press
 * menggunakan warna biru dominan #2563eb dan border tebal #1e40af.
 */
export const DownloadSection: React.FC<DownloadSectionProps> = ({
  onCopyHost,
  onDownloadHost,
  onCopyPowerTunnel,
  onCopyHostGo,
  onDownloadIos,
  lang,
}) => {
  return (
    <section id="download" className="sandbox-card p-6 sm:p-8 mb-6">
      <div className="flex items-center gap-3 pb-3 mb-6 border-b-4 border-dashed border-[#2563eb]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-[#2563eb] shrink-0"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M16 10h-5.5L8 12.5L5.5 10H0v6h16v-6zM4 14H2v-2h2v2z" />
          <path d="M10 6V0H6v6H3l5 5l5-5z" />
        </svg>
        <span className="font-pixel text-sm sm:text-base text-[#1e293b] tracking-wider">
          HOST &amp; DOWNLOAD
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Copy IP */}
        <button
          onClick={onCopyHost}
          className="btn-blocky-blue flex items-center justify-center gap-3 p-4 sm:p-5 font-pixel text-xs sm:text-sm tracking-wider"
        >
          <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
          </svg>
          <span>COPY IP</span>
        </button>

        {/* Download Host */}
        <button
          onClick={onDownloadHost}
          className="btn-blocky-blue flex items-center justify-center gap-3 p-4 sm:p-5 font-pixel text-xs sm:text-sm tracking-wider"
        >
          <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
          <span>DOWNLOAD HOST</span>
        </button>

        {/* PowerTunnel URL */}
        <button
          onClick={onCopyPowerTunnel}
          className="btn-blocky-blue flex items-center justify-center gap-3 p-4 sm:p-5 font-pixel text-xs sm:text-sm tracking-wider"
        >
          <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
          </svg>
          <span>POWERTUNNEL URL</span>
        </button>

        {/* Host GO URL */}
        <button
          onClick={onCopyHostGo}
          className="btn-blocky-blue flex items-center justify-center gap-3 p-4 sm:p-5 font-pixel text-xs sm:text-sm tracking-wider"
        >
          <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
          </svg>
          <span>HOST GO URL</span>
        </button>

        {/* iOS Host - full width */}
        <button
          onClick={onDownloadIos}
          className="col-span-1 sm:col-span-2 btn-blocky-blue flex items-center justify-center gap-3 p-4 sm:p-5 font-pixel text-xs sm:text-sm tracking-wider"
        >
          <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 400 480">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
          </svg>
          <span>IOS HOST (SURGE PROFILE)</span>
        </button>
      </div>
    </section>
  );
};

export default DownloadSection;
