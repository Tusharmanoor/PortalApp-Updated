import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Sparkles, LogOut, Briefcase, FileText, LayoutDashboard, UserCheck, ShieldCheck } from 'lucide-react';
import { Badge } from '../common/Badge';

export type ActiveTab = 'jobs' | 'resume' | 'applications' | 'recruiter-jobs' | 'recruiter-screening';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuthStore();
  const isRecruiterOrAdmin = user?.role === 'ADMIN' || user?.role === 'RECRUITER';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              NEXUS <span className="text-indigo-400 font-mono text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">AI</span>
            </span>
            <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase hidden sm:block">
              ATS Screening & Matching Platform
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {!isRecruiterOrAdmin ? (
            // Candidate Navigation
            <>
              <button
                onClick={() => onTabChange('jobs')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'jobs'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Job Feed</span>
              </button>

              <button
                onClick={() => onTabChange('resume')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'resume'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>AI Resume Hub</span>
              </button>

              <button
                onClick={() => onTabChange('applications')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'applications'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>My Applications</span>
              </button>
            </>
          ) : (
            // Recruiter / Admin Navigation
            <>
              <button
                onClick={() => onTabChange('recruiter-jobs')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'recruiter-jobs'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Job Studio</span>
              </button>

              <button
                onClick={() => onTabChange('recruiter-screening')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'recruiter-screening'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>AI ATS Screening</span>
              </button>
            </>
          )}
        </nav>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-200">{user?.name || 'User'}</span>
              <Badge variant={isRecruiterOrAdmin ? 'warning' : 'primary'} size="sm">
                {user?.role || 'CANDIDATE'}
              </Badge>
            </div>
            <span className="text-[10px] text-slate-500">{user?.email}</span>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
