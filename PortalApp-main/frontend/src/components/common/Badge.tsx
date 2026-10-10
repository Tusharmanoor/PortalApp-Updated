import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  const variantClasses = {
    primary: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    info: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    neutral: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
    outline: 'bg-transparent text-slate-400 border border-slate-700/70',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md tracking-wide ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
