import { create } from 'zustand';
import type { ResumeResponse, ExtractedResumeData } from '../types/resume.types';
import type { Job } from '../types/job.types';

interface ResumeState {
  resume: ResumeResponse | null;
  extractedData: ExtractedResumeData | null;
  isUploading: boolean;
  selectedJobForMatch: Job | null;
  setSelectedJobForMatch: (job: Job | null) => void;
  setResume: (resume: ResumeResponse | null) => void;
  setExtractedData: (data: ExtractedResumeData | null) => void;
  setIsUploading: (uploading: boolean) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
}

export const useResumeStore = create<ResumeState>((set) => {
  const savedResume = localStorage.getItem('resume-storage');
  let initialResume: ResumeResponse | null = null;
  let initialData: ExtractedResumeData | null = null;

  if (savedResume) {
    try {
      const parsed = JSON.parse(savedResume);
      if (parsed.resume) initialResume = parsed.resume;
      if (parsed.extractedData) initialData = parsed.extractedData;
    } catch (e) {
      console.error('Error restoring resume state:', e);
    }
  }

  return {
    resume: initialResume,
    extractedData: initialData,
    isUploading: false,
    selectedJobForMatch: null,

    setSelectedJobForMatch: (job: Job | null) => set({ selectedJobForMatch: job }),

    setResume: (resume) => {
      set((state) => {
        const newState = { ...state, resume };
        localStorage.setItem('resume-storage', JSON.stringify({ resume, extractedData: state.extractedData }));
        return newState;
      });
    },

    setExtractedData: (extractedData) => {
      set((state) => {
        const newState = { ...state, extractedData };
        localStorage.setItem('resume-storage', JSON.stringify({ resume: state.resume, extractedData }));
        return newState;
      });
    },

    setIsUploading: (isUploading) => set({ isUploading }),

    addSkill: (skill) => {
      set((state) => {
        if (!state.extractedData) return state;
        const trimmed = skill.trim();
        if (!trimmed || state.extractedData.parsedSkills.includes(trimmed)) return state;
        const updatedSkills = [...state.extractedData.parsedSkills, trimmed];
        const updatedData = { ...state.extractedData, parsedSkills: updatedSkills };
        localStorage.setItem('resume-storage', JSON.stringify({ resume: state.resume, extractedData: updatedData }));
        return { extractedData: updatedData };
      });
    },

    removeSkill: (skillToRemove) => {
      set((state) => {
        if (!state.extractedData) return state;
        const updatedSkills = state.extractedData.parsedSkills.filter(s => s !== skillToRemove);
        const updatedData = { ...state.extractedData, parsedSkills: updatedSkills };
        localStorage.setItem('resume-storage', JSON.stringify({ resume: state.resume, extractedData: updatedData }));
        return { extractedData: updatedData };
      });
    },
  };
});
