import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Bungee } from 'next/font/google'
const bungee = Bungee({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})
import { WalletContextProvider } from '@/components/WalletProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Decentralized Freelance Platform',
  description: 'Build your reputation on-chain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={bungee.className}>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  )
}

