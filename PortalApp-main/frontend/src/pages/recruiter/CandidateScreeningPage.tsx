import React, { useState, useEffect } from 'react';
import type { Application, ApplicationStatus } from '../../types/application.types';
import type { Job } from '../../types/job.types';
import { applicationsApi } from '../../api/applications.api';
import { jobsApi } from '../../api/jobs.api';
import { ApplicantLeaderboard } from '../../components/recruiter/ApplicantLeaderboard';
import { toast } from '../../store/useToastStore';
import { Sparkles, UserCheck, Filter, Award, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CandidateScreeningPageProps {
  initialJobId?: number;
}

export const CandidateScreeningPage: React.FC<CandidateScreeningPageProps> = ({
  initialJobId,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | 'ALL'>(
    initialJobId || 'ALL'
  );
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobsAndApplicants = async () => {
      setIsLoading(true);
      try {
        const fetchedJobs = await jobsApi.getAllJobs();
        setJobs(fetchedJobs || []);

        if (selectedJobId !== 'ALL') {
          const fetchedApps = await applicationsApi.getApplicationsByJob(selectedJobId);
          setApplicants(fetchedApps || []);
        } else {
          // Fetch applications for all active jobs
          if (fetchedJobs && fetchedJobs.length > 0) {
            const allAppPromises = fetchedJobs.map((j) =>
              applicationsApi.getApplicationsByJob(j.id).catch(() => [])
            );
            const appResults = await Promise.all(allAppPromises);
            const combinedApps = appResults.flat();
            setApplicants(combinedApps);
          } else {
            setApplicants([]);
          }
        }
      } catch (err) {
        console.error('Failed to load recruiter screening data:', err);
        setApplicants([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobsAndApplicants();
  }, [selectedJobId]);

  const handleStatusChange = async (applicationId: number, newStatus: ApplicationStatus) => {
    try {
      await applicationsApi.updateStatus(applicationId, newStatus);
      setApplicants((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
      );

      if (newStatus === 'SELECTED') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#6366f1'],
        });
        toast.success('Candidate Selected / Hired!', 'Status updated and applicant notified.');
      } else {
        toast.success('Status Updated', `Applicant marked as ${newStatus}.`);
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      toast.error('Update Failed', 'Unable to update applicant status on server.');
    }
  };

  const filteredApplicants =
    selectedJobId === 'ALL'
      ? applicants
      : applicants.filter((a) => a.jobId === selectedJobId);

  // Dynamically compute Top 2 and Lowest 2 candidates based on AI match score
  const sortedApplicants = [...filteredApplicants].sort((a, b) => {
    const scoreA = a.aiScore ?? a.aiMatchScore ?? 0;
    const scoreB = b.aiScore ?? b.aiMatchScore ?? 0;
    return scoreB - scoreA;
  });

  const top2 = sortedApplicants.slice(0, 2);
  const lowest2 =
    sortedApplicants.length > 2
      ? sortedApplicants.slice(sortedApplicants.length - 2).reverse()
      : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Candidate Screening &amp; Ranking Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Recruiter Candidate Screening Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            View real candidates who applied for your job openings, inspect submitted resumes, evaluate AI match compatibility, and manage candidate selection status.
          </p>
        </div>

        {/* Job Filter Selector */}
        <div className="flex items-center gap-2 glass-panel px-3.5 py-2 rounded-2xl border border-white/10">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-400 font-medium">Job Opening:</span>
          <select
            value={selectedJobId}
            onChange={(e) =>
              setSelectedJobId(
                e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
              )
            }
            className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">
              All Active Openings ({applicants.length} Applicants)
            </option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id} className="bg-slate-900 text-slate-200">
                {job.title} - {job.company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Top 2 and Lowest 2 Candidate Highlights */}
      {!isLoading && filteredApplicants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top 2 Candidates Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-emerald-500/30 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>TOP 2 CANDIDATES</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                Highest AI Scores
              </span>
            </div>
            <div className="space-y-2">
              {top2.map((cand, idx) => {
                const score = cand.aiScore ?? cand.aiMatchScore ?? 0;
                return (
                  <div
                    key={cand.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-emerald-500/20"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-mono font-bold text-xs">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-100">
                          {cand.candidateName || `Candidate #${cand.candidateId}`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {cand.candidateEmail} &bull; {cand.resumeFilename}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-400">
                        {score}%
                      </span>
                      <div className="text-[9px] text-emerald-300 font-mono">AI Match</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lowest 2 Candidates Card (if > 2 candidates exist) */}
          {lowest2.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-rose-500/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <TrendingDown className="w-4 h-4" />
                  <span>LOWEST 2 CANDIDATES</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">
                  Needs Skill Upgrade
                </span>
              </div>
              <div className="space-y-2">
                {lowest2.map((cand, idx) => {
                  const score = cand.aiScore ?? cand.aiMatchScore ?? 0;
                  return (
                    <div
                      key={cand.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-rose-500/20"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center font-mono font-bold text-xs">
                          Rank #{sortedApplicants.indexOf(cand) + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-100">
                            {cand.candidateName || `Candidate #${cand.candidateId}`}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {cand.candidateEmail} &bull; {cand.resumeFilename}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-rose-400">
                          {score}%
                        </span>
                        <div className="text-[9px] text-rose-300 font-mono">AI Match</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Applicant Leaderboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            Applicant Roster ({filteredApplicants.length})
          </h2>
          <span className="text-xs text-slate-500">
            Real applicants evaluated by exact AI matcher
          </span>
        </div>

        <ApplicantLeaderboard
          applicants={filteredApplicants}
          onStatusChange={handleStatusChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

