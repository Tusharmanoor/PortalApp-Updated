import { apiClient } from './client';
import type { ResumeResponse } from '../types/resume.types';

export const resumeApi = {
  uploadResume: async (file: File, jobdescription: string): Promise<ResumeResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobdescription', jobdescription);
    const response = await apiClient.post<ResumeResponse>('/resume/upload', formData);
    return response.data;
  },

};

