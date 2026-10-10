import type { Job } from '../types/job.types';

// Default mock candidate skills if none uploaded yet
export const DEFAULT_CANDIDATE_SKILLS = [
  'Java',
  'Spring Boot',
  'REST APIs',
  'MySQL',
  'Hibernate',
  'Docker',
  'Git',
  'TypeScript',
  'React',
  'Tailwind CSS'
];

/**
 * Normalizes skill strings for robust matching (e.g. "React.js" -> "react", "Spring-Boot" -> "springboot")
 */
export function normalizeSkill(skill: string): string {
  return skill
    .toLowerCase()
    .replace(/[.\-_]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

/**
 * Parses comma/semicolon/newline-separated skills string into a clean array
 */
export function parseSkillsString(skillsStr: string | null | undefined): string[] {
  if (!skillsStr) return [];
  return skillsStr
    .split(/[,;\n/]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

const SYNONYM_MAP: Record<string, string[]> = {
  'java': ['java', 'core java', 'java 8', 'java 11', 'java 17', 'java ee'],
  'spring boot': ['spring boot', 'springboot', 'spring framework', 'spring mvc', 'spring'],
  'rest api': ['rest api', 'rest apis', 'restful api', 'restful apis', 'restful web services', 'rest'],
  'mysql': ['mysql', 'mysql database', 'mysql db'],
  'postgresql': ['postgresql', 'postgres', 'postgres database'],
  'hibernate': ['hibernate', 'jpa', 'hibernate/jpa', 'spring data jpa'],
  'jpa': ['jpa', 'hibernate', 'hibernate/jpa', 'spring data jpa'],
  'git': ['git', 'github', 'gitlab', 'version control'],
  'javascript': ['javascript', 'js'],
  'typescript': ['typescript', 'ts'],
  'react': ['react', 'reactjs', 'react.js'],
  'node': ['node', 'nodejs', 'node.js', 'node js'],
  'project management': ['project management', 'project manager', 'project coordination', 'pmp'],
  'data analysis': ['data analysis', 'data analytics', 'data analyst'],
  'machine learning': ['machine learning', 'ml'],
  'agile': ['agile', 'scrum'],
  'ci/cd': ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment'],
};

/**
 * Calculates AI Compatibility Match Score & breakdown between candidate resume skills and job requirements
 */
export function calculateJobMatch(
  job: Job,
  candidateSkills: string[] = DEFAULT_CANDIDATE_SKILLS
): {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  relevanceTier: 'EXCELLENT' | 'STRONG' | 'MODERATE' | 'LOW';
} {
  const requiredSkills = parseSkillsString(job.skills);
  if (requiredSkills.length === 0) {
    return {
      matchScore: 85,
      matchedSkills: candidateSkills.slice(0, 3),
      missingSkills: [],
      relevanceTier: 'STRONG',
    };
  }

  const normalizedCandidateSkills = candidateSkills.map(normalizeSkill);
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const reqSkill of requiredSkills) {
    const normReq = normalizeSkill(reqSkill);
    const reqLower = reqSkill.toLowerCase().trim();

    let reqAliases = SYNONYM_MAP[reqLower] || [];
    if (reqAliases.length === 0) {
      for (const [key, aliases] of Object.entries(SYNONYM_MAP)) {
        if (aliases.includes(reqLower) || key === reqLower) {
          reqAliases = aliases;
          break;
        }
      }
    }

    const hasMatch = normalizedCandidateSkills.some((cand, idx) => {
      const candRaw = (candidateSkills[idx] || '').toLowerCase().trim();
      if (cand.includes(normReq) || normReq.includes(cand)) return true;
      if (reqLower.endsWith('s') && candRaw.includes(reqLower.slice(0, -1))) return true;
      if (candRaw.endsWith('s') && reqLower.includes(candRaw.slice(0, -1))) return true;
      if (reqAliases.some(alias => {
        const normAlias = normalizeSkill(alias);
        return cand.includes(normAlias) || normAlias.includes(cand) || candRaw.includes(alias.toLowerCase());
      })) return true;
      return false;
    });

    if (hasMatch) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  }

  // Calculate weighted percentage
  const matchRatio = matchedSkills.length / requiredSkills.length;
  let score = Math.round(45 + (matchRatio * 50));
  if (matchedSkills.length === requiredSkills.length) score = 98;
  if (matchedSkills.length === 0) score = Math.max(30, Math.round(matchRatio * 100));

  let relevanceTier: 'EXCELLENT' | 'STRONG' | 'MODERATE' | 'LOW' = 'LOW';
  if (score >= 88) relevanceTier = 'EXCELLENT';
  else if (score >= 75) relevanceTier = 'STRONG';
  else if (score >= 50) relevanceTier = 'MODERATE';

  return {
    matchScore: score,
    matchedSkills,
    missingSkills,
    relevanceTier,
  };
}

/**
 * Formats currency amounts nicely, e.g. 120000 -> "$120,000" or "₹12,00,000"
 */
export function formatSalary(amount: number | string | undefined | null): string {
  if (!amount) return 'Competitive';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Competitive';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num);
}
