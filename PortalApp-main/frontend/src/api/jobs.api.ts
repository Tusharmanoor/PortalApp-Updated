import { apiClient } from './client';
import type { Job, JobRequestDto } from '../types/job.types';

export const jobsApi = {
  getAllJobs: async (): Promise<Job[]> => {
    const response = await apiClient.get<Job[]>('/api/jobs');
    return response.data;
  },

  getJobById: async (id: number): Promise<Job> => {
    const response = await apiClient.get<Job>(`/api/job/${id}`);
    return response.data;
  },

  searchJobs: async (keyword: string): Promise<Job[]> => {
    const response = await apiClient.get<Job[]>(`/api/jobs/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  },

  createJob: async (jobData: JobRequestDto): Promise<Job> => {
    const response = await apiClient.post<Job>('/api/job', jobData);
    return response.data;
  },

  updateJob: async (id: number, jobData: JobRequestDto): Promise<Job> => {
    const response = await apiClient.put<Job>(`/api/job/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/job/${id}`);
  },
};
