import React, { useState } from 'react';
import type { Application, ApplicationStatus } from '../../types/application.types';
import { MatchScoreDial } from '../ai/MatchScoreDial';
import { Badge } from '../common/Badge';
import { UserCheck, FileText, Sparkles, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../common/Button';

interface ApplicantLeaderboardProps {
  applicants: Application[];
  onStatusChange: (applicationId: number, newStatus: ApplicationStatus) => Promise<void>;
  isLoading?: boolean;
}

const statusVariants: Record<ApplicationStatus, 'primary' | 'success' | 'warning' | 'danger'> = {
  APPLIED: 'primary',
  SHORTLISTED: 'warning',
  SELECTED: 'success',
  REJECTED: 'danger',
};

export const ApplicantLeaderboard: React.FC<ApplicantLeaderboardProps> = ({
  applicants,
  onStatusChange,
  isLoading = false,
}) => {
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);

  // Sort applicants by AI match score descending if present, else by appliedAt date
  const sortedApplicants = [...applicants].sort((a, b) => {
    const scoreA = a.aiScore ?? a.aiMatchScore ?? 0;
    const scoreB = b.aiScore ?? b.aiMatchScore ?? 0;
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    return new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime();
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center rounded-2xl glass-panel border border-white/10 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <h4 className="text-sm font-semibold text-slate-300">Loading Applicants &amp; Running AI Screening...</h4>
      </div>
    );
  }

  if (sortedApplicants.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl glass-panel border border-white/10 space-y-3">
        <UserCheck className="w-10 h-10 text-slate-500 mx-auto" />
        <h4 className="text-sm font-semibold text-slate-300">No applicants yet</h4>
        <p className="text-xs text-slate-500">
          Candidates who apply for this job position will be listed and ranked here.
        </p>
      </div>
    );
  }

  // Parse AI Details JSON if available
  let parsedAiResult: any = null;
  if (selectedApplicant?.aiResult) {
    try {
      parsedAiResult = JSON.parse(selectedApplicant.aiResult);
    } catch (e) {
      parsedAiResult = null;
    }
  }

  return (
    <>
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/60 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Rank &amp; Candidate</th>
                <th className="py-3.5 px-4">AI Match Score</th>
                <th className="py-3.5 px-4">Applied Date</th>
                <th className="py-3.5 px-4">Submitted Resume</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedApplicants.map((applicant, index) => {
                const score = applicant.aiScore ?? applicant.aiMatchScore;
                return (
                  <tr
                    key={applicant.id}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    onClick={() => setSelectedApplicant(applicant)}
                  >
                    {/* Candidate Name & Rank */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            index === 0
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : index === 1
                              ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                              : index === 2
                              ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-sm">
                            {applicant.candidateName || `Candidate #${applicant.candidateId || applicant.id}`}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {applicant.candidateEmail || 'candidate@jobportal.com'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* AI Score */}
                    <td className="py-4 px-4">
                      {score !== undefined ? (
                        <div className="flex items-center gap-2">
                          <MatchScoreDial score={score} size="sm" showLabel={false} />
                          <div className="text-[11px]">
                            <span className="font-bold text-slate-200">{score}% Fit</span>
                            <div className="text-[10px] text-slate-500">
                              {score >= 85 ? 'Top Match' : score >= 70 ? 'Strong Match' : 'Potential Match'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[10px] font-mono border border-slate-700">
                          AI Screening Pending
                        </span>
                      )}
                    </td>

                    {/* Applied Date */}
                    <td className="py-4 px-4 text-slate-400 text-[11px]">
                      {applicant.appliedAt
                        ? new Date(applicant.appliedAt).toLocaleDateString()
                        : 'Recently'}
                    </td>

                    {/* Resume Document */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60 text-[11px]">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        {applicant.resumeFilename || 'resume.pdf'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <Badge variant={statusVariants[applicant.status]}>
                        {applicant.status}
                      </Badge>
                    </td>

                    {/* Status Action Selector */}
                    <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedApplicant(applicant)}
                        >
                          Inspect AI
                        </Button>
                        <select
                          value={applicant.status}
                          onChange={(e) =>
                            onStatusChange(applicant.id, e.target.value as ApplicationStatus)
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="SHORTLISTED">Shortlist ⭐</option>
                          <option value="SELECTED">Select / Hire 🎯</option>
                          <option value="REJECTED">Reject</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Analysis Details Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-xl p-6 rounded-2xl glass-panel border border-indigo-500/30 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
                  <Sparkles className="w-3 h-3" />
                  Exact AI Matcher Analysis
                </div>
                <h3 className="text-lg font-bold text-white">
                  {selectedApplicant.candidateName || `Applicant #${selectedApplicant.candidateId}`}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedApplicant.candidateEmail} &bull; {selectedApplicant.resumeFilename}
                </p>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Summary */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <MatchScoreDial score={selectedApplicant.aiScore ?? 80} size="md" />
              <div>
                <div className="text-sm font-bold text-slate-100">
                  {selectedApplicant.aiScore ?? 80}% Compatibility Fit
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {parsedAiResult?.summary ||
                    parsedAiResult?.['final verdict'] ||
                    'Evaluated against job description using Python AI matcher.'}
                </p>
              </div>
            </div>

            {/* Skills Breakdown */}
            {parsedAiResult && (
              <div className="space-y-4 text-xs">
                {/* Matched Skills */}
                {(parsedAiResult.matched_skills || parsedAiResult['Matching skills']) && (
                  <div>
                    <span className="font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Matched Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        parsedAiResult.matched_skills ||
                        parsedAiResult['Matching skills'] ||
                        []
                      ).map((skill: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills / Gaps */}
                {(parsedAiResult.missing_skills || parsedAiResult['Missing important skills']) && (
                  <div>
                    <span className="font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Missing Skills / Skill Gaps
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        parsedAiResult.missing_skills ||
                        parsedAiResult['Missing important skills'] ||
                        []
                      ).map((skill: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedApplicant(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onStatusChange(selectedApplicant.id, 'SHORTLISTED');
                  setSelectedApplicant(null);
                }}
              >
                Shortlist Candidate ⭐
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

