import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import '../app/globals.css';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  themeColor: '#ec751c',
};

export const metadata: Metadata = {
  title: 'Kurious - QR Order for Korean Restaurants',
  description:
    'Scan QR, order in your language. AI docent, multi-language menu, and easy payment for travelers in Korea.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'QRIOUS' },
  icons: { apple: '/icons/icon-192x192.png' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${notoSansKr.variable} font-sans antialiased min-h-screen bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
