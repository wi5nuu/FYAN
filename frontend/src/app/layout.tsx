import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Providers } from '@/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fiyan Project - E-Commerce, POS, ERP & CMS',
  description: 'Sistem Terintegrasi E-Commerce, Point of Sale, Enterprise Resource Planning & Content Management System',
  keywords: ['ecommerce', 'pos', 'erp', 'cms', 'sistem terintegrasi'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Providers>
          <Toaster position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
