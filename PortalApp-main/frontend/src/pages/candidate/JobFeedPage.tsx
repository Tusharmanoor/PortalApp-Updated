import React, { useState, useEffect, useMemo } from 'react';
import type { Job } from '../../types/job.types';
import { jobsApi } from '../../api/jobs.api';
import { applicationsApi } from '../../api/applications.api';
import { toast } from '../../store/useToastStore';
import { useResumeStore } from '../../store/useResumeStore';
import { calculateJobMatch, DEFAULT_CANDIDATE_SKILLS, parseSkillsString } from '../../utils/aiMatcher';
import { JobCard } from '../../components/jobs/JobCard';
import { JobFilters, FilterState } from '../../components/jobs/JobFilters';
import { JobDetailModal } from '../../components/jobs/JobDetailModal';
import { Sparkles, Briefcase } from 'lucide-react';
import confetti from 'canvas-confetti';

interface JobFeedPageProps {
  onNavigateToResumeHub?: () => void;
}

export const JobFeedPage: React.FC<JobFeedPageProps> = ({ onNavigateToResumeHub }) => {
  const { setSelectedJobForMatch, resumeData } = useResumeStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [applyingId, setApplyingId] = useState<number | null>(null);

  const candidateSkills = useMemo(() => {
    if (resumeData?.skills && resumeData.skills.length > 0) {
      return resumeData.skills;
    }
    return DEFAULT_CANDIDATE_SKILLS;
  }, [resumeData]);

  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    jobType: '',
    minMatchScore: 0,
    maxExperience: 50,
  });

  const loadJobs = async () => {
    setIsLoading(true);

    try {
      let fetched: Job[];

      if (filters.keyword.trim()) {
        fetched = await jobsApi.searchJobs(filters.keyword);
      } else {
        fetched = await jobsApi.getAllJobs();
      }

      setJobs(fetched || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAppliedJobs = async () => {
    try {
      const myApps = await applicationsApi.getMyApplications();
      if (myApps && myApps.length > 0) {
        const ids = new Set(myApps.map((a) => Number(a.jobId)));
        setAppliedJobIds(ids);
      }
    } catch {
      // Ignore if offline
    }
  };

  useEffect(() => {
    loadJobs();
    loadAppliedJobs();
  }, [filters.keyword]);

  const processedJobs = useMemo(() => {
    return jobs
      .filter((job) => job.status !== false) // Show active openings
      .map((job) => {
        const matchResult = calculateJobMatch(job, candidateSkills);
        return {
          ...job,
          matchScore: matchResult.matchScore,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          isApplied: appliedJobIds.has(job.id),
        };
      })
      .filter((job) => {
        if (filters.jobType && job.jobType !== filters.jobType) return false;
        if (job.experience > filters.maxExperience) return false;
        if (filters.minMatchScore > 0 && (job.matchScore || 0) < filters.minMatchScore) return false;
        return true;
      });
  }, [jobs, filters, appliedJobIds, candidateSkills]);

  const handleApply = async (job: Job) => {
    if (appliedJobIds.has(job.id)) {
      toast.info(
        'Already applied',
        `You have already submitted an application for ${job.title}.`
      );
      return;
    }

    try {
      setApplyingId(job.id);

      await applicationsApi.applyForJob(job.id);

      setAppliedJobIds((prev) => new Set(prev).add(job.id));

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#06b6d4', '#10b981'],
      });

      toast.success(
        'Application Submitted!',
        `Your application for ${job.title} at ${job.company} was submitted successfully.`
      );

      if (selectedJob?.id === job.id) {
        setIsDetailOpen(false);
      }
    } catch (err: any) {
      console.error('Failed to apply for job:', err);

      const message =
        typeof err?.response?.data === 'string'
          ? err.response.data
          : 'Unable to submit your application. Please try again.';

      toast.error('Application Failed', message);
    } finally {
      setApplyingId(null);
    }
  };

  const handleOpenDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
  };

  const handleCheckMatch = (job: Job) => {
    setSelectedJobForMatch(job);
    if (onNavigateToResumeHub) {
      onNavigateToResumeHub();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Top Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden glass-panel border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40">
        <div className="relative z-10 max-w-2xl space-y-2">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI Resume Matcher Ready
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Find Your Next Opportunity
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Browse available opportunities, check your resume ATS match score against any position, and apply directly through the platform.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none" />
      </div>

      {/* Filters Hub */}
      <JobFilters
        filters={filters}
        onChange={setFilters}
        totalResults={processedJobs.length}
      />

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl glass-panel animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : processedJobs.length === 0 ? (
        <div className="p-16 text-center rounded-2xl glass-panel border border-white/10 space-y-3">
          <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />

          <h3 className="text-base font-bold text-slate-300">
            No matching jobs found
          </h3>

          <p className="text-xs text-slate-500">
            Try adjusting your search query or clearing your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApply={handleApply}
              onViewDetails={handleOpenDetails}
              onCheckMatch={handleCheckMatch}
              isApplying={applyingId === job.id}
            />
          ))}
        </div>
      )}

      {/* Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onApply={handleApply}
        onCheckMatch={handleCheckMatch}
        isApplying={selectedJob ? applyingId === selectedJob.id : false}
      />

    </div>
  );
};
