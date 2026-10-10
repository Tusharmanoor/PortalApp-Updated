import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/auth.api';
import { toast } from '../../store/useToastStore';
import { Sparkles, Mail, Lock, ArrowRight, User, Building2 } from 'lucide-react';
import { Button } from '../../components/common/Button';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.login({ email: loginEmail, password: loginPass });
      setAuth(
        {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role,
        },
        response.token
      );
      toast.success('Welcome back!', `Logged in as ${response.name} (${response.role})`);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err?.response?.data ||
          err?.message ||
          'Failed to authenticate with server. Ensure backend is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  // Real Demo account login/register with Spring Boot backend
  const handleQuickDemo = async (role: 'CANDIDATE' | 'RECRUITER') => {
    const demoEmail = role === 'CANDIDATE' ? 'candidate.demo@nexus.com' : 'recruiter.demo@nexus.com';
    const demoPassword = 'Password123!';
    const demoName = role === 'CANDIDATE' ? 'Demo Candidate' : 'Demo Recruiter';

    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsLoading(true);
    setError('');

    try {
      // First attempt to login with demo credentials
      await performLogin(demoEmail, demoPassword);
    } catch {
      // If demo account does not exist in DB yet, auto-register it
      try {
        await authApi.register({
          name: demoName,
          email: demoEmail,
          password: demoPassword,
          role,
        });
        // Login immediately after registration
        await performLogin(demoEmail, demoPassword);
      } catch (regErr: any) {
        setError('Unable to authenticate demo account with backend server.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#07090e]">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-cyan-600/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-xl shadow-indigo-500/25 mb-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            NEXUS <span className="text-indigo-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400">
            AI-Driven Resume Screening &amp; Precision Job Matching
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel rounded-2xl border border-white/10 p-7 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-100">Sign in to your account</h2>
            <p className="text-xs text-slate-400">Enter your credentials to access the portal</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase text-[10px] tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase text-[10px] tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Previews */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="text-[10px] text-center text-slate-500 font-semibold uppercase tracking-wider">
              Instant Demo Access (Auto-Creates Real Session)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('CANDIDATE')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium text-slate-300 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Demo Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('RECRUITER')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium text-slate-300 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Recruiter</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
