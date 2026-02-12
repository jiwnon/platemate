import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import '../app/globals.css';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kurious - QR Order for Korean Restaurants',
  description:
    'Scan QR, order in your language. AI docent, multi-language menu, and easy payment for travelers in Korea.',
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
