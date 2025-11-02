'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { apiService } from '@/lib/api';
import { CustomWalletButton } from '@/components/CustomWalletButton';
import { ArrowLeft, Briefcase, Loader2, DollarSign, Calendar, FileText } from 'lucide-react';

export default function CreateJobPage() {
  const router = useRouter();
  const { connected } = useWallet();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    budget: '',
    deadline: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [solPrice, setSolPrice] = useState(0);

  useEffect(() => {
    if (!connected) {
      router.push('/jobs');
    }
  }, [connected, router]);

  // Fetch SOL price (mock for now)
  useEffect(() => {
    // In production, fetch from a price API
    setSolPrice(150); // $150 per SOL (example)
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description || formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      if (deadlineDate <= new Date()) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements || undefined,
        budget: parseFloat(formData.budget),
        deadline: new Date(formData.deadline).toISOString(),
      };

      const job = await apiService.createJob(jobData);

      alert(`✅ Job created successfully! ID: ${job.jobId}`);
      router.push(`/jobs/${job.id}`);
    } catch (error) {
      console.error('Failed to create job:', error);
      alert(`❌ Failed to create job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const estimatedUSD = formData.budget ? (parseFloat(formData.budget) * solPrice).toFixed(2) : '0.00';

  if (!connected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Header */}
      <header className="backdrop-blur-xl bg-black/30 border-b border-gray-800/50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push('/jobs')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
              RepChain
            </h1>
          </div>
          <CustomWalletButton />
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-4xl font-black bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
            Post a Job
          </h2>
          <p className="text-gray-500">Create a new job posting for freelancers</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Build a React Dashboard with Analytics"
              className={`w-full bg-gray-800/60 backdrop-blur-xl border ${errors.title ? 'border-red-500' : 'border-gray-700'
                } text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gray-600`}
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the job in detail..."
              rows={6}
              className={`w-full bg-gray-800/60 backdrop-blur-xl border ${errors.description ? 'border-red-500' : 'border-gray-700'
                } text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gray-600 resize-none`}
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            <p className="text-gray-500 text-xs mt-1">
              {formData.description.length} characters
            </p>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Requirements (Optional)
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="e.g., React, TypeScript, TailwindCSS, 3+ years experience"
              rows={3}
              className="w-full bg-gray-800/60 backdrop-blur-xl border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gray-600 resize-none"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Budget (SOL) *
            </label>
            <input
              type="number"
              step="0.001"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="2.5"
              className={`w-full bg-gray-800/60 backdrop-blur-xl border ${errors.budget ? 'border-red-500' : 'border-gray-700'
                } text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gray-600`}
            />
            {errors.budget && <p className="text-red-400 text-sm mt-1">{errors.budget}</p>}
            {formData.budget && !errors.budget && (
              <p className="text-gray-500 text-sm mt-1">
                ≈ ${estimatedUSD} USD (at ${solPrice}/SOL)
              </p>
            )}
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Deadline *
            </label>
            <input
              type="datetime-local"
              value={
                formData.deadline
                  ? new Date(formData.deadline).toISOString().slice(0, 16)
                  : ''
              }
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              min={new Date().toISOString().slice(0, 16)} // prevents past date selection
              className={`w-full bg-gray-800/60 backdrop-blur-xl border ${errors.deadline ? 'border-red-500' : 'border-gray-700'
                } text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gray-600`}
            />
            {errors.deadline && <p className="text-red-400 text-sm mt-1">{errors.deadline}</p>}
          </div>

          {/* Info Box */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              💡 <strong>Note:</strong> Your budget will be locked in escrow when a freelancer is assigned.
              It will be released upon your approval or automatically after 96 hours if no action is taken.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-800 disabled:to-gray-900 text-white font-bold py-4 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Job...
              </>
            ) : (
              <>
                Create Job
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}