import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { WalletContextProvider } from '@/components/WalletProvider';

const momoTrust = localFont({
  src: './fonts/Momo_Trust_Display/MomoTrustDisplay-Regular.ttf',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Decentralized Freelance Platform',
  description: 'Build your reputation on-chain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={momoTrust.className}>
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}