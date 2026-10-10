import React, { useState, useEffect } from 'react';
import type { Job, JobRequestDto, JobType } from '../../types/job.types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Sparkles, Plus, X } from 'lucide-react';

interface JobEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: JobRequestDto, jobId?: number) => Promise<void>;
  initialJob?: Job | null;
}

const JOB_TYPES: JobType[] = [
  'Full-Time',
  'Part-Time',
  'Internship',
  'Contract',
  'Remote',
];

export const JobEditorModal: React.FC<JobEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialJob,
}) => {
  const [formData, setFormData] = useState<JobRequestDto>({
    title: '',
    company: '',
    location: '',
    salary: 100000,
    experience: 2,
    jobType: 'Full-Time',
    description: '',
    skills: '',
    status: true,
    postedDate: new Date().toISOString().split('T')[0],
  });

  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialJob) {
      setFormData({
        title: initialJob.title,
        company: initialJob.company,
        location: initialJob.location,
        salary: Number(initialJob.salary) || 100000,
        experience: initialJob.experience,
        jobType: initialJob.jobType,
        description: initialJob.description,
        skills: initialJob.skills,
        status: initialJob.status ?? true,
        postedDate: initialJob.postedDate || new Date().toISOString().split('T')[0],
      });
      const parsed = initialJob.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      setSkillsList(parsed);
    } else {
      setFormData({
        title: '',
        company: '',
        location: '',
        salary: 110000,
        experience: 2,
        jobType: 'Full-Time',
        description: 'We are seeking a skilled engineer to join our team, build scalable backend services, and collaborate on modern cloud applications.',
        skills: '',
        status: true,
        postedDate: new Date().toISOString().split('T')[0],
      });
      setSkillsList(['Java', 'Spring Boot', 'REST APIs', 'MySQL']);
    }
  }, [initialJob, isOpen]);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      const updated = [...skillsList, trimmed];
      setSkillsList(updated);
      setFormData((prev) => ({ ...prev, skills: updated.join(', ') }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skillsList.filter((s) => s !== skillToRemove);
    setSkillsList(updated);
    setFormData((prev) => ({ ...prev, skills: updated.join(', ') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.title.trim().length < 2 || formData.title.trim().length > 50) {
      setError('Job Title must be between 2 and 50 characters long.');
      return;
    }

    if (formData.company.trim().length < 2 || formData.company.trim().length > 50) {
      setError('Company Name must be between 2 and 50 characters long.');
      return;
    }

    if (formData.location.trim().length < 2 || formData.location.trim().length > 50) {
      setError('Location must be between 2 and 50 characters long.');
      return;
    }

    if (formData.description.trim().length < 10 || formData.description.trim().length > 1000) {
      setError('Description must be between 10 and 1000 characters long.');
      return;
    }

    if (skillsList.length === 0) {
      setError('Please provide at least one required skill.');
      return;
    }

    try {
      setIsLoading(true);
      const submissionData = {
        ...formData,
        skills: skillsList.join(', '),
      };
      await onSave(submissionData, initialJob?.id);
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Failed to save job.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialJob ? 'Edit Job Opening' : 'Post New Job Opening'}
      subtitle="Define role requirements for automated AI screening & matching"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Acme Cloud Corp"
              className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
              Location *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. San Francisco / Remote"
              className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
              Job Type *
            </label>
            <select
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value as JobType })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
            >
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
              Annual Salary (USD) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
              Min Experience Required: <span className="text-indigo-400 font-bold">{formData.experience} Years</span>
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 self-end">
            <div>
              <div className="font-semibold text-slate-200">Active Job Listing</div>
              <div className="text-[10px] text-slate-400">Accept candidate applications</div>
            </div>
            <input
              type="checkbox"
              checked={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Skill Tags Creator */}
        <div className="space-y-2">
          <label className="text-slate-300 font-semibold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Required Skills for AI ATS Matcher *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="Type skill & press Enter (e.g. Docker, PostgreSQL, Microservices)..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddSkill}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {skillsList.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-indigo-400 hover:text-rose-400 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Description textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
              Job Description (Min 10 chars) *
            </label>
            <span className="text-slate-500 text-[10px]">{formData.description.length} / 1000</span>
          </div>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe role responsibilities, team culture, project scope and stack details..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm leading-relaxed"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialJob ? 'Update Job' : 'Publish Job'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
