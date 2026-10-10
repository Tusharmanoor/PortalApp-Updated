import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';

interface ResumeDropzoneProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  currentFilename?: string;
}

export const ResumeDropzone: React.FC<ResumeDropzoneProps> = ({
  onUpload,
  isUploading,
  currentFilename,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setErrorMessage('');
    const validExtensions = ['.pdf', '.docx', '.doc'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMessage('Please upload a valid PDF or DOCX resume document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Upload failed.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-950/30 scale-[1.01]'
            : 'border-slate-700/80 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/70'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.doc"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-200">
              Drag & drop your resume file, or <span className="text-indigo-400 underline">browse</span>
            </p>
            <p className="text-xs text-slate-400">
              Supports standard ATS formats (PDF, DOCX) &bull; Max 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected file confirmation */}
      {selectedFile && (
        <div className="flex items-center justify-between p-4 rounded-xl glass-panel border border-indigo-500/30">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-xs font-bold text-slate-100">{selectedFile.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isUploading}
              onClick={handleUploadClick}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Parse & Sync Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
