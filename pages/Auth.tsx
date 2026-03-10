import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Modal } from '../components/Modal';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { UserRole } from '../types';

interface AuthProps {
  mode: 'login' | 'register';
}

interface FloatingInputProps {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  maxLength?: number;
  children?: React.ReactNode;
}

// Floating label input â€” Tailwind peer pattern.
// placeholder=" " (single space) keeps :placeholder-shown active on empty fields,
// which drives the label float transition via peer-placeholder-shown / peer-focus.
const FloatingInput: React.FC<FloatingInputProps> = ({
  id, name, type, label, value, onChange, autoComplete, maxLength, children,
}) => (
  <div className="relative">
    <input
      id={id}
      name={name}
      type={type}
      autoComplete={autoComplete}
      required
      maxLength={maxLength}
      placeholder=" "
      value={value}
      onChange={onChange}
      className="auth-input peer block w-full rounded-xl border border-white/25 bg-white/10 px-4 pt-6 pb-2 text-sm text-white placeholder-transparent backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-rose-400/60 focus:border-rose-400/60 transition-colors"
    />
    <label
      htmlFor={id}
      className="pointer-events-none absolute left-4 top-4 text-sm text-white/75 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/75 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-white peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-white"
    >
      {label}
    </label>
    {children}
  </div>
);

