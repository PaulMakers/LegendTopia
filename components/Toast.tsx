import React from 'react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

/**
 * Komponen Toast (Tema Sandbox / Blocky)
 *
 * Menampilkan notifikasi blocky dengan latar kuning #facc15,
 * border hitam tebal 3px, font pixel, dan shadow balok 6px 6px 0.
 */
export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onClose}
      className="toast-blocky cursor-pointer"
    >
      <svg
        className="w-4 h-4 shrink-0 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
      <span>{message}</span>
    </div>
  );
};

export default Toast;
