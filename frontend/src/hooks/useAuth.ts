import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { apiService, User } from '@/lib/api';
import bs58 from 'bs58';

export function useAuth() {
  const { publicKey, signMessage } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token && publicKey) {
          const profile = await apiService.getProfile();
          setUser(profile);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        apiService.clearToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [publicKey]);

  // Authenticate with wallet signature
  const authenticate = async () => {
    if (!publicKey || !signMessage) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      const walletAddress = publicKey.toBase58();

      // Get nonce
      const { message } = await apiService.getNonce(walletAddress);

      // Sign message
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);
      const signatureBase58 = bs58.encode(signature);

      // Login
      const { user: userData } = await apiService.login(
        walletAddress,
        signatureBase58,
        message
      );

      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (data: {
    username?: string;
    bio?: string;
    email?: string;
  }) => {
    try {
      setLoading(true);
      const updatedUser = await apiService.updateProfile(data);
      console.log('✅ Updated user from API:', updatedUser);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    authenticate,
    updateProfile,
    logout,
    isAuthenticated: !!user,
  };
}