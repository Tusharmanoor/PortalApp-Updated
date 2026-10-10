import { apiClient } from './client';
import type { Application, ApplicationStatus } from '../types/application.types';

export const applicationsApi = {
  applyForJob: async (jobId: number): Promise<Application> => {
    const response = await apiClient.post<Application>(`/applications/apply?jobId=${jobId}`);
    return response.data;
  },

  getMyApplications: async (): Promise<Application[]> => {
    const response = await apiClient.get<Application[]>('/applications/my');
    return response.data;
  },

  getApplicationsByJob: async (jobId: number): Promise<Application[]> => {
    const response = await apiClient.get<Application[]>(`/applications/job/${jobId}`);
    return response.data;
  },

  updateStatus: async (applicationId: number, status: ApplicationStatus): Promise<Application> => {
    const response = await apiClient.put<Application>(`/applications/${applicationId}/status?status=${status}`);
    return response.data;
  },
};
