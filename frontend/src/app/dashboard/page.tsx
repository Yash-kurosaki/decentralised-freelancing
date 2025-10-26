'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!connected) {
      router.push('/');
    }
  }, [connected, router]);

  useEffect(() => {
    const getBalance = async () => {
      if (publicKey && connection) {
        try {
          const bal = await connection.getBalance(publicKey);
          setBalance(bal / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error('Error fetching balance:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    getBalance();
  }, [publicKey, connection]);

  const handleSaveProfile = () => {
    localStorage.setItem('username', username);
    localStorage.setItem('bio', bio);
    setIsEditing(false);
    alert('Profile saved! (Using localStorage for now)');
  };

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    const savedBio = localStorage.getItem('bio');
    if (savedUsername) setUsername(savedUsername);
    if (savedBio) setBio(savedBio);
  }, []);

  if (!connected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 
            className="text-2xl font-bold text-white cursor-pointer hover:text-purple-300 transition-colors"
            onClick={() => router.push('/')}
          >
            RepChain
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-purple-200 text-sm font-mono">
              {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Profile Card - Clean Glass */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl border border-white/30">
                  👤
                </div>
                
                {/* Info */}
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="bg-white/10 text-white text-2xl font-bold px-4 py-2 rounded-lg mb-2 border border-white/30 focus:border-white/50 focus:outline-none backdrop-blur-sm"
                    />
                  ) : (
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {username || 'Anonymous User'}
                    </h2>
                  )}
                  <p className="text-purple-200 font-mono text-sm">
                    {publicKey?.toBase58()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-6 py-2 rounded-lg transition-all border border-white/30"
              >
                {isEditing ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <label className="text-purple-200 text-sm font-semibold mb-2 block">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full bg-white/10 text-white px-4 py-3 rounded-lg border border-white/30 focus:border-white/50 focus:outline-none resize-none backdrop-blur-sm"
                />
              ) : (
                <p className="text-white/80">
                  {bio || 'No bio added yet. Click Edit Profile to add one!'}
                </p>
              )}
            </div>
          </div>

          {/* Stats Grid - Uniform Glass */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Balance */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">💰</span>
                <h3 className="text-white/70 text-sm font-semibold">Balance</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                {loading ? '...' : balance?.toFixed(4)} SOL
              </p>
              <p className="text-purple-200 text-xs mt-2">Devnet Balance</p>
            </div>

            {/* Reputation Score */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">⭐</span>
                <h3 className="text-white/70 text-sm font-semibold">Reputation</h3>
              </div>
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-purple-200 text-xs mt-2">Connect GitHub to start</p>
            </div>

            {/* Jobs Completed */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">✅</span>
                <h3 className="text-white/70 text-sm font-semibold">Jobs Done</h3>
              </div>
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-purple-200 text-xs mt-2">Complete jobs to build reputation</p>
            </div>
          </div>

          {/* Quick Actions - Transparent Glass */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Quick Actions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold py-6 px-6 rounded-xl transition-all transform hover:scale-105 text-left">
                <div className="text-3xl mb-3">🔗</div>
                <div className="font-bold text-lg">Connect GitHub</div>
                <div className="text-sm text-purple-200 mt-1">Import your dev work</div>
              </button>
              
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold py-6 px-6 rounded-xl transition-all transform hover:scale-105 text-left">
                <div className="text-3xl mb-3">💼</div>
                <div className="font-bold text-lg">Browse Jobs</div>
                <div className="text-sm text-purple-200 mt-1">Find work opportunities</div>
              </button>
              
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold py-6 px-6 rounded-xl transition-all transform hover:scale-105 text-left">
                <div className="text-3xl mb-3">📤</div>
                <div className="font-bold text-lg">Upload Portfolio</div>
                <div className="text-sm text-purple-200 mt-1">Showcase your work</div>
              </button>
              
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold py-6 px-6 rounded-xl transition-all transform hover:scale-105 text-left">
                <div className="text-3xl mb-3">📊</div>
                <div className="font-bold text-lg">View Analytics</div>
                <div className="text-sm text-purple-200 mt-1">Track your progress</div>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}