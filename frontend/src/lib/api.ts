const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

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

export interface Job {
  id: number;
  jobId: string;
  clientId: number;
  freelancerId?: number;
  title: string;
  description: string;
  requirements?: string;
  budget: number;
  deadline: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'AUTO_RELEASED' | 'DISPUTED' | 'CANCELLED';
  submissionUrl?: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  escrowAddress?: string;
  transactionSignature?: string;
  createdAt: string;
  updatedAt: string;
  client?: User;
  freelancer?: User;
}

export interface CreateJobData {
  title: string;
  description: string;
  requirements?: string;
  budget: number;
  deadline: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
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
    // Always get fresh token from localStorage
    const freshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('authToken') 
      : this.token;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (freshToken) {
      headers['Authorization'] = `Bearer ${freshToken}`;
    } else {
      console.warn('⚠️ No auth token found in getHeaders');
    }

    return headers;
  }

  // ==================== AUTH ====================

  async getNonce(walletAddress: string): Promise<{ message: string; nonce: string }> {
    if (!walletAddress) throw new Error('walletAddress is required');

    const response = await fetch(`${API_URL}/api/auth/nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get nonce');
    }

    return response.json();
  }

  async login(walletAddress: string, signature: string, message: string): Promise<AuthResponse> {
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
    return data;
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get profile');
    }

    return response.json();
  }

  async updateProfile(data: {
    username?: string;
    bio?: string;
    email?: string;
  }): Promise<User> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (!token) {
      throw new Error('Not authenticated. Please sign in again.');
    }

    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid - clear it
        this.clearToken();
        throw new Error('Session expired. Please sign in again.');
      }
      
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    const result = await response.json();
    return result.user;
  }

  logout() {
    this.clearToken();
  }

  // ==================== JOBS ====================

  async createJob(data: CreateJobData): Promise<Job> {
    const response = await fetch(`${API_URL}/api/jobs`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create job');
    }

    const result = await response.json();
    return result.job;
  }

  async getAllJobs(filters?: {
    status?: string;
    clientId?: number;
    freelancerId?: number;
  }): Promise<{ jobs: Job[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.clientId) params.append('clientId', filters.clientId.toString());
    if (filters?.freelancerId) params.append('freelancerId', filters.freelancerId.toString());

    const url = `${API_URL}/api/jobs${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    return response.json();
  }

  async getJobById(id: number): Promise<{ job: Job }> {
    const response = await fetch(`${API_URL}/api/jobs/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job');
    }

    return response.json();
  }

  async getMyJobs(role?: 'client' | 'freelancer'): Promise<{ jobs: Job[] }> {
    const url = `${API_URL}/api/jobs/my-jobs${role ? `?role=${role}` : ''}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch my jobs');
    }

    return response.json();
  }

  async applyToJob(jobId: number, proposal: string): Promise<{ message: string; jobId: string }> {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ proposal }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to apply to job');
    }

    return response.json();
  }

  async assignJob(jobId: number, freelancerId: number): Promise<{ job: Job }> {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/assign`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ freelancerId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to assign job');
    }

    return response.json();
  }

  async submitWork(jobId: number, submissionUrl: string, notes?: string): Promise<{ job: Job }> {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/submit`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ submissionUrl, notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit work');
    }

    return response.json();
  }

  async reviewSubmission(
    jobId: number,
    action: 'approve' | 'reject' | 'request_revision',
    rejectionReason?: string,
    rating?: number
  ): Promise<{ job: Job }> {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/review`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ action, rejectionReason, rating }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to review submission');
    }

    return response.json();
  }

  async cancelJob(jobId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/cancel`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel job');
    }

    return response.json();
  }
}

export const apiService = new ApiService();