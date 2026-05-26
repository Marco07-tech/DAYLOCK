import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AuthLayout } from '@/layouts/AuthLayout';
import { FormInput } from '@/components/forms/FormInput';
import { FormButton } from '@/components/forms/FormButton';
import { Alert } from '@/components/forms/Alert';
import { SocialLogin } from '@/components/forms/SocialLogin';

export function LoginScreen() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch {
      // Error is handled by store
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Redirect will be handled by Supabase OAuth callback
    } catch {
      // Error is handled by store
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your FORGE account"
    >
      {error && (
        <Alert message={error} type="error" onClose={clearError} />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={formErrors.email}
        />

        <FormInput
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={formErrors.password}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
            <span className="text-muted">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <FormButton
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          Sign in
        </FormButton>
      </form>

      <SocialLogin isLoading={isLoading} onGoogleClick={handleGoogleLogin} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted">
            Don't have an account?
          </span>
        </div>
      </div>

      <Link to="/signup">
        <FormButton variant="secondary" className="w-full" size="lg">
          Create account
        </FormButton>
      </Link>
    </AuthLayout>
  );
}
