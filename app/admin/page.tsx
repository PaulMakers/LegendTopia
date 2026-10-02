'use client';

import React, { useState } from 'react';
import { AdminDashboard } from '../../components/AdminDashboard';
import { Toast } from '../../components/Toast';

export default function AdminPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      <AdminDashboard
        onBackToSite={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }}
        showToast={showToast}
      />
      <Toast message={toastMessage} />
    </div>
  );
}
