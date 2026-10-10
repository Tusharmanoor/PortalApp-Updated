import React, { useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { JobFeedPage } from './pages/candidate/JobFeedPage';
import { ResumeHubPage } from './pages/candidate/ResumeHubPage';
import { MyApplicationsPage } from './pages/candidate/MyApplicationsPage';
import { RecruiterDashboardPage } from './pages/recruiter/RecruiterDashboardPage';
import { CandidateScreeningPage } from './pages/recruiter/CandidateScreeningPage';

export function App() {
  const { user, isAuthenticated } = useAuthStore();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<ActiveTab>('jobs');
  const [screeningJobId, setScreeningJobId] = useState<number | undefined>(undefined);

  // If not logged in, render high-end Auth experience
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-indigo-500 selection:text-white">
        {authView === 'login' ? (
          <LoginPage onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
        )}
        <ToastContainer />
      </div>
    );
  }

  const isRecruiter = user.role === 'ADMIN' || user.role === 'RECRUITER';

  // Handle switching to candidate screening for a specific job from recruiter dashboard
  const handleNavigateToScreening = (jobId?: number) => {
    setScreeningJobId(jobId);
    setActiveTab('recruiter-screening');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Glass Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'recruiter-screening') setScreeningJobId(undefined);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Candidate Views */}
        {!isRecruiter && (
          <>
            {activeTab === 'jobs' && (
              <JobFeedPage onNavigateToResumeHub={() => setActiveTab('resume')} />
            )}
            {activeTab === 'resume' && <ResumeHubPage />}
            {activeTab === 'applications' && <MyApplicationsPage />}
          </>
        )}

        {/* Recruiter Views */}
        {isRecruiter && (
          <>
            {(activeTab === 'recruiter-jobs' || activeTab === 'jobs') && (
              <RecruiterDashboardPage onNavigateToScreening={handleNavigateToScreening} />
            )}
            {(activeTab === 'recruiter-screening' || activeTab === 'applications') && (
              <CandidateScreeningPage initialJobId={screeningJobId} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500 glass-panel">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Nexus AI &bull; Enterprise Resume Screening & Recommendation Platform</span>
          <span className="font-mono text-slate-600">Spring Boot 4.1.0 + React 19 Engine</span>
        </div>
      </footer>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;
