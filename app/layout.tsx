import type { Metadata, Viewport } from 'next';
import { Press_Start_2P, VT323 } from 'next/font/google';
import './globals.css';

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pixel',
});

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-retro',
});

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'DrivePs - Sandbox Blocky GTPS',
  description: 'DrivePs - Growtopia Private Server bertema Sandbox / Blocky dengan pemantauan status server real-time dan unduhan cepat.',
  openGraph: {
    title: 'DrivePs - Sandbox Blocky GTPS',
    description: 'DrivePs - Growtopia Private Server bertema Sandbox / Blocky dengan pemantauan status server real-time dan unduhan cepat.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${pressStart2P.variable} ${vt323.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen:wght@400;700&family=VT323&family=Inter:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`bg-[#dbeafe] text-[#1e293b] min-h-screen antialiased selection:bg-[#facc15] selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
