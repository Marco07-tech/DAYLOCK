import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'rounded-xl font-weight-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-accent-lime text-black hover:bg-accent-lime-dark',
    secondary: 'bg-transparent border border-bg-border text-white hover:bg-bg-card',
    danger: 'bg-transparent border border-status-danger text-status-danger hover:bg-bg-card',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm h-10',
    md: 'px-4 py-2 text-base h-12',
    lg: 'px-6 py-3 text-lg h-14',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 size={20} className="animate-spin" />}
      {children}
    </button>
  );
}

