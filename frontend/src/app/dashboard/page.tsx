'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useRouter } from 'next/navigation';
import { CustomWalletButton } from '@/components/CustomWalletButton';
import { useAuth } from '@/hooks/useAuth';
import { Zap, Wallet, Star, CheckCircle, Github, Briefcase, Upload, BarChart3, TrendingUp, Award, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const { user, loading: authLoading, authenticate, updateProfile, isAuthenticated } = useAuth();

  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [authError, setAuthError] = useState<string | null>(null);

  // Redirect if not connected
  useEffect(() => {
    if (!connected) {
      router.push('/');
    }
  }, [connected, router]);

  // Authenticate user when wallet connects
  useEffect(() => {
    const doAuth = async () => {
      if (connected && publicKey && !isAuthenticated && !authLoading) {
        try {
          console.log('🔐 Starting authentication...');
          await authenticate();
          console.log('✅ Authentication successful!');
        } catch (error) {
          console.error('❌ Authentication failed:', error);
          setAuthError(error instanceof Error ? error.message : 'Authentication failed');
        }
      }
    };

    doAuth();
  }, [connected, publicKey, isAuthenticated, authLoading]);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setBio(user.bio || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch balance
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

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateProfile({
        username: username || undefined,
        bio: bio || undefined,
        email: email || undefined,
      });
      setIsEditing(false);
      alert('Profile saved successfully! ✅');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save profile: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (!connected) {
    return null;
  }

  // Show loading while authenticating
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-400 mb-4">Authenticating with backend...</p>
        {authError && (
          <>
            <p className="text-red-400 mb-4 text-sm">{authError}</p>
            <button
              onClick={authenticate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
            >
              🔐 Sign In with Wallet
            </button>
          </>
        )}
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden relative">

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] bg-gradient-to-r from-gray-600/20 to-gray-800/20 rounded-full blur-3xl"
          style={{
            top: '10%',
            left: '20%',
            animation: 'float 20s ease-in-out infinite'
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] bg-gradient-to-r from-gray-700/15 to-gray-500/15 rounded-full blur-3xl"
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

      {/* Grid Pattern */}
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
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
              RepChain
            </h1>
          </div>
          <CustomWalletButton />
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">

          {/* Welcome Section */}
          <div className="mb-12 animate-fade-in">
            <h2 className="text-4xl font-black bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
              Welcome Back, {user.username}
            </h2>
            <p className="text-gray-500">Manage your on-chain reputation • ID: #{user.id}</p>
          </div>

          {/* Profile Card */}
          <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl rounded-3xl p-8 mb-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-500/50 to-gray-600/50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-4xl border-2 border-gray-600 shadow-xl">
                    👤
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="bg-gray-900/50 text-white text-2xl font-bold px-4 py-2 rounded-lg border border-gray-700 focus:border-gray-500 focus:outline-none backdrop-blur-sm w-full"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email (optional)"
                        className="bg-gray-900/50 text-white text-sm px-4 py-2 rounded-lg border border-gray-700 focus:border-gray-500 focus:outline-none backdrop-blur-sm w-full"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-3xl font-black text-gray-200 mb-2">
                        {user.username || 'Anonymous User'}
                      </h2>
                      {user.email && (
                        <p className="text-gray-400 text-sm mb-2">{user.email}</p>
                      )}
                    </>
                  )}
                  <p className="text-gray-500 font-mono text-sm flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={saving}
                className="bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm text-white font-semibold px-6 py-2.5 rounded-lg transition-all border border-gray-700 hover:border-gray-600 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : isEditing ? (
                  '💾 Save Profile'
                ) : (
                  '✏️ Edit Profile'
                )}
              </button>
            </div>

            {/* Bio */}
            <div className="mt-8">
              <label className="text-gray-400 text-sm font-semibold mb-3 block flex items-center gap-2">
                <span>Bio</span>
                {!isEditing && bio && <Award className="w-4 h-4 text-gray-600" />}
              </label>
              {isEditing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full bg-gray-900/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-gray-500 focus:outline-none resize-none backdrop-blur-sm"
                />
              ) : (
                <p className="text-gray-300 leading-relaxed">
                  {user.bio || 'No bio added yet. Click Edit Profile to add one!'}
                </p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">

            {/* Balance Card */}
            <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 shadow-xl hover:scale-105 transform">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700 group-hover:border-gray-600 transition-colors">
                  <Wallet className="w-6 h-6 text-gray-400 group-hover:text-gray-300" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-gray-400 text-sm font-semibold mb-2">Balance</h3>
              <p className="text-3xl font-black text-gray-200">
                {loading ? '...' : balance?.toFixed(4)}
              </p>
              <p className="text-gray-600 text-xs mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                SOL Devnet
              </p>
            </div>

            {/* Reputation Card */}
            <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 shadow-xl hover:scale-105 transform">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700 group-hover:border-gray-600 transition-colors">
                  <Star className="w-6 h-6 text-gray-400 group-hover:text-gray-300" />
                </div>
                <div className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-500">Rank #∞</div>
              </div>
              <h3 className="text-gray-400 text-sm font-semibold mb-2">Reputation</h3>
              <p className="text-3xl font-black text-gray-200">{user.reputationScore}</p>
              <p className="text-gray-600 text-xs mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                Connect GitHub to boost
              </p>
            </div>

            {/* Jobs Card */}
            <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 shadow-xl hover:scale-105 transform">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700 group-hover:border-gray-600 transition-colors">
                  <CheckCircle className="w-6 h-6 text-gray-400 group-hover:text-gray-300" />
                </div>
                <div className="text-xs bg-green-900/30 text-green-500 px-2 py-1 rounded">Active</div>
              </div>
              <h3 className="text-gray-400 text-sm font-semibold mb-2">Jobs Done</h3>
              <p className="text-3xl font-black text-gray-200">0</p>
              <p className="text-gray-600 text-xs mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                Complete jobs to build rep
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-2xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
            <h3 className="text-2xl font-black text-gray-200 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-gray-400" />
              Quick Actions
            </h3>

            <div className="grid md:grid-cols-2 gap-4">

              <button className="group relative bg-gray-800/60 hover:bg-gray-700/60 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white font-semibold py-6 px-6 rounded-xl transition-all transform hover:scale-105 text-left overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-800">
                    <Github className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-1">Connect GitHub</div>
                    <div className="text-sm text-gray-400">Import your dev work</div>
                  </div>
                </div>
              </button>

              <button className="group relative bg-gray-800/60 hover:bg-gray-700/60 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white font-semibold py-6 px-6 rounded-xl transition-all transform hover:scale-105 text-left overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-800">
                    <Briefcase className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-1">Browse Jobs</div>
                    <div className="text-sm text-gray-400">Find work opportunities</div>
                  </div>
                </div>
              </button>

              <button className="group relative bg-gray-800/60 hover:bg-gray-700/60 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white font-semibold py-6 px-6 rounded-xl transition-all transform hover:scale-105 text-left overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-800">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-1">Upload Portfolio</div>
                    <div className="text-sm text-gray-400">Showcase your work</div>
                  </div>
                </div>
              </button>

              <button className="group relative bg-gray-800/60 hover:bg-gray-700/60 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white font-semibold py-6 px-6 rounded-xl transition-all transform hover:scale-105 text-left overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-800">
                    <BarChart3 className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-1">View Analytics</div>
                    <div className="text-sm text-gray-400">Track your progress</div>
                  </div>
                </div>
              </button>

            </div>
          </div>

        </div>
      </main>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}