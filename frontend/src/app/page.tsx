'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { CustomWalletButton } from '@/components/CustomWalletButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';
import { Bungee } from 'next/font/google';
const bungee = Bungee({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});


export default function Home() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden relative">

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] bg-gradient-to-r from-gray-600/30 to-gray-800/20 rounded-full blur-3xl"
          //animate-pulse"
          style={{
            top: '10%',
            left: '20%',
            animation: 'float 20s ease-in-out infinite'
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] bg-gradient-to-r from-gray-700/15 to-gray-500/15 rounded-full blur-3xl"
          //animate-pulse
          style={{
            bottom: '10%',
            right: '10%',
            animation: 'float 25s ease-in-out infinite reverse'
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] bg-gradient-to-r from-gray-600/20 to-gray-400/20 rounded-full blur-3xl"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(156, 163, 175, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(156, 163, 175, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-black/30 border-b border-gray-800/50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-300/60 via-gray-500/50 to-gray-700/60 blur-lg opacity-90 shadow-[0_0_15px_rgba(180,180,180,0.4)]" />

              {/* First rotating ring */}
              <div className="absolute inset-[2px] rounded-full border-[2px] border-transparent bg-gradient-to-r from-gray-400 via-gray-200 to-gray-500 animate-spin-slow" />

              {/* Second counter-rotating ring */}
              <div className="absolute inset-[6px] rounded-full border-[2px] border-transparent bg-gradient-to-l from-gray-700 via-gray-600 to-gray-800 animate-spin-reverse-slow" />

              {/* Core hexagon */}
              <div className="relative w-5 h-5 rotate-45 bg-gradient-to-br from-gray-300 via-gray-500 to-gray-800/70 border border-gray-300" />
            </div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 bg-clip-text text-transparent tracking-wide">
              RepChain
            </h1>
          </div>
          {mounted && (publicKey ? <CustomWalletButton /> : <WalletMultiButton />)}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-0 container mx-auto px-6 py-20">

        {/* Main Headline with Glitch Effect */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full text-sm text-gray-300">
              ⚡ Powered by Solana
            </span>
          </div>

          <h2 className={`${bungee.className} text-7xl md:text-8xl font-black mb-6 leading-tight`}>
            <span className="bg-gradient-to-r from-gray-100 via-gray-300 to-gray-500 bg-clip-text text-transparent inline-block animate-gradient">
              Your Reputation
            </span>
            <br />
            <span className="bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 bg-clip-text text-transparent inline-block">
              Your Power
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Build an <span className="text-gray-200 font-semibold">immutable</span>,
            <span className="text-gray-200 font-semibold"> AI-verified</span> reputation score
            that follows you everywhere. No gatekeepers. No manipulation.
          </p>

          {/* CTA Section */}
          {mounted && connected && publicKey ? (
            <div className="max-w-lg mx-auto">
              <div className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl hover:border-gray-600 transition-all duration-300 transform hover:scale-105">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-600/0 via-gray-500/20 to-gray-600/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

                <div className="relative">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-green-400 text-lg font-semibold">Connected</p>
                  </div>

                  <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg mb-6 font-mono text-sm text-gray-300 break-all border border-gray-800">
                    {publicKey.toBase58()}
                  </div>

                  <button
                    onClick={() => router.push('/dashboard')}
                    className="group/btn w-full relative bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Launch Dashboard
                      <Zap className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-500/0 via-gray-400/30 to-gray-500/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-lg mx-auto bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-10 border border-gray-700/50 shadow-2xl">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-300 text-lg mb-2 font-semibold">Ready to Start?</p>
              <p className="text-gray-500 text-sm mb-6">
                Connect your wallet to build your on-chain identity
              </p>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-6" />
              <p className="text-gray-600 text-xs">
                Supported: Phantom • Solflare • More coming soon
              </p>
            </div>
          )}
        </div>

        {/* Feature Cards with 3D Tilt Effect */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 max-w-6xl mx-auto">

          {/* Card 1 */}
          <div className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600 transition-all duration-500 transform hover:scale-105 hover:-rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600/0 to-gray-700/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative">
              <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center mb-6 border border-gray-700 group-hover:border-gray-600 transition-colors">
                <Shield className="w-8 h-8 text-gray-400 group-hover:text-gray-300 transition-colors" />
              </div>

              <h3 className="text-2xl font-bold text-gray-200 mb-3">Immutable</h3>
              <p className="text-gray-400 leading-relaxed">
                Your reputation lives on Solana. Permanent, transparent, and owned by you. Forever.
              </p>

              <div className="mt-6 flex items-center gap-2 text-gray-500 text-sm">
                <div className="w-2 h-2 bg-gray-600 rounded-full" />
                <span>Blockchain verified</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600 transition-all duration-500 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600/0 to-gray-700/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative">
              <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center mb-6 border border-gray-700 group-hover:border-gray-600 transition-colors">
                <Sparkles className="w-8 h-8 text-gray-400 group-hover:text-gray-300 transition-colors" />
              </div>

              <h3 className="text-2xl font-bold text-gray-200 mb-3">AI-Powered</h3>
              <p className="text-gray-400 leading-relaxed">
                Advanced algorithms analyze GitHub, work history, and on-chain activity. No gaming the system.
              </p>

              <div className="mt-6 flex items-center gap-2 text-gray-500 text-sm">
                <div className="w-2 h-2 bg-gray-600 rounded-full" />
                <span>Machine learning</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600 transition-all duration-500 transform hover:scale-105 hover:rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600/0 to-gray-700/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative">
              <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center mb-6 border border-gray-700 group-hover:border-gray-600 transition-colors">
                <TrendingUp className="w-8 h-8 text-gray-400 group-hover:text-gray-300 transition-colors" />
              </div>

              <h3 className="text-2xl font-bold text-gray-200 mb-3">Portable</h3>
              <p className="text-gray-400 leading-relaxed">
                One reputation across all platforms. Switch marketplaces without starting from zero.
              </p>

              <div className="mt-6 flex items-center gap-2 text-gray-500 text-sm">
                <div className="w-2 h-2 bg-gray-600 rounded-full" />
                <span>Cross-platform</span>
              </div>
            </div>
          </div>

        </div>

        {/* Stats Section */}
        <div className="mt-32 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-2xl rounded-3xl p-12 border border-gray-700/50">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div>
                <div className="text-5xl font-black bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
                  0.4ms
                </div>
                <p className="text-gray-500 text-sm">Transaction Speed</p>
              </div>
              <div>
                <div className="text-5xl font-black bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
                  $0.00025
                </div>
                <p className="text-gray-500 text-sm">Average Gas Fee</p>
              </div>
              <div>
                <div className="text-5xl font-black bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
                  100%
                </div>
                <p className="text-gray-500 text-sm">Decentralized</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-32 border-t border-gray-800/50 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="text-gray-400 text-sm">© 2024 RepChain. Built on Solana.</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-300 transition-colors">Documentation</a>
              <a href="#" className="hover:text-gray-300 transition-colors">GitHub</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}