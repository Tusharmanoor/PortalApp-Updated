export interface ResumeResponse {
  id: number;
  filename: string;
  uploadedAt: string;
  AIResult?: string;
}

export interface ExtractedResumeData {
  filename: string;
  uploadedAt: string;
  candidateName: string;
  candidateEmail: string;
  parsedSkills: string[];
  experienceYears: number;
  education: string;
  atsScore: number;
  readabilityScore: number;
  strengths: string[];
  improvements: string[];
}
