'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { apiService, Job } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { CustomWalletButton } from '@/components/CustomWalletButton';
import { Briefcase, Loader2, User, Zap } from 'lucide-react';

export default function MyJobsPage() {
  const router = useRouter();
  const { connected } = useWallet();
  
  const [clientJobs, setClientJobs] = useState<Job[]>([]);
  const [freelancerJobs, setFreelancerJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'client' | 'freelancer'>('client');

  useEffect(() => {
    if (!connected) {
      router.push('/');
      return;
    }
    fetchMyJobs();
  }, [connected]);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      
      // Fetch both client and freelancer jobs
      const [clientRes, freelancerRes] = await Promise.all([
        apiService.getMyJobs('client'),
        apiService.getMyJobs('freelancer'),
      ]);

      setClientJobs(clientRes.jobs);
      setFreelancerJobs(freelancerRes.jobs);
    } catch (error) {
      console.error('Failed to fetch my jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getJobStats = (jobs: Job[]) => {
    return {
      total: jobs.length,
      open: jobs.filter(j => j.status === 'OPEN').length,
      inProgress: jobs.filter(j => j.status === 'IN_PROGRESS').length,
      completed: jobs.filter(j => j.status === 'COMPLETED').length,
    };
  };

  const clientStats = getJobStats(clientJobs);
  const freelancerStats = getJobStats(freelancerJobs);
  const currentJobs = activeTab === 'client' ? clientJobs : freelancerJobs;
  const currentStats = activeTab === 'client' ? clientStats : freelancerStats;

  if (!connected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Header */}
      <header className="backdrop-blur-xl bg-black/30 border-b border-gray-800/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
              RepChain
            </h1>
          </div>
          <CustomWalletButton />
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-4xl font-black bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
            My Jobs
          </h2>
          <p className="text-gray-500">Manage your posted and assigned jobs</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('client')}
            className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'client'
                ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white border border-gray-600'
                : 'bg-gray-800/40 text-gray-400 border border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Briefcase className="w-5 h-5" />
              <span>Posted Jobs ({clientStats.total})</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('freelancer')}
            className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'freelancer'
                ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white border border-gray-600'
                : 'bg-gray-800/40 text-gray-400 border border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <User className="w-5 h-5" />
              <span>My Work ({freelancerStats.total})</span>
            </div>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl rounded-2xl p-6 border border-gray-700/50">
            <p className="text-gray-400 text-sm mb-2">Total</p>
            <p className="text-3xl font-black text-gray-200">{currentStats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-2xl rounded-2xl p-6 border border-green-700/50">
            <p className="text-green-400 text-sm mb-2">Open</p>
            <p className="text-3xl font-black text-green-300">{currentStats.open}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-2xl rounded-2xl p-6 border border-blue-700/50">
            <p className="text-blue-400 text-sm mb-2">In Progress</p>
            <p className="text-3xl font-black text-blue-300">{currentStats.inProgress}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-2xl rounded-2xl p-6 border border-purple-700/50">
            <p className="text-purple-400 text-sm mb-2">Completed</p>
            <p className="text-3xl font-black text-purple-300">{currentStats.completed}</p>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : currentJobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              {activeTab === 'client' ? 'No posted jobs' : 'No assigned jobs'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'client' 
                ? 'Start by creating your first job posting' 
                : 'Apply to jobs to see them here'}
            </p>
            {activeTab === 'client' && (
              <button
                onClick={() => router.push('/jobs/create')}
                className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Post a Job
              </button>
            )}
            {activeTab === 'freelancer' && (
              <button
                onClick={() => router.push('/jobs')}
                className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}