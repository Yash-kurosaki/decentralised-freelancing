const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface User {
  id: number;
  walletAddress: string;
  username?: string;
  bio?: string;
  email?: string;
  reputationScore: number;
  githubUsername?: string;
  profileImage?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on init
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  private getHeaders() {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Get nonce for wallet signing
  async getNonce(walletAddress: string): Promise<{ message: string; nonce: string }> {
    if (!walletAddress) throw new Error('walletAddress is required');

    // Resolve a usable fetch implementation. Try global fetch first; if missing, fall back to cross-fetch via require (works in Node).
    let fetchFn: any = (typeof fetch !== 'undefined') ? fetch : (globalThis as any).fetch;

    if (!fetchFn) {
      try {
        // use require here so TS/ESM environments that don't have cross-fetch won't fail at import time
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const cf = require('cross-fetch');
        // cross-fetch exports a fetch function as default or directly
        fetchFn = cf && (cf.default || cf.fetch || cf);
      } catch (e) {
        throw new Error(
          'fetch is not available in this environment. Install `cross-fetch` (npm i cross-fetch) or run on Node 18+.'
        );
      }
    }

    const url = `${API_URL}/api/auth/nonce`;

    try {
      const response = await fetchFn(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      // Defensive check: make sure we got an object resembling a Fetch Response
      if (!response || typeof response.ok === 'undefined') {
        throw new Error('Invalid response from fetch. Make sure `fetch` implementation is correct.');
      }

      if (!response.ok) {
        let msg = `Failed to get nonce (status ${response.status})`;
        try {
          const err = await response.json();
          if (err && (err.error || err.message)) msg = err.error || err.message;
        } catch (e) {
          /* ignore JSON parse errors */
        }
        throw new Error(msg);
      }

      const data = await response.json();
      return {
        message: data.message,
        nonce: data.nonce,
      };
    } catch (err: any) {
      // Log details to help debugging (won't break program flow other than throwing the error)
      // eslint-disable-next-line no-console
      console.error('apiService.getNonce error', {
        walletAddress,
        url,
        fetchType: typeof fetchFn,
        errorMessage: err && err.message ? err.message : err,
        stack: err && err.stack ? err.stack : undefined,
      });
      throw err;
    }
  }

  // Login/Register with wallet signature
  async login(
    walletAddress: string,
    signature: string,
    message: string
  ): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, signature, message }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    this.setToken(data.token);
    // 🔹 Save wallet address for later use
    if (typeof window !== 'undefined') {
      localStorage.setItem('walletAddress', walletAddress);
    }
    return data;
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get profile');
    }

    return response.json();
  }

  // Update user profile
  async updateProfile(data: {
    username?: string;
    bio?: string;
    email?: string;
  }): Promise<User> {
    // Get wallet address (stored after login)
    const walletAddress = localStorage.getItem('walletAddress');

    // Combine wallet address with other data
    const payload = { ...data, walletAddress };

    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    const result = await response.json();
    return result.user;
  }

  // Logout
  logout() {
    this.clearToken();
  }
}

export const apiService = new ApiService();