import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AlertProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose?: () => void;
}

export function Alert({ message, type = 'error', onClose }: AlertProps) {
  if (!message) return null;

  const colors = {
    error: 'bg-red-500/10 text-red-500 border-red-500/30',
    success: 'bg-primary/10 text-primary border-primary/30',
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  };

  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    info: AlertCircle,
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border',
        colors[type]
      )}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-xs opacity-70 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
}
