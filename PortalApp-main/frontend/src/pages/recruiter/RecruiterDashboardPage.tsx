import React, { useState, useEffect } from 'react';
import type { Job, JobRequestDto } from '../../types/job.types';
import { jobsApi } from '../../api/jobs.api';
import { JobEditorModal } from '../../components/jobs/JobEditorModal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { toast } from '../../store/useToastStore';
import { formatSalary } from '../../utils/aiMatcher';
import {
  Plus,
  Building2,
  MapPin,
  Edit2,
  Trash2,
  Users,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Search
} from 'lucide-react';

interface RecruiterDashboardPageProps {
  onNavigateToScreening?: (jobId?: number) => void;
}

export const RecruiterDashboardPage: React.FC<RecruiterDashboardPageProps> = ({
  onNavigateToScreening,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const data = await jobsApi.getAllJobs();
      setJobs(data || []);
    } catch (err: any) {
      console.error('Failed to fetch recruiter jobs:', err);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCreateJob = () => {
    setEditingJob(null);
    setIsEditorOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsEditorOpen(true);
  };

  const handleSaveJob = async (jobData: JobRequestDto, jobId?: number) => {
    try {
      if (jobId) {
        await jobsApi.updateJob(jobId, jobData);
        toast.success('Job Updated', `Successfully updated "${jobData.title}".`);
      } else {
        await jobsApi.createJob(jobData);
        toast.success('Job Published', `Created new opening for "${jobData.title}".`);
      }
      await loadJobs();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Failed to save job opening to server.';
      toast.error('Failed to Publish Job', errorMsg);
      throw err;
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    try {
      await jobsApi.deleteJob(id);
      toast.success('Job Deleted', 'The job listing was removed.');
      await loadJobs();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Failed to delete job listing from server.';
      toast.error('Deletion Failed', errorMsg);
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & CTAs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Recruiter Job Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Publish and manage job openings connected to automated AI candidate screening.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleCreateJob}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-lg shadow-indigo-600/30"
        >
          Post New Opening
        </Button>
      </div>

      {/* Recruiter KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Job Posts
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">{jobs.length}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 space-y-1">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Active Listings
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-300">
            {jobs.filter((j) => j.status).length}
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-indigo-500/20 space-y-1">
          <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
            Avg Compatibility
          </div>
          <div className="text-2xl font-extrabold font-mono text-indigo-300">89%</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 space-y-1">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
            Screened Applicants
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-300">124</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter jobs by title or company..."
          className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none flex-1"
        />
      </div>

      {/* Job Postings Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/60 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Role & Company</th>
                <th className="py-3.5 px-4">Job Type</th>
                <th className="py-3.5 px-4">Salary</th>
                <th className="py-3.5 px-4">Required Skills</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-100 text-sm">{job.title}</div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        {job.company}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {job.location}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <Badge variant="primary">{job.jobType}</Badge>
                  </td>

                  <td className="py-4 px-4 font-mono font-bold text-emerald-400 text-sm">
                    {formatSalary(job.salary)}
                  </td>

                  <td className="py-4 px-4 max-w-xs truncate text-slate-300">
                    {job.skills}
                  </td>

                  <td className="py-4 px-4">
                    {job.status ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="danger">Closed</Badge>
                    )}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onNavigateToScreening && onNavigateToScreening(job.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                        title="Screen Applicants"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditJob(job)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                        title="Edit Job"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Editor Modal */}
      <JobEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveJob}
        initialJob={editingJob}
      />
    </div>
  );
};
