import { Metadata } from 'next';
import './globals.css'; // Ensure your styles are imported
import { Inter } from 'next/font/google'; // Optional font

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://safepay-escrow.com'), // Ganti dengan domain asli Anda
  title: {
    default: 'SafePay Escrow | Secure Polygon Blockchain Escrow Service',
    template: '%s | SafePay Escrow'
  },
  description: 'A decentralized Escrow platform powered by Smart Contracts on the Polygon network. Secure, transparent, and intermediary-free transactions.',
  keywords: ['blockchain escrow', 'crypto escrow', 'smart contract payment', 'polygon escrow', 'secure p2p payment'],
  authors: [{ name: 'SafePay Team' }],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },


  icons: {
    icon: '/favicon.ico', // Ini akan merujuk ke public/favicon.ico
    apple: '/apple-touch-icon.png', // Ini akan merujuk ke public/apple-touch-icon.png
  },


  verification: {
    google: 'your-google-verification-code', // Dapatkan dari Google Search Console
  },
  openGraph: {
    title: 'SafePay Escrow - Secure Your Crypto Transactions',
    description: 'Protect your funds with Smart Contracts. Payments are only released when the work is verified.',
    url: 'https://safepay-escrow.com',
    siteName: 'SafePay Escrow',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SafePay Escrow Preview' }],
    locale: 'en_US',
    type: 'website',
  },
};

// 2. THE FIX: The Default Export Component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}