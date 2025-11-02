'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { apiService, Job } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { CustomWalletButton } from '@/components/CustomWalletButton';
import { 
  ArrowLeft, Briefcase, DollarSign, Clock, User, FileText, 
  CheckCircle, XCircle, RefreshCw, Loader2, Send, ExternalLink 
} from 'lucide-react';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { connected } = useWallet();
  const { user } = useAuth();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Application form
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [proposal, setProposal] = useState('');
  
  // Submission form
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  
  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!connected) {
      router.push('/jobs');
      return;
    }
    fetchJob();
  }, [params.id, connected]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const { job: fetchedJob } = await apiService.getJobById(Number(params.id));
      setJob(fetchedJob);
    } catch (error) {
      console.error('Failed to fetch job:', error);
      alert('Failed to load job');
      router.push('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!proposal || proposal.length < 50) {
      alert('Proposal must be at least 50 characters');
      return;
    }

    try {
      setActionLoading(true);
      await apiService.applyToJob(job!.id, proposal);
      alert('✅ Application submitted successfully!');
      setShowApplyForm(false);
      setProposal('');
    } catch (error) {
      alert(`❌ ${error instanceof Error ? error.message : 'Failed to apply'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitWork = async () => {
    if (!submissionUrl) {
      alert('Submission URL is required');
      return;
    }

    try {
      setActionLoading(true);
      await apiService.submitWork(job!.id, submissionUrl, submissionNotes);
      alert('✅ Work submitted successfully!');
      fetchJob();
      setShowSubmitForm(false);
      setSubmissionUrl('');
      setSubmissionNotes('');
    } catch (error) {
      alert(`❌ ${error instanceof Error ? error.message : 'Failed to submit work'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = async (action: 'approve' | 'reject' | 'request_revision') => {
    if (action === 'reject' && !rejectionReason) {
      alert('Rejection reason is required');
      return;
    }

    try {
      setActionLoading(true);
      await apiService.reviewSubmission(job!.id, action, rejectionReason);
      alert(`✅ Work ${action}d successfully!`);
      fetchJob();
      setShowReviewForm(false);
      setRejectionReason('');
    } catch (error) {
      alert(`❌ ${error instanceof Error ? error.message : 'Failed to review'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: Job['status']) => {
    const colors = {
      OPEN: 'bg-green-900/30 text-green-400 border-green-700',
      IN_PROGRESS: 'bg-blue-900/30 text-blue-400 border-blue-700',
      SUBMITTED: 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
      COMPLETED: 'bg-gray-900/30 text-gray-400 border-gray-700',
      AUTO_RELEASED: 'bg-purple-900/30 text-purple-400 border-purple-700',
      DISPUTED: 'bg-red-900/30 text-red-400 border-red-700',
      CANCELLED: 'bg-gray-900/50 text-gray-500 border-gray-800',
    };
    return colors[status];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isClient = user?.id === job?.clientId;
  const isFreelancer = user?.id === job?.freelancerId;
  const canApply = job?.status === 'OPEN' && !isClient && !isFreelancer;
  const canSubmit = job?.status === 'IN_PROGRESS' && isFreelancer;
  const canReview = job?.status === 'SUBMITTED' && isClient;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Header */}
      <header className="backdrop-blur-xl bg-black/30 border-b border-gray-800/50 sticky top-0 z-50">
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

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </button>

        {/* Job Header */}
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl rounded-3xl p-8 mb-8 border border-gray-700/50">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(job.status)}`}>
                  {job.status.replace('_', ' ')}
                </span>
                <span className="text-gray-500 text-sm font-mono">ID: {job.jobId}</span>
              </div>
              <h2 className="text-3xl font-black text-gray-200 mb-2">{job.title}</h2>
              <p className="text-gray-400 text-sm">
                Posted {formatDate(job.createdAt)}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Budget</span>
              </div>
              <p className="text-2xl font-bold text-gray-200">{job.budget} SOL</p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400 text-sm">Deadline</span>
              </div>
              <p className="text-sm font-bold text-gray-200">{formatDate(job.deadline)}</p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400 text-sm">Client</span>
              </div>
              <p className="text-sm font-bold text-gray-200">{job.client?.username || 'Anonymous'}</p>
              <p className="text-xs text-gray-500">Rep: {job.client?.reputationScore || 0}</p>
            </div>

            {job.freelancer && (
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-400 text-sm">Freelancer</span>
                </div>
                <p className="text-sm font-bold text-gray-200">{job.freelancer.username || 'Anonymous'}</p>
                <p className="text-xs text-gray-500">Rep: {job.freelancer.reputationScore || 0}</p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl rounded-2xl p-8 mb-8 border border-gray-700/50">
          <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Description
          </h3>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{job.description}</p>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl rounded-2xl p-8 mb-8 border border-gray-700/50">
            <h3 className="text-xl font-bold text-gray-200 mb-4">Requirements</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
          </div>
        )}

        {/* Submission Info */}
        {job.submissionUrl && (
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl rounded-2xl p-8 mb-8 border border-gray-700/50">
            <h3 className="text-xl font-bold text-gray-200 mb-4">Work Submission</h3>
            <a 
              href={job.submissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {job.submissionUrl}
            </a>
            {job.submittedAt && (
              <p className="text-gray-500 text-sm mt-2">
                Submitted on {formatDate(job.submittedAt)}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          {/* Apply Button */}
          {canApply && !showApplyForm && (
            <button
              onClick={() => setShowApplyForm(true)}
              className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Apply to this Job
            </button>
          )}

          {/* Apply Form */}
          {showApplyForm && (
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl rounded-2xl p-8 border border-gray-700/50">
              <h3 className="text-xl font-bold text-gray-200 mb-4">Submit Your Proposal</h3>
              <textarea
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Explain why you're the best fit for this job..."
                rows={6}
                className="w-full bg-gray-900/50 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gray-600 resize-none mb-4"
              />
              <p className="text-gray-500 text-sm mb-4">{proposal.length} / 50 characters minimum</p>
              <div className="flex gap-4">
                <button
                  onClick={handleApply}
                  disabled={actionLoading || proposal.length < 50}
                  className="flex-1 bg-green-700 hover:bg-green-600 disabled:bg-gray-800 text-white font-bold py-3 rounded-lg transition-all disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  onClick={() => setShowApplyForm(false)}
                  className="px-6 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Submit Work Button */}
          {canSubmit && !showSubmitForm && (
            <button
              onClick={() => setShowSubmitForm(true)}
              className="w-full bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Submit Work
            </button>
          )}

          {/* Submit Work Form */}
          {showSubmitForm && (
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl rounded-2xl p-8 border border-gray-700/50">
              <h3 className="text-xl font-bold text-gray-200 mb-4">Submit Your Work</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Submission URL *
                  </label>
                  <input
                    type="url"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full bg-gray-900/50 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="Add any additional notes..."
                    rows={4}
                    className="w-full bg-gray-900/50 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gray-600 resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSubmitWork}
                    disabled={actionLoading || !submissionUrl}
                    className="flex-1 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-800 text-white font-bold py-3 rounded-lg transition-all disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Submitting...' : 'Submit Work'}
                  </button>
                  <button
                    onClick={() => setShowSubmitForm(false)}
                    className="px-6 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Review Buttons */}
          {canReview && !showReviewForm && (
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => handleReview('approve')}
                disabled={actionLoading}
                className="bg-green-700 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Approve
              </button>
              <button
                onClick={() => setShowReviewForm(true)}
                disabled={actionLoading}
                className="bg-red-700 hover:bg-red-600 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
              <button
                onClick={() => handleReview('request_revision')}
                disabled={actionLoading}
                className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Request Revision
              </button>
            </div>
          )}

          {/* Rejection Form */}
          {showReviewForm && (
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl rounded-2xl p-8 border border-gray-700/50">
              <h3 className="text-xl font-bold text-gray-200 mb-4">Reject Submission</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why you're rejecting this work..."
                rows={4}
                className="w-full bg-gray-900/50 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gray-600 resize-none mb-4"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => handleReview('reject')}
                  disabled={actionLoading || !rejectionReason}
                  className="flex-1 bg-red-700 hover:bg-red-600 disabled:bg-gray-800 text-white font-bold py-3 rounded-lg transition-all disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}