const Auth: React.FC<AuthProps> = ({ mode }) => {
  const { login, register, verifyOtp, resendOtp, loginWithGoogle, user } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Reset all form state when switching between login and register
  useEffect(() => {
    setName('');
    setEmail('');
    setPhoneNumber('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setStep('form');
    setOtp('');
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic sanitization (trimming)
    const cleanEmail = email.trim();
    const cleanName = name.trim();
    const cleanPhone = phoneNumber.trim();
    const cleanPassword = password; // Passwords shouldn't be trimmed usually, but for safety in this context

    // Email Validation Regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g., user@example.com)');
      return;
    }

    // Philippine Mobile Number Validation Regex (register only)
    if (mode === 'register') {
      const phoneRegex = /^09\d{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setError('Please enter a valid 11 digit mobile number starting with 09.');
        return;
      }
    }

    // Injection prevention: Check for dangerous characters in text fields (basic check)
    // React escapes by default, but we can explicitly disallow certain patterns if requested
    const dangerousPattern = /['"<>;]/;
    if (dangerousPattern.test(cleanEmail) || (mode === 'register' && (dangerousPattern.test(cleanName) || dangerousPattern.test(cleanPhone)))) {
      setError('Invalid characters detected. Please avoid using quotes or special symbols.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (mode === 'login') {
        const success = await login(cleanEmail, cleanPassword);
        if (success) {
          setShowSuccessModal(true);
        } else {
          setError('Invalid email or password. Please try again.');
        }
      } else {
        if (!cleanName) { setError('Name is required'); return; }
        if (cleanName.length > 25) { setError('Name must be 25 characters or less'); return; }
        if (!cleanPhone) { setError('Phone number is required'); return; }
        if (cleanPassword !== confirmPassword) { setError('Passwords do not match'); return; }

        await register(cleanName, cleanEmail, cleanPassword, cleanPhone);
        setError('');
        setStep('otp');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (mode === 'login') {
      navigate(user?.role === UserRole.ADMIN ? '/admin' : redirectTo);
    } else {
      navigate('/login');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) { setError('Please enter the verification code.'); return; }
    setError('');
    setIsVerifying(true);
    try {
      await verifyOtp(email.trim(), otp);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await resendOtp(email.trim());
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  // Tick resend cooldown down every second
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-stone-900">
      {/* Full-bleed bakery background */}
      <img
        src="https://wallpaperaccess.com/full/1892454.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Warm dark overlay */}
      <div className="absolute inset-0 bg-stone-900/60" />

      {/* Minimal top bar â€” back link only, no brand text */}
      <header className="relative z-10 px-4 sm:px-6 pt-5 pb-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to store
        </Link>
      </header>

      {/* Centered glass card */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <Modal
          isOpen={showSuccessModal}
          onClose={handleModalClose}
          type="success"
          title={mode === 'login' ? 'Login Successful' : 'Email Verified'}
          message={
            mode === 'login'
              ? 'Welcome back! You have successfully logged in.'
              : 'Your email has been verified. You can now sign in to your account.'
          }
          primaryAction={{ label: 'Continue', onClick: handleModalClose }}
        />

        {/*
          key={mode} causes React to destroy and recreate this DOM node whenever
          the mode changes â€” that remount fires the CSS @keyframes authFadeIn animation
          defined in index.html, giving a clean fade+lift transition on every switch.
        */}
        <div
          key={mode}
          style={{ animation: 'authFadeIn 0.35s ease both' }}
          className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-2xl p-8 sm:p-10"
        >
          {/* Heading */}
          {step === 'otp' ? (
            <div>
              <button
                type="button"
                onClick={() => { setStep('form'); setError(''); setOtp(''); }}
                className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm font-medium transition-colors mb-6"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <div className="mb-7 text-center">
                <h1 className="text-3xl font-extrabold text-white drop-shadow">Verify your email</h1>
                <p className="mt-2 text-sm text-white/55">
                  Enter the 6-digit code sent to{' '}
                  <span className="text-white font-medium">{email}</span>
                </p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="00000000"
                  autoFocus
                  autoComplete="one-time-code"
                  aria-label="Verification code"
                  className="auth-input block w-full rounded-xl border border-white/25 bg-white/10 px-4 py-4 text-center text-2xl font-mono tracking-[0.4em] text-white placeholder-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-rose-400/60 focus:border-rose-400/60 transition-colors"
                />
                {error && (
                  <p role="alert" className="text-center text-sm font-medium text-rose-300 bg-rose-900/30 rounded-xl px-4 py-2.5">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  disabled={isVerifying || otp.length < 6}
                  onClick={handleVerifyOtp}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 text-white font-semibold py-3 text-sm transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  {isVerifying ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying...
                    </>
                  ) : 'Verify email'}
                </button>
                <p className="text-center text-sm text-white/50 pt-1">
                  Didn&apos;t receive it?{' '}
                  {resendCooldown > 0 ? (
                    <span className="text-white/35">Resend in {resendCooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      disabled={isResending}
                      onClick={handleResendOtp}
                      className="font-semibold text-rose-300 hover:text-rose-200 transition-colors underline underline-offset-2 disabled:opacity-50"
                    >
                      {isResending ? 'Sending...' : 'Resend code'}
                    </button>
                  )}
                </p>
              </div>
            </div>
          ) : (
          <>
          {/* Heading */}
          <div className="mb-7 text-center">
            <h1 className="text-3xl font-extrabold text-white drop-shadow">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="mt-2 text-sm text-white/55">
              {mode === 'login'
                ? 'Your sweet orders are waiting'
                : 'Every great order starts here'}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Name â€” register only */}
            {mode === 'register' && (
              <FloatingInput
                id="name"
                name="name"
                type="text"
                label="Full name (max 25 chars)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={25}
                autoComplete="name"
              />
            )}

            {/* Email */}
            <FloatingInput
              id="email-address"
              name="email"
              type="text"
              label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            {/* Phone â€” register only */}
            {mode === 'register' && (
              <FloatingInput
                id="phone-number"
                name="phone"
                type="tel"
                label="Phone number (09XXXXXXXXX)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoComplete="tel"
              />
            )}

            {/* Password */}
            <FloatingInput
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            >
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </FloatingInput>

            {/* Forgot password — login only */}
            {mode === 'login' && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-white/50 hover:text-rose-300 transition-colors underline underline-offset-2"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Confirm Password — register only */}
            {mode === 'register' && (
              <FloatingInput
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              >
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </FloatingInput>
            )}

            {/* Error message */}
            {error && (
              <p role="alert" className="text-center text-sm font-medium text-rose-300 bg-rose-900/30 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 text-white font-semibold py-3 text-sm transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign in' : 'Create account'
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-white/15" />
              <span className="text-xs text-white/35 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-white/15" />
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={loginWithGoogle}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-sm font-medium py-3 transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Switch mode */}
            <p className="text-center text-sm text-white/50 pt-1">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="font-semibold text-rose-300 hover:text-rose-200 transition-colors underline underline-offset-2"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-semibold text-rose-300 hover:text-rose-200 transition-colors underline underline-offset-2"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </form>
          </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Auth;
