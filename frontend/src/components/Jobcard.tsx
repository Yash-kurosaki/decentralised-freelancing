import { Job } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Briefcase, Clock, DollarSign, User } from 'lucide-react';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const router = useRouter();

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
    return colors[status] || colors.OPEN;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const daysUntilDeadline = () => {
    const now = new Date();
    const deadline = new Date(job.deadline);
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const days = daysUntilDeadline();

  return (
    <div
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-2xl rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] shadow-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-200 group-hover:text-white transition-colors mb-2">
            {job.title}
          </h3>
          <p className="text-sm text-gray-400 font-mono">ID: {job.jobId}</p>
        </div>
        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(job.status)}`}>
          {job.status.replace('_', ' ')}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      {/* Requirements */}
      {job.requirements && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Requirements:</p>
          <p className="text-sm text-gray-300 line-clamp-1">{job.requirements}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Budget */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Budget</p>
            <p className="text-sm font-bold text-gray-200">{job.budget} SOL</p>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Deadline</p>
            <p className="text-sm font-bold text-gray-200">
              {days > 0 ? `${days}d` : 'Expired'}
            </p>
          </div>
        </div>

        {/* Reputation */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
            <User className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Client Rep</p>
            <p className="text-sm font-bold text-gray-200">{job.client?.reputationScore || 0}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-xs">
            {job.client?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-sm text-gray-400">
            {job.client?.username || 'Anonymous'}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          Posted {formatDate(job.createdAt)}
        </span>
      </div>
    </div>
  );
}