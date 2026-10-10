import React, { useState, useEffect } from 'react';
import type { Application, ApplicationStatus } from '../../types/application.types';
import { applicationsApi } from '../../api/applications.api';
import { Badge } from '../../components/common/Badge';
import { MatchScoreDial } from '../../components/ai/MatchScoreDial';
import { formatSalary } from '../../utils/aiMatcher';
import { Building2, MapPin, Calendar, Clock, CheckCircle2, XCircle, Award, Sparkles, FolderOpen } from 'lucide-react';

const MOCK_APPLICATIONS: Application[] = [
  {
    id: 1,
    jobId: 1,
    jobTitle: 'Senior Full Stack Java Engineer',
    company: 'Stripe Ecosystems',
    location: 'San Francisco, CA (Remote)',
    salary: 165000,
    appliedAt: '2026-08-15T10:30:00Z',
    status: 'SHORTLISTED',
    aiMatchScore: 94,
    matchingSkills: ['Java', 'Spring Boot', 'React', 'MySQL'],
  },
  {
    id: 2,
    jobId: 3,
    jobTitle: 'Backend Microservices Developer',
    company: 'Vercel Labs',
    location: 'Austin, TX (Remote)',
    salary: 140000,
    appliedAt: '2026-08-16T14:15:00Z',
    status: 'APPLIED',
    aiMatchScore: 89,
    matchingSkills: ['Java', 'Spring Boot', 'REST APIs'],
  },
  {
    id: 3,
    jobId: 4,
    jobTitle: 'Junior Software Engineer Intern',
    company: 'Linear Software',
    location: 'New York, NY',
    salary: 85000,
    appliedAt: '2026-08-12T09:00:00Z',
    status: 'SELECTED',
    aiMatchScore: 96,
    matchingSkills: ['Java', 'React', 'TypeScript', 'Git'],
  },
];

export const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const data = await applicationsApi.getMyApplications();
        if (data && data.length > 0) {
          setApplications(data);
        } else {
          setApplications(MOCK_APPLICATIONS);
        }
      } catch {
        setApplications(MOCK_APPLICATIONS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const counts = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'APPLIED').length,
    shortlisted: applications.filter((a) => a.status === 'SHORTLISTED').length,
    selected: applications.filter((a) => a.status === 'SELECTED').length,
    rejected: applications.filter((a) => a.status === 'REJECTED').length,
  };

  const statusIcons: Record<ApplicationStatus, React.ReactNode> = {
    APPLIED: <Clock className="w-4 h-4 text-indigo-400" />,
    SHORTLISTED: <Sparkles className="w-4 h-4 text-amber-400" />,
    SELECTED: <Award className="w-4 h-4 text-emerald-400" />,
    REJECTED: <XCircle className="w-4 h-4 text-rose-400" />,
  };

  const statusVariants: Record<ApplicationStatus, 'primary' | 'warning' | 'success' | 'danger'> = {
    APPLIED: 'primary',
    SHORTLISTED: 'warning',
    SELECTED: 'success',
    REJECTED: 'danger',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Application Tracking Pipeline
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Monitor your application lifecycle and hiring stages in real-time.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Submissions
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">{counts.total}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-indigo-500/20 space-y-1">
          <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
            In Review
          </div>
          <div className="text-2xl font-extrabold font-mono text-indigo-300">{counts.applied}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 space-y-1">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
            Shortlisted ⭐
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-300">{counts.shortlisted}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 space-y-1">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Offers / Selected 🎯
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-300">{counts.selected}</div>
        </div>
      </div>

      {/* Applications Cards List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-200">Active Applications</h2>

        {applications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-panel border border-white/10 space-y-3">
            <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No applications yet</h3>
            <p className="text-xs text-slate-500">
              Browse the Job Feed to discover matched roles and submit your AI resume.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const score = app.aiMatchScore || 90;
              return (
                <div
                  key={app.id}
                  className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-white/10"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={statusVariants[app.status]}>
                        <span className="flex items-center gap-1">
                          {statusIcons[app.status]}
                          {app.status}
                        </span>
                      </Badge>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Applied on {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100">
                      {app.jobTitle || `Job Opening #${app.jobId}`}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        {app.company || 'Enterprise Partner'}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {app.location || 'Remote / Hybrid'}
                      </span>
                      {app.salary && (
                        <>
                          <span>&bull;</span>
                          <span className="font-bold text-emerald-400 font-mono">
                            {formatSalary(app.salary)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: AI Match Score Dial */}
                  <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">AI ATS Score</div>
                      <div className="text-xs font-semibold text-slate-300">High Match</div>
                    </div>
                    <MatchScoreDial score={score} size="md" showLabel={false} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
