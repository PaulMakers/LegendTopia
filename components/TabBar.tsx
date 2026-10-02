import React, { useEffect } from 'react';

interface TabBarProps {
  activeTab: string;
  onTabClick: (sectionId: string) => void;
  lang: 'id' | 'en';
}

/**
 * Komponen TabBar (Tema Sandbox / Blocky)
 *
 * Sticky navigation bar dengan latar solid biru #2563eb,
 * tab aktif kuning #facc15 dengan border 3px hitam & shadow 3D balok,
 * serta auto-highlight saat halaman digulir.
 */
export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabClick, lang }) => {
  const tabs = [
    {
      id: 'download',
      label: 'DOWNLOAD',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 16 16">
          <path d="M16 10h-5.5L8 12.5L5.5 10H0v6h16v-6zM4 14H2v-2h2v2z" />
          <path d="M10 6V0H6v6H3l5 5l5-5z" />
        </svg>
      ),
    },
    {
      id: 'community',
      label: 'COMMUNITY',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 26 26">
          <path d="M17.531 1c-1.798 0-3.367.927-4.062 2.688c1.459 1.204 2.469 3.067 2.469 5.593c0 2.697-1.272 5.162-2.594 6.75c2.106.797 5.402 2.394 6.344 4.844c3.318-.184 6.28-.852 6.28-2.75V17.5c0-1.74-3.034-3.443-5.718-4.344c-.122-.04-.89-.226-.406-1.719c1.26-1.316 2.125-3.446 2.125-5.53C21.969 2.696 19.973 1 17.53 1zM8.97 4.094c-2.6 0-4.844 1.775-4.844 5.187c0 2.23 1.06 4.506 2.406 5.906c.525 1.399-.428 2.395-.625 2.47C3.186 18.653 0 20.452 0 22.25v.688c0 2.449 4.671 3 9 3c4.334 0 8.969-.551 8.969-3v-.688c0-1.852-3.208-3.635-6.063-4.594c-.13-.043-.951-.913-.437-2.5h-.031c1.34-1.4 2.5-3.654 2.5-5.875c0-3.412-2.371-5.187-4.97-5.187z" />
        </svg>
      ),
    },
    {
      id: 'guide',
      label: lang === 'id' ? 'PANDUAN' : 'GUIDE',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 897 1024">
          <path d="M832.338 192q27 0 45.5 18.5t18.5 45.5v640q0 49-66.5 88.5t-125.5 39.5h-576q-53 0-90.5-37.5T.338 896V128q0-53 37.5-90.5t90.5-37.5h704q26 0 45 19t19 45.5t-19 45t-45 18.5h-672q-13 0-22.5 9.5t-9.5 22.5t9.5 22.5t22.5 9.5h224v288q0 12 11 22t21 10l96-96l96 96q10 0 21-10t11-22V192h192z" />
        </svg>
      ),
    },
  ];

  // Auto-highlight on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ['download', 'community', 'guide'];
      const scrollPos = window.scrollY + 140;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            if (activeTab !== id) {
              onTabClick(id);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, onTabClick]);

  const handleClick = (id: string) => {
    onTabClick(id);
    const target = document.getElementById(id);
    if (target) {
      const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <nav className="sandbox-tabbar -mx-4">
      <div className="max-w-[1000px] mx-auto flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleClick(tab.id)}
              className={`sandbox-tab-item ${isActive ? 'active' : 'inactive'}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default TabBar;
