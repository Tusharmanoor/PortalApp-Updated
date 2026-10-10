import React from 'react';
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import type { JobType } from '../../types/job.types';

export interface FilterState {
  keyword: string;
  jobType: string;
  minMatchScore: number;
  maxExperience: number;
}

interface JobFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalResults: number;
}

const JOB_TYPES: (JobType | 'All')[] = [
  'All',
  'Full-Time',
  'Part-Time',
  'Internship',
  'Contract',
  'Remote',
];

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onChange,
  totalResults,
}) => {
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, keyword: e.target.value });
  };

  const handleJobTypeChange = (type: string) => {
    onChange({ ...filters, jobType: type === 'All' ? '' : type });
  };

  const handleReset = () => {
    onChange({
      keyword: '',
      jobType: '',
      minMatchScore: 0,
      maxExperience: 50,
    });
  };

  const hasActiveFilters =
    filters.keyword !== '' ||
    filters.jobType !== '' ||
    filters.minMatchScore > 0 ||
    filters.maxExperience < 50;

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4 border border-white/10">
      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.keyword}
            onChange={handleKeywordChange}
            placeholder="Search by job title, keywords, or company (e.g. Java Engineer, Spring Boot)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          {filters.keyword && (
            <button
              onClick={() => onChange({ ...filters, keyword: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-xl border border-slate-700 hover:bg-white/5 transition-colors inline-flex items-center justify-center gap-1.5 self-end sm:self-auto"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* Pill Filters & Sliders */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
        {/* Job Type Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1 font-medium">Type:</span>
          {JOB_TYPES.map((type) => {
            const isSelected =
              (type === 'All' && !filters.jobType) || filters.jobType === type;
            return (
              <button
                key={type}
                onClick={() => handleJobTypeChange(type)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 border border-slate-700/60'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>

        {/* AI Score Filter */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1 font-medium text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Min Match:
          </span>
          <input
            type="range"
            min="0"
            max="90"
            step="10"
            value={filters.minMatchScore}
            onChange={(e) =>
              onChange({ ...filters, minMatchScore: Number(e.target.value) })
            }
            className="w-24 accent-emerald-500 cursor-pointer"
          />
          <span className="font-mono font-bold text-slate-200 min-w-[32px]">
            {filters.minMatchScore > 0 ? `${filters.minMatchScore}%` : 'Any'}
          </span>
        </div>
      </div>

      {/* Results Counter */}
      <div className="text-xs text-slate-500 font-medium pt-1">
        Showing <span className="text-slate-200 font-bold">{totalResults}</span> recommended opportunities
      </div>
    </div>
  );
};
