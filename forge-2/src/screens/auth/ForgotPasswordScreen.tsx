import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AuthLayout } from '@/layouts/AuthLayout';
import { FormInput } from '@/components/forms/FormInput';
import { FormButton } from '@/components/forms/FormButton';
import { Alert } from '@/components/forms/Alert';

interface ForgotPasswordScreenProps {
  onNext?: () => void;
}

export function ForgotPasswordScreen({ onNext }: ForgotPasswordScreenProps) {
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setFormError('Email is required');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email');
      return;
    }

    try {
      await resetPassword(email);
      setSubmitted(true);
      onNext?.();
    } catch {
      // Error is handled by store
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent you a reset link"
        showBackButton
        backLink="/login"
      >
        <div className="space-y-6">
          <div className="bg-primary/10 rounded-lg p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <p className="text-foreground">
              We've sent a password reset link to
            </p>
            <p className="font-semibold text-primary mt-2">{email}</p>
          </div>

          <p className="text-sm text-muted text-center">
            Click the link in your email to reset your password. The link will expire in 1 hour.
          </p>

          <Link to="/reset-password">
            <FormButton className="w-full" size="lg">
              Reset password
            </FormButton>
          </Link>

          <p className="text-center text-sm text-muted">
            Didn't receive the email?{' '}
            <button
              onClick={() => setSubmitted(false)}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Try again
            </button>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="No problem. We'll help you reset it."
      showBackButton
      backLink="/login"
    >
      {(error || formError) && (
        <Alert
          message={error || formError}
          type="error"
          onClose={formError ? () => setFormError('') : clearError}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={formError}
        />

        <p className="text-sm text-muted">
          Enter the email address associated with your FORGE account.
        </p>

        <FormButton
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          Send reset link
        </FormButton>
      </form>

      <div className="text-center">
        <Link
          to="/login"
          className="text-primary hover:text-primary/80 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
