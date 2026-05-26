import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AuthLayout } from '@/layouts/AuthLayout';
import { FormInput } from '@/components/forms/FormInput';
import { FormButton } from '@/components/forms/FormButton';
import { Alert } from '@/components/forms/Alert';
import { SocialLogin } from '@/components/forms/SocialLogin';

export function SignupScreen() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
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
      await signup(formData.email, formData.password, formData.name);
      navigate('/verify-email');
    } catch {
      // Error is handled by store
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
      // Redirect will be handled by Supabase OAuth callback
    } catch {
      // Error is handled by store
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join FORGE and start your fitness journey"
      showBackButton
      backLink="/login"
    >
      {error && (
        <Alert message={error} type="error" onClose={clearError} />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={<User className="w-4 h-4" />}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={formErrors.name}
        />

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

        <FormInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={formErrors.confirmPassword}
        />

        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded accent-primary mt-0.5" />
          <span className="text-muted">
            I agree to the <a href="#" className="text-primary hover:text-primary/80">Terms of Service</a> and{' '}
            <a href="#" className="text-primary hover:text-primary/80">Privacy Policy</a>
          </span>
        </label>

        <FormButton
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          Create account
        </FormButton>
      </form>

      <SocialLogin isLoading={isLoading} onGoogleClick={handleGoogleSignup} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted">
            Already have an account?
          </span>
        </div>
      </div>

      <Link to="/login">
        <FormButton variant="secondary" className="w-full" size="lg">
          Sign in instead
        </FormButton>
      </Link>
    </AuthLayout>
  );
}
