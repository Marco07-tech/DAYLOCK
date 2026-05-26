import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AuthLayout } from '@/layouts/AuthLayout';
import { OTPInput } from '@/components/forms/OTPInput';
import { FormButton } from '@/components/forms/FormButton';
import { Alert } from '@/components/forms/Alert';

interface EmailVerificationScreenProps {
  email?: string;
}

export function EmailVerificationScreen({ email = 'user@example.com' }: EmailVerificationScreenProps) {
  const navigate = useNavigate();
  const { verifyEmail, isLoading, error, clearError } = useAuthStore();
  
  const [code, setCode] = useState('');
  const [verifyError, setVerifyError] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setVerifyError(true);
      return;
    }

    try {
      await verifyEmail(email, code);
      navigate('/dashboard');
    } catch {
      setVerifyError(true);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Confirm your email address to complete signup"
      showBackButton
      backLink="/signup"
    >
      {error && (
        <Alert message={error} type="error" onClose={clearError} />
      )}

      <div className="space-y-6">
        <div className="bg-primary/10 rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <p className="text-foreground">
            We've sent a verification code to
          </p>
          <p className="font-semibold text-primary mt-2">{email}</p>
        </div>

        <div>
          <p className="text-sm text-muted mb-4">
            Enter the 6-digit code below:
          </p>
          <OTPInput
            value={code}
            onChange={setCode}
            onComplete={handleVerify}
            error={verifyError}
          />
        </div>

        <FormButton
          onClick={handleVerify}
          loading={isLoading}
          className="w-full"
          size="lg"
          disabled={code.length !== 6}
        >
          Verify email
        </FormButton>

        <div className="space-y-2 text-center text-sm">
          <p className="text-muted">
            Didn't receive the code?{' '}
            <button className="text-primary hover:text-primary/80 transition-colors">
              Resend
            </button>
          </p>
          <p className="text-xs text-muted">
            Code expires in 15 minutes
          </p>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/signup"
          className="text-primary hover:text-primary/80 transition-colors"
        >
          Back to sign up
        </Link>
      </div>
    </AuthLayout>
  );
}
