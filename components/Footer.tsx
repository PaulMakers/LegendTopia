import React from 'react';

interface FooterProps {
  serverName?: string;
  lang: 'id' | 'en';
  onOpenAdmin?: () => void;
}

/**
 * Komponen Footer (Tema Sandbox / Blocky)
 *
 * Background biru gelap #1e40af, teks putih, border atas kuning #facc15 tebal 4px,
 * dan link discord retro kuning berbayang.
 */
export const Footer: React.FC<FooterProps> = ({
  serverName = 'DrivePs',
  lang,
  onOpenAdmin,
}) => {
  return (
    <footer className="footer-blocky">
      <p className="font-pixel text-[0.65rem] sm:text-xs text-white tracking-wider">
        &copy; {new Date().getFullYear()} {serverName}.{' '}
        {lang === 'id' ? 'SELURUH HAK CIPTA DILINDUNGI.' : 'ALL RIGHTS RESERVED.'}
      </p>

      <a
        href="https://dsc.gg/amuba"
        target="_blank"
        rel="noopener noreferrer"
        className="footer-link-discord inline-block mt-3"
      >
        https://dsc.gg/amuba
      </a>

      <p className="font-retro text-base text-blue-200 mt-3 max-w-xl mx-auto">
        {serverName} is an independent private server and is not affiliated with Ubisoft or Growtopia.
      </p>

      {onOpenAdmin && (
        <div className="mt-4 pt-3 border-t-2 border-dashed border-blue-400/40 inline-block">
          <button
            onClick={onOpenAdmin}
            className="font-pixel text-[0.6rem] text-yellow-300 hover:text-white transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
            <span>ADMIN PORTAL</span>
          </button>
        </div>
      )}
    </footer>
  );
};

export default Footer;
