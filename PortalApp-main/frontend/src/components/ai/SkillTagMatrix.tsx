import React from 'react';
import { Check, Sparkles, Plus } from 'lucide-react';

interface SkillTagMatrixProps {
  matchedSkills: string[];
  missingSkills: string[];
  maxDisplay?: number;
}

export const SkillTagMatrix: React.FC<SkillTagMatrixProps> = ({
  matchedSkills,
  missingSkills,
  maxDisplay = 8,
}) => {
  const visibleMatched = matchedSkills.slice(0, maxDisplay);
  const remainingSlots = Math.max(0, maxDisplay - visibleMatched.length);
  const visibleMissing = missingSkills.slice(0, remainingSlots);
  const overflowCount = (matchedSkills.length + missingSkills.length) - (visibleMatched.length + visibleMissing.length);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Matched skills */}
      {visibleMatched.map((skill) => (
        <span
          key={`match-${skill}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
          title="Matched with your resume"
        >
          <Check className="w-3 h-3 text-emerald-400" />
          {skill}
        </span>
      ))}

      {/* Missing/Desired skills */}
      {visibleMissing.map((skill) => (
        <span
          key={`miss-${skill}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60 border-dashed"
          title="Missing from your resume"
        >
          <Plus className="w-2.5 h-2.5 text-slate-500" />
          {skill}
        </span>
      ))}

      {overflowCount > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-400">
          +{overflowCount} more
        </span>
      )}
    </div>
  );
};
