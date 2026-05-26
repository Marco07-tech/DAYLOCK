import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backLink?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showBackButton,
  backLink = '/login',
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8">
          {showBackButton && (
            <Link
              to={backLink}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          )}
          
          {/* Logo/Branding */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              FORGE
              <span className="text-primary"> 2.0</span>
            </h1>
            <p className="text-sm text-muted mt-1">Fitness Tracker</p>
          </div>

          {/* Page Title */}
          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted mt-2">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-xs text-muted">
            © 2026 FORGE Fitness. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
