import React from 'react';
import type { ExtractedResumeData } from '../../types/resume.types';
import { Sparkles, CheckCircle2, TrendingUp, FileText, Check, Plus, X, AlertCircle } from 'lucide-react';
import { MatchScoreDial } from './MatchScoreDial';

interface AtsAnalysisCardProps {
  data: ExtractedResumeData | null;
  onAddSkill?: (skill: string) => void;
  onRemoveSkill?: (skill: string) => void;
}

export const AtsAnalysisCard: React.FC<AtsAnalysisCardProps> = ({
  data,
  onAddSkill,
  onRemoveSkill,
}) => {
  const [newSkillInput, setNewSkillInput] = React.useState('');

  if (!data) {
    return (
      <div className="glass-panel rounded-2xl border border-white/10 p-8 text-center space-y-3">
        <FileText className="w-10 h-10 text-slate-500 mx-auto" />
        <h4 className="text-sm font-semibold text-slate-300">No Resume Diagnostic Data</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Upload your resume file above against a selected job to extract candidate skills, evaluate ATS readability, and view AI recommendations.
        </p>
      </div>
    );
  }

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillInput.trim() && onAddSkill) {
      onAddSkill(newSkillInput.trim());
      setNewSkillInput('');
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/10 p-6 sm:p-7 space-y-6">
      {/* Top Header with ATS Gauge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100">{data.filename}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ATS Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Parsed Profile &bull; Synced {new Date(data.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 self-center sm:self-auto">
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-1">ATS Optimization</div>
            <MatchScoreDial score={data.atsScore || 85} size="md" showLabel={false} />
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-1">Readability</div>
            <div className="text-2xl font-bold font-mono text-cyan-400">{data.readabilityScore || 90}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">High Clarity</div>
          </div>
        </div>
      </div>

      {/* Extracted Skills Cloud */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI Extracted Skills ({data.parsedSkills?.length || 0})
          </label>
          <span className="text-xs text-slate-500">Click &times; to edit profile</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {data.parsedSkills && data.parsedSkills.length > 0 ? (
            data.parsedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-200 border border-slate-700/80 hover:border-indigo-500/50 transition-colors"
              >
                <Check className="w-3 h-3 text-indigo-400" />
                {skill}
                {onRemoveSkill && (
                  <button
                    onClick={() => onRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-400 ml-0.5"
                    title="Remove skill"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">No skills extracted yet</span>
          )}
        </div>

        {/* Add custom skill quick input */}
        {onAddSkill && (
          <form onSubmit={handleAddSkillSubmit} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              placeholder="Add skill (e.g. Docker, GraphQL, Kubernetes)..."
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 flex-1 max-w-sm"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>
        )}
      </div>

      {/* Strengths & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Resume Strengths
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {data.strengths && data.strengths.length > 0 ? (
              data.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">&bull;</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No specific strengths indexed</li>
            )}
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            AI Recommendations
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {data.improvements && data.improvements.length > 0 ? (
              data.improvements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">&bull;</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No recommendations indexed</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
