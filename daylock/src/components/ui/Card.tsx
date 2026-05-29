import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
}

export function Card({ children, glow = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-bg-card border border-bg-border rounded-2xl p-4',
        glow && 'shadow-[0_0_0_1px_rgba(168,255,62,0.2)] border-bg-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
