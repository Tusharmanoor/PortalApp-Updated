import React from 'react';
import type { Job } from '../../types/job.types';
import { Modal } from '../common/Modal';
import { MatchScoreDial } from '../ai/MatchScoreDial';
import { formatSalary } from '../../utils/aiMatcher';
import { Building2, MapPin, Briefcase, Calendar, CheckCircle2, Sparkles, Check, Plus } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (job: Job) => void;
  onCheckMatch?: (job: Job) => void;
  isApplying?: boolean;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  onApply,
  onCheckMatch,
  isApplying = false,
}) => {
  if (!job) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={job.title}
      subtitle={`${job.company} • ${job.location}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Top Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
          <div>
            <div className="text-slate-500 uppercase font-medium text-[10px]">Salary</div>
            <div className="font-bold text-emerald-400 font-mono mt-0.5 text-sm">
              {formatSalary(job.salary)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 uppercase font-medium text-[10px]">Experience</div>
            <div className="font-semibold text-slate-200 mt-0.5">
              {job.experience === 0 ? 'Fresher / Entry' : `${job.experience}+ Years`}
            </div>
          </div>
          <div>
            <div className="text-slate-500 uppercase font-medium text-[10px]">Job Type</div>
            <div className="font-semibold text-slate-200 mt-0.5">{job.jobType}</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase font-medium text-[10px]">Posted</div>
            <div className="font-semibold text-slate-200 mt-0.5">{job.postedDate || 'Recent'}</div>
          </div>
        </div>

        {/* AI Fit Analysis Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-900/40 border border-indigo-500/25 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-slate-100">AI Compatibility Analysis</h4>
            </div>
            <div className="scale-75 origin-right">
              <MatchScoreDial score={job.matchScore ?? 80} size="sm" showLabel={false} />
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Check className="w-3 h-3" /> Matched In Your Resume ({job.matchedSkills?.length || 0})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {job.matchedSkills && job.matchedSkills.length > 0 ? (
                  job.matchedSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic">No exact skill matches identified</span>
                )}
              </div>
            </div>

            {job.missingSkills && job.missingSkills.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Plus className="w-3 h-3 text-slate-500" /> Recommended Skills To Acquire ({job.missingSkills.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {job.missingSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-xs border-dashed"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider text-xs">
            Role Overview & Responsibilities
          </h4>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {job.description}
          </div>
        </div>

        {/* Required Skills full list */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider text-xs">
            All Required Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.split(',').map((skill, i) => (
              <Badge key={i} variant="neutral">
                {skill.trim()}
              </Badge>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            {onCheckMatch && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onCheckMatch(job);
                }}
                className="text-xs text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/10"
                leftIcon={<Sparkles className="w-4 h-4 text-indigo-400" />}
              >
                Check Resume Match
              </Button>
            )}

            {job.isApplied ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" /> Application Submitted
              </span>
            ) : (
              <Button
                variant="primary"
                isLoading={isApplying}
                onClick={() => onApply(job)}
                className="px-6"
              >
                Submit Application
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
