import React from 'react';

interface CommunitySectionProps {
  whatsappUrl?: string;
  discordUrl?: string;
  lang: 'id' | 'en';
}

/**
 * Komponen CommunitySection (Tema Sandbox / Blocky)
 *
 * Menampilkan tombol komunitas WhatsApp (kuning #facc15 berborder #ca8a04)
 * dan Discord (biru #2563eb berborder #1e40af) dengan efek 3D block press.
 */
export const CommunitySection: React.FC<CommunitySectionProps> = ({
  whatsappUrl = 'https://chat.whatsapp.com/Be7XDHPekX75w51D5wz1WY?mode=wwt',
  discordUrl = 'https://discord.gg/y8YhFER2K3',
  lang,
}) => {
  return (
    <section id="community" className="sandbox-card p-6 sm:p-8 mb-6">
      <div className="flex items-center gap-3 pb-3 mb-6 border-b-4 border-dashed border-[#2563eb]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-[#2563eb] shrink-0"
          viewBox="0 0 26 26"
          fill="currentColor"
        >
          <path d="M17.531 1c-1.798 0-3.367.927-4.062 2.688c1.459 1.204 2.469 3.067 2.469 5.593c0 2.697-1.272 5.162-2.594 6.75c2.106.797 5.402 2.394 6.344 4.844c3.318-.184 6.28-.852 6.28-2.75V17.5c0-1.74-3.034-3.443-5.718-4.344c-.122-.04-.89-.226-.406-1.719c1.26-1.316 2.125-3.446 2.125-5.53C21.969 2.696 19.973 1 17.53 1zM8.97 4.094c-2.6 0-4.844 1.775-4.844 5.187c0 2.23 1.06 4.506 2.406 5.906c.525 1.399-.428 2.395-.625 2.47C3.186 18.653 0 20.452 0 22.25v.688c0 2.449 4.671 3 9 3c4.334 0 8.969-.551 8.969-3v-.688c0-1.852-3.208-3.635-6.063-4.594c-.13-.043-.951-.913-.437-2.5h-.031c1.34-1.4 2.5-3.654 2.5-5.875c0-3.412-2.371-5.187-4.97-5.187z" />
        </svg>
        <span className="font-pixel text-sm sm:text-base text-[#1e293b] tracking-wider">
          COMMUNITY
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* WhatsApp Button (Kuning Aksen Sandbox) */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-blocky-yellow flex items-center justify-center gap-3 p-4 sm:p-5 font-pixel text-xs sm:text-sm tracking-wider text-center"
        >
          <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span>WHATSAPP GROUP</span>
        </a>

        {/* Discord Button (Biru Utama Sandbox) */}
        <a
          href={discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-blocky-blue flex items-center justify-center gap-3 p-4 sm:p-5 font-pixel text-xs sm:text-sm tracking-wider text-center"
        >
          <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0 a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          <span>DISCORD SERVER</span>
        </a>
      </div>
    </section>
  );
};

export default CommunitySection;
