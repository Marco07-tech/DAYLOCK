import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface-container-low rounded-2xl card-shadow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
