import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Masif Special Sipariş Takibi',
  description: 'Siparişlerinizi kolayca takip edin',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
