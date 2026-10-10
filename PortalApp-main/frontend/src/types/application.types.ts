export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'SELECTED';

export interface Application {
  id: number;
  jobId: number;
  jobTitle?: string;
  company?: string;
  location?: string;
  salary?: number;
  candidateId?: number;
  candidateName?: string;
  candidateEmail?: string;
  resumeFilename?: string;
  appliedAt: string;
  status: ApplicationStatus;
  // Computed AI Fit metrics for recruiters
  aiMatchScore?: number;
  aiScore?: number;
  aiResult?: string;
  matchingSkills?: string[];
  keyHighlights?: string[];
}
