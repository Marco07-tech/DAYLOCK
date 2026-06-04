import { cn } from '../../lib/utils';

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
    'rounded-xl font-weight-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container active:scale-[0.98]',
    secondary: 'bg-transparent border border-outline-variant text-on-surface hover:bg-surface-container',
    danger: 'bg-transparent border border-error text-error hover:bg-error-container',
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
      {isLoading && (
        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
      )}
      {children}
    </button>
  );
}
