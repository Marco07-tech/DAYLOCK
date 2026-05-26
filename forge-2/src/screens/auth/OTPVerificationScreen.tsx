import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { AuthLayout } from '@/layouts/AuthLayout';
import { OTPInput } from '@/components/forms/OTPInput';
import { FormButton } from '@/components/forms/FormButton';
import { Alert } from '@/components/forms/Alert';

interface OTPVerificationScreenProps {
  email?: string;
}

export function OTPVerificationScreen({ email = 'user@example.com' }: OTPVerificationScreenProps) {
  const navigate = useNavigate();
  const { verifyOTP, isLoading, error, clearError } = useAuthStore();
  
  const [code, setCode] = useState('');
  const [otpError, setOtpError] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setOtpError(true);
      return;
    }

    try {
      await verifyOTP(email, code);
      navigate('/dashboard');
    } catch {
      setOtpError(true);
    }
  };

  return (
    <AuthLayout
      title="Verify your code"
      subtitle="We've sent a 6-digit code to your email"
      showBackButton
      backLink="/signup"
    >
      {error && (
        <Alert message={error} type="error" onClose={clearError} />
      )}

      <div className="space-y-6">
        <p className="text-sm text-muted">
          Enter the code sent to <span className="font-semibold text-foreground">{email}</span>
        </p>

        <OTPInput
          value={code}
          onChange={setCode}
          onComplete={handleVerify}
          error={otpError}
        />

        <FormButton
          onClick={handleVerify}
          loading={isLoading}
          className="w-full"
          size="lg"
          disabled={code.length !== 6}
        >
          Verify code
        </FormButton>

        <div className="space-y-2 text-center text-sm">
          <p className="text-muted">
            Didn't receive the code?{' '}
            <button className="text-primary hover:text-primary/80 transition-colors">
              Resend
            </button>
          </p>
          <p className="text-xs text-muted">
            Code expires in 10 minutes
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
