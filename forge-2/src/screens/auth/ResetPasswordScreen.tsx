import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AuthLayout } from '@/layouts/AuthLayout';
import { FormInput } from '@/components/forms/FormInput';
import { FormButton } from '@/components/forms/FormButton';
import { Alert } from '@/components/forms/Alert';

export function ResetPasswordScreen() {
  const navigate = useNavigate();
  const { isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Simulate password reset
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigate('/login', { state: { message: 'Password reset successfully' } });
    } catch {
      // Error is handled by store
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your new password"
      showBackButton
      backLink="/forgot-password"
    >
      {error && (
        <Alert message={error} type="error" onClose={clearError} />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="New Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={formErrors.password}
        />

        <FormInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={formErrors.confirmPassword}
        />

        <div className="bg-primary/10 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Password requirements:</span>
          </p>
          <ul className="text-sm text-muted list-disc list-inside mt-2 space-y-1">
            <li>At least 8 characters long</li>
            <li>Mix of uppercase and lowercase</li>
            <li>Include numbers and symbols</li>
          </ul>
        </div>

        <FormButton
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          Reset password
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
