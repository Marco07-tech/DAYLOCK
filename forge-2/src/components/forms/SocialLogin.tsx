import { Chrome } from 'lucide-react';
import { motion } from 'framer-motion';

interface SocialLoginProps {
  isLoading?: boolean;
  onGoogleClick: () => void;
}

export function SocialLogin({ isLoading = false, onGoogleClick }: SocialLoginProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-border)]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[var(--color-background)] text-[var(--color-muted)]">
            Or continue with
          </span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGoogleClick}
        disabled={isLoading}
        type="button"
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-foreground)] font-medium"
      >
        <Chrome className="w-4 h-4" />
        Google
      </motion.button>
    </div>
  );
}
