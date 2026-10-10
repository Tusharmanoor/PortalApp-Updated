import React from 'react';
import type { Job } from '../../types/job.types';
import { MatchScoreDial } from '../ai/MatchScoreDial';
import { SkillTagMatrix } from '../ai/SkillTagMatrix';
import { formatSalary } from '../../utils/aiMatcher';
import { Building2, MapPin, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
  onViewDetails: (job: Job) => void;
  onCheckMatch?: (job: Job) => void;
  isApplying?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onApply,
  onViewDetails,
  onCheckMatch,
  isApplying = false,
}) => {
  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between group relative overflow-hidden">
      {/* Top Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary">{job.jobType}</Badge>
              {job.experience === 0 ? (
                <Badge variant="neutral">Entry Level</Badge>
              ) : (
                <Badge variant="neutral">{job.experience}+ Yrs Exp</Badge>
              )}
            </div>

            <h3
              onClick={() => onViewDetails(job)}
              className="text-lg font-bold text-slate-100 hover:text-indigo-400 cursor-pointer transition-colors line-clamp-1"
            >
              {job.title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                {job.company}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {job.location}
              </span>
            </div>
          </div>

          {/* AI Match Dial */}
          <div className="shrink-0">
            <MatchScoreDial score={job.matchScore ?? 80} size="md" />
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Skill Tag Matrix */}
        <div className="pt-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Skill Compatibility
          </div>
          <SkillTagMatrix
            matchedSkills={job.matchedSkills || []}
            missingSkills={job.missingSkills || []}
            maxDisplay={6}
          />
        </div>
      </div>

      {/* Bottom Footer Details & Actions */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div>
          <div className="text-[11px] text-slate-500 uppercase font-medium">Compensation</div>
          <div className="text-sm font-bold font-mono text-emerald-400">
            {formatSalary(job.salary)}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onCheckMatch && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCheckMatch(job)}
              className="text-xs text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/10"
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
            >
              Match Resume
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(job)}
            className="text-xs"
          >
            Details
          </Button>

          {job.isApplied ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" /> Applied
            </span>
          ) : (
            <Button
              variant="primary"
              size="sm"
              isLoading={isApplying}
              onClick={() => onApply(job)}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
