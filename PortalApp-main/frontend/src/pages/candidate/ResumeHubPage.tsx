import React, { useState, useEffect } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { resumeApi } from '../../api/resume.api';
import { toast } from '../../store/useToastStore';
import { ResumeDropzone } from '../../components/resume/ResumeDropzone';
import { AtsAnalysisCard } from '../../components/ai/AtsAnalysisCard';
import {
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  AlertCircle,
  Briefcase,
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
  Info,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const ResumeHubPage: React.FC = () => {
  const {
    resume,
    extractedData,
    selectedJobForMatch,
    setSelectedJobForMatch,
    setResume,
    setExtractedData,
    addSkill,
    removeSkill,
  } = useResumeStore();

  const [isUploading, setIsUploading] = useState(false);
  const [manualJobDescription, setManualJobDescription] = useState('');
  const [jobDescriptionError, setJobDescriptionError] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(resume?.AIResult ?? null);
  const [uploadError, setUploadError] = useState('');
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);

  // Effective job description used for API request
  const effectiveJobDescription = selectedJobForMatch
    ? selectedJobForMatch.description
    : manualJobDescription;

  // Auto-populate when selected job changes
  useEffect(() => {
    if (selectedJobForMatch) {
      setJobDescriptionError('');
    }
  }, [selectedJobForMatch]);

  const handleUploadResume = async (file: File) => {
    const jdToSend = effectiveJobDescription.trim();

    // Validate job description is available
    if (!jdToSend) {
      setJobDescriptionError(
        'Please select a job from Job Feed or paste a job description.'
      );
      return;
    }

    setJobDescriptionError('');
    setUploadError('');
    setIsUploading(true);

    try {
      // Send file + jobdescription via multipart/form-data with Bearer token
      const response = await resumeApi.uploadResume(file, jdToSend);

      // Store server response (id, filename, uploadedAt, AIResult)
      setResume(response);
      setAiResult(response.AIResult ?? null);

      // Update extracted resume details with real file metadata
      const currentData = extractedData || {
        filename: file.name,
        uploadedAt: new Date().toISOString(),
        candidateName: 'Current User',
        candidateEmail: '',
        parsedSkills: [],
        experienceYears: 0,
        education: '',
        atsScore: 85,
        readabilityScore: 90,
        strengths: [],
        improvements: [],
      };

      setExtractedData({
        ...currentData,
        filename: response.filename || file.name,
        uploadedAt: response.uploadedAt || new Date().toISOString(),
      });

      toast.success(
        'AI Match Completed!',
        `Successfully analyzed ${file.name} against ${
          selectedJobForMatch ? selectedJobForMatch.title : 'Job Description'
        }.`
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to connect to backend server. Please make sure Spring Boot is running on port 8080.';
      setUploadError(
        typeof message === 'string'
          ? message
          : 'Upload failed. Please check backend connection.'
      );
      toast.error('Upload Failed', typeof message === 'string' ? message : 'Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to parse AIResult JSON if backend returns JSON structure
  const renderParsedAiResult = () => {
    if (!aiResult) return null;

    let parsed: any = null;
    try {
      parsed = JSON.parse(aiResult);
    } catch {
      parsed = null;
    }

    if (parsed && typeof parsed === 'object') {
      const score = parsed.score ?? parsed.match_score ?? parsed.atsScore ?? null;
      const details = parsed.details || parsed;
       const rawMatched =
  details.matching_skills ||
  details['Matching skills'] ||
  details.matched_skills ||
  details.matchedSkills ||
  []; 
      const matched: string[] = Array.isArray(rawMatched)
        ? rawMatched
        : typeof rawMatched === 'string'
        ? rawMatched.split(',').map((s) => s.trim())
        : [];

      const rawMissing =
  details.missing_important_skills ||
  details['Missing important skills'] ||
  details.missing_skills ||
  details.missingSkills ||
  [];
      const missing: string[] = Array.isArray(rawMissing)
        ? rawMissing
        : typeof rawMissing === 'string'
        ? rawMissing.split(',').map((s) => s.trim())
        : [];

      const candidateName =
        details['Candidate name'] ||
        details['1. Candidate name'] ||
        parsed.name ||
        '';
      const summary =
  details.feedback_summary ||
  details.verdict ||
  details.summary ||
  details.analysis ||
  '';
  const recommendations = Array.isArray(details.recommendations)
  ? details.recommendations
  : [];

      const expRequirement =
        details['Whether experience requirement is met'] ||
        details['4. Whether experience requirement is met'] ||
        '';

      return (
        <div className="glass-panel rounded-2xl border border-indigo-500/30 p-6 space-y-6 bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-slate-900/40">
          {/* Top Score Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  AI Match Analysis Report
                </h3>
                <p className="text-xs text-slate-400">
                  Evaluated for {resume?.filename || extractedData?.filename || 'Resume Document'}
                </p>
              </div>
            </div>

            {score !== null && (
              <div className="flex items-center gap-3 self-center sm:self-auto">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">
                    AI Match Score
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-emerald-400">
                    {score}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Matched vs Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Strong Matches ({matched.length})
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {matched.length > 0 ? (
                  matched.map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    >
                      ✓ {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No direct skill matches</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                <XCircle className="w-4 h-4 text-rose-400" />
                Missing / Weak Skills ({missing.length})
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {missing.length > 0 ? (
                  missing.map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30"
                    >
                      • {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No missing skills detected</span>
                )}
              </div>
            </div>
          </div>

          {/* AI Summary / Feedback */}
          {summary && (
            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-1.5">
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> AI Feedback Summary
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {summary}
              </p>
            </div>
          )}

          {/* Personalized AI Actionable Recommendations */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/30 space-y-2">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Personalized AI Recommendations for Job Fit
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              {recommendations.length > 0 ? (
                recommendations.map((recommendation: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">
                      →
                    </span>
                    <span>{recommendation}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">
                    ✓
                  </span>
                  <span>
                    Your resume covers all required core skills for this job opening! Keep project descriptions detailed and measurable.
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      );
    }


    // Plain text fallback
    return (
      <div className="glass-panel rounded-2xl border border-indigo-500/30 p-6 space-y-3 bg-slate-900/60">
        <div className="flex items-center gap-2 text-sm font-bold text-indigo-300">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          FastAPI AI Match Result
        </div>
        <pre className="whitespace-pre-wrap text-xs sm:text-sm text-slate-200 font-mono leading-relaxed p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          {aiResult}
        </pre>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          AI Neural Resume Matcher
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Resume &amp; Job Match Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Analyze how well your resume matches target positions from the Job Feed. Upload your resume to get instant AI-powered compatibility scores and skill gap insights.
        </p>
      </div>

      {/* Selected Job Card (Primary Workflow) */}
      {selectedJobForMatch ? (
        <div className="glass-panel rounded-2xl border border-indigo-500/30 p-5 sm:p-6 space-y-4 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-900/60 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary">Target Position</Badge>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                  Loaded from Job Feed
                </span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                {selectedJobForMatch.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-indigo-300">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  {selectedJobForMatch.company}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {selectedJobForMatch.location}
                </span>
                <span>&bull;</span>
                <span className="text-slate-400 font-mono">
                  {selectedJobForMatch.jobType}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedJobForMatch(null)}
              className="text-xs shrink-0 text-slate-400 hover:text-slate-200"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Change Job
            </Button>
          </div>

          {/* Job Description Preview */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5 text-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Job Description (Auto-Supplied to AI)
            </div>
            <p className="text-slate-300 line-clamp-3 leading-relaxed">
              {selectedJobForMatch.description}
            </p>
          </div>

          {/* Required Skills */}
          {selectedJobForMatch.skills && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                Required Skills:
              </span>
              {selectedJobForMatch.skills.split(',').map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-xs"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Secondary / Fallback Option when no job is selected */
        <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  No Job Selected from Job Feed
                </h3>
                <p className="text-xs text-slate-400">
                  Select a job directly from the Job Feed for automatic 1-click matching, or paste a custom description below.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsManualInputOpen(!isManualInputOpen)}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
            >
              {isManualInputOpen ? 'Hide Manual Input' : 'Paste Custom Job Description'}
            </button>
          </div>

          {/* Manual Input Textarea (Collapsible / Secondary) */}
          {isManualInputOpen && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label
                htmlFor="manualJd"
                className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                Custom Job Description
              </label>
              <textarea
                id="manualJd"
                rows={4}
                value={manualJobDescription}
                onChange={(e) => {
                  setManualJobDescription(e.target.value);
                  if (e.target.value.trim()) setJobDescriptionError('');
                }}
                placeholder="Paste the target job description here..."
                className="w-full px-4 py-3 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          )}
        </div>
      )}

      {/* Validation Error Banner */}
      {jobDescriptionError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{jobDescriptionError}</span>
        </div>
      )}

      {/* Resume Upload Dropzone */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Upload Resume Document
          </h2>
          {selectedJobForMatch && (
            <span className="text-xs text-indigo-300">
              Matching against: <strong className="text-white">{selectedJobForMatch.title}</strong>
            </span>
          )}
        </div>

        <ResumeDropzone
          onUpload={handleUploadResume}
          isUploading={isUploading}
          currentFilename={resume?.filename || extractedData?.filename}
        />
      </div>

      {/* Upload Server Error Banner */}
      {uploadError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-200 mb-0.5">API Request Failed</div>
            <div className="text-xs">{uploadError}</div>
          </div>
        </div>
      )}

      {/* AI Result Section (Real Result from FastAPI via Spring Boot) */}
      {aiResult && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              Live AI Matching Result
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Source: Spring Boot (:8080) &rarr; FastAPI (:8000)
            </span>
          </div>

          {renderParsedAiResult()}
        </div>
      )}

      {/* Standard ATS Diagnostic Card */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Candidate Skill Diagnostic Profile
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {resume ? `Synced: ${resume.filename}` : 'Diagnostic Profile'}
          </span>
        </div>

        <AtsAnalysisCard
          data={extractedData}
          onAddSkill={addSkill}
          onRemoveSkill={removeSkill}
        />
      </div>
    </div>
  );
};
