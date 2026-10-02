import React from 'react';

interface LangSwitchProps {
  currentLang: 'id' | 'en';
  onSwitch: (lang: 'id' | 'en') => void;
}

/**
 * Komponen LangSwitch (Tema Sandbox / Blocky)
 *
 * Pengganti bahasa Indonesia (ID) dan English (EN)
 * dengan gaya balok tebal dan animasi flipBlock bertahap (steps).
 */
export const LangSwitch: React.FC<LangSwitchProps> = ({ currentLang, onSwitch }) => {
  return (
    <div className="lang-box-container shrink-0">
      {/* Tombol Bahasa Indonesia */}
      <button
        onClick={() => onSwitch('id')}
        aria-label="Bahasa Indonesia"
        className={`lang-btn-item ${currentLang === 'id' ? 'active' : 'inactive'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 32 32">
          <path d="M31,8c0-2.209-1.791-4-4-4H5c-2.209,0-4,1.791-4,4v9H31V8Z" fill="#ea3323"></path>
          <path d="M5,28H27c2.209,0,4-1.791,4-4v-8H1v8c0,2.209,1.791,4,4,4Z" fill="#fff"></path>
          <path
            d="M5,28H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4ZM2,8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8Z"
            opacity=".15"
          ></path>
        </svg>
        <span>ID</span>
      </button>

      {/* Tombol English */}
      <button
        onClick={() => onSwitch('en')}
        aria-label="English"
        className={`lang-btn-item ${currentLang === 'en' ? 'active' : 'inactive'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 32 32">
          <rect x="1" y="4" width="30" height="24" rx="2" ry="2" fill="#fff"></rect>
          <path
            d="M1.638,5.846H30.362c-.711-1.108-1.947-1.846-3.362-1.846H5c-1.414,0-2.65,.738-3.362,1.846Z"
            fill="#a62842"
          ></path>
          <path
            d="M2.03,7.692c-.008,.103-.03,.202-.03,.308v1.539H31v-1.539c0-.105-.022-.204-.03-.308H2.03Z"
            fill="#a62842"
          ></path>
          <path fill="#a62842" d="M2 11.385H31V13.231H2z"></path>
          <path fill="#a62842" d="M2 15.077H31V16.923H2z"></path>
          <path fill="#a62842" d="M1 18.769H31V20.615H1z"></path>
          <path
            d="M1,24c0,.105,.023,.204,.031,.308H30.969c.008-.103,.031-.202,.031-.308v-1.539H1v1.539Z"
            fill="#a62842"
          ></path>
          <path
            d="M30.362,26.154H1.638c.711,1.108,1.947,1.846,3.362,1.846H27c1.414,0,2.65-.738,3.362-1.846Z"
            fill="#a62842"
          ></path>
          <path d="M5,4h11v12.923H1V8c0-2.208,1.792-4,4-4Z" fill="#102d5e"></path>
        </svg>
        <span>EN</span>
      </button>
    </div>
  );
};

export default LangSwitch;
