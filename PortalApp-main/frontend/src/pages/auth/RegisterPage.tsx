import React, { useState } from 'react';
import { authApi } from '../../api/auth.api';
import { toast } from '../../store/useToastStore';
import { Sparkles, Mail, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CANDIDATE' | 'RECRUITER'>('CANDIDATE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8 || password.length > 20) {
      setError('Password must be between 8 and 20 characters.');
      return;
    }

    try {
      setIsLoading(true);
      await authApi.register({
        name,
        email,
        password,
        role,
      });

      toast.success('Registration successful!', 'Please sign in with your new credentials.');
      onSwitchToLogin();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(
        err?.response?.data ||
          err?.message ||
          'Failed to register account with server.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#07090e]">
      {/* Ambient glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cyan-600/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-xl shadow-indigo-500/25 mb-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            NEXUS <span className="text-indigo-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400">
            Join the Next-Gen AI Recruitment Ecosystem
          </p>
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 p-7 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-100">Create your account</h2>
            <p className="text-xs text-slate-400">Get started with AI matching & ATS screening</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {/* Account Role Selector */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase text-[10px] tracking-wider">
                Select Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('CANDIDATE')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    role === 'CANDIDATE'
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Candidate
                </button>

                <button
                  type="button"
                  onClick={() => setRole('RECRUITER')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    role === 'RECRUITER'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Recruiter / Admin
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase text-[10px] tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

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
                Password (8–20 chars)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={8}
                  maxLength={20}
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
              Complete Registration
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
