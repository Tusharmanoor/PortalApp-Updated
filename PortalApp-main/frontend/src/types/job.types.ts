export type JobType = 'Full-Time' | 'Part-Time' | 'Internship' | 'Contract' | 'Remote';

export interface Job {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: number;
  experience: number;
  jobType: JobType;
  skills: string; // Comma separated, e.g. "Java, Spring Boot, React, MySQL"
  status: boolean;
  postedDate: string;
  createdAt?: string;
  updatedAt?: string;
  // Computed AI frontend fields
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  isApplied?: boolean;
}

export interface JobRequestDto {
  title: string;
  description: string;
  company: string;
  location: string;
  salary: number;
  experience: number;
  jobType: JobType;
  skills: string;
  status: boolean;
  postedDate: string;
}
