'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Fix hydration issue - only render wallet button after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">RepChain</h1>
        {mounted && <WalletMultiButton />}
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-6xl font-bold text-white mb-6">
            Your Reputation,<br />Your Asset
          </h2>
          <p className="text-xl text-purple-200 mb-12">
            Build verifiable, portable reputation on the blockchain.<br />
            GitHub contributions, work history, all in one score.
          </p>

          {mounted && connected && publicKey ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-green-400 text-lg mb-4">✅ Wallet Connected!</p>
              <p className="text-white text-sm font-mono break-all">
                {publicKey.toBase58()}
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                View Dashboard
              </button>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md mx-auto border border-white/20 shadow-2xl">
              <p className="text-white text-lg mb-4">Connect your wallet to start</p>
              <p className="text-purple-300 text-sm">
                Build your on-chain reputation today
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all shadow-lg">
            <div className="text-5xl mb-4">🔗</div>
            <h3 className="text-2xl font-bold text-white mb-3">Portable</h3>
            <p className="text-purple-200">Your reputation follows you across platforms</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all shadow-lg">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-white mb-3">Trustless</h3>
            <p className="text-purple-200">Smart contracts hold funds until work is verified</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all shadow-lg">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-white mb-3">AI-Verified</h3>
            <p className="text-purple-200">GitHub and work history analyzed by AI</p>
          </div>
        </div>
      </main>
    </div>
  );
}