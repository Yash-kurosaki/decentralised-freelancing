'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { apiService, Job } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { CustomWalletButton } from '@/components/CustomWalletButton';
import { Search, Filter, Plus, Loader2, Briefcase } from 'lucide-react';

export default function JobsPage() {
  const router = useRouter();
  const { connected } = useWallet();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'budget' | 'deadline'>('newest');

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const filters = statusFilter ? { status: statusFilter } : undefined;
      const { jobs: fetchedJobs } = await apiService.getAllJobs(filters);
      setJobs(fetchedJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort jobs
  const filteredJobs = jobs
    .filter(job => {
      const matchesSearch = 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.requirements?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'budget') {
        return b.budget - a.budget;
      } else if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return 0;
    });

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
              <Briefcase className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
              RepChain
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {connected && (
              <button
                onClick={() => router.push('/jobs/create')}
                className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition-all border border-gray-600"
              >
                <Plus className="w-4 h-4" />
                Post Job
              </button>
            )}
            <CustomWalletButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-4xl font-black bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
            Browse Jobs
          </h2>
          <p className="text-gray-500">Find your next opportunity</p>
        </div>

        {/* Filters & Search */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search jobs by title, description, or requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/60 backdrop-blur-xl border border-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:border-gray-600"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-800/60 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-gray-600"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800/60 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-gray-600"
            >
              <option value="newest">Newest First</option>
              <option value="budget">Highest Budget</option>
              <option value="deadline">Closest Deadline</option>
            </select>

            {/* Results Count */}
            <div className="ml-auto flex items-center gap-2 text-gray-400 text-sm">
              <span>{filteredJobs.length} jobs found</span>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter 
                ? 'Try adjusting your filters' 
                : 'Be the first to post a job!'}
            </p>
            {connected && !searchQuery && !statusFilter && (
              <button
                onClick={() => router.push('/jobs/create')}
                className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Post a Job
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}