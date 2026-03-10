import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Modal } from '../components/Modal';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';

type Step = 'email' | 'otp' | 'newpass';

interface FloatingInputProps {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  children?: React.ReactNode;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  id, name, type, label, value, onChange, onKeyDown, autoComplete, children,
}) => (
  <div className="relative">
    <input
      id={id}
      name={name}
      type={type}
      autoComplete={autoComplete}
      required
      placeholder=" "
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
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

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const ForgotPassword: React.FC = () => {
  const { resetPasswordForEmail, verifyRecoveryOtp, updatePassword, logout } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSendCode = async () => {
    setError('');
    const clean = email.trim();
    if (!emailRegex.test(clean)) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    try {
      await resetPasswordForEmail(clean);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) { setError('Please enter the verification code.'); return; }
    setError('');
    setLoading(true);
    try {
      await verifyRecoveryOtp(email.trim(), otp);
      setStep('newpass');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    setError('');
    if (newPass.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await updatePassword(newPass);
      await logout();
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-stone-900">
      <img
        src="https://wallpaperaccess.com/full/1892454.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-stone-900/60" />

      <header className="relative z-10 px-4 sm:px-6 pt-5 pb-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to store
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <Modal
          isOpen={showSuccess}
          onClose={handleSuccessClose}
          type="success"
          title="Password Changed"
          message="Your password has been updated successfully. Please sign in with your new password."
          primaryAction={{ label: 'Sign In', onClick: handleSuccessClose }}
        />

        <div
          style={{ animation: 'authFadeIn 0.35s ease both' }}
          className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-2xl p-8 sm:p-10"
        >
          {/* ── Step 1: Email ────────────────────────────── */}
          {step === 'email' && (
            <div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm font-medium transition-colors mb-6"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <div className="mb-7 text-center">
                <h1 className="text-3xl font-extrabold text-white drop-shadow">Reset Password</h1>
                <p className="mt-2 text-sm text-white/55">
                  Enter your email and we&apos;ll send you a verification code.
                </p>
              </div>
              <div className="space-y-4">
                <FloatingInput
                  id="forgot-email"
                  name="forgot-email"
                  type="text"
                  label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendCode(); }}
                  autoComplete="email"
                />
                {error && (
                  <p role="alert" className="text-center text-sm font-medium text-rose-300 bg-rose-900/30 rounded-xl px-4 py-2.5">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSendCode}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 text-white font-semibold py-3 text-sm transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  {loading ? <><Spinner /> Sending...</> : 'Send Code'}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: OTP ──────────────────────────────── */}
          {step === 'otp' && (
            <div>
              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); setOtp(''); }}
                className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm font-medium transition-colors mb-6"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <div className="mb-7 text-center">
                <h1 className="text-3xl font-extrabold text-white drop-shadow">Enter Code</h1>
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
                  onKeyDown={(e) => { if (e.key === 'Enter' && otp.length >= 6) handleVerifyOtp(); }}
                  placeholder="000000"
                  autoFocus
                  autoComplete="one-time-code"
                  aria-label="Recovery code"
                  className="auth-input block w-full rounded-xl border border-white/25 bg-white/10 px-4 py-4 text-center text-2xl font-mono tracking-[0.4em] text-white placeholder-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-rose-400/60 focus:border-rose-400/60 transition-colors"
                />
                {error && (
                  <p role="alert" className="text-center text-sm font-medium text-rose-300 bg-rose-900/30 rounded-xl px-4 py-2.5">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  disabled={loading || otp.length < 6}
                  onClick={handleVerifyOtp}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 text-white font-semibold py-3 text-sm transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  {loading ? <><Spinner /> Verifying...</> : 'Verify Code'}
                </button>
                <p className="text-center text-sm text-white/50 pt-1">
                  Didn&apos;t get the code? Check your spam folder.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 3: New password ─────────────────────── */}
          {step === 'newpass' && (
            <div>
              <div className="mb-7 text-center">
                <h1 className="text-3xl font-extrabold text-white drop-shadow">New Password</h1>
                <p className="mt-2 text-sm text-white/55">
                  Choose a new password for your account.
                </p>
              </div>
              <form
                className="space-y-4"
                onSubmit={(e) => { e.preventDefault(); handleSetPassword(); }}
                noValidate
              >
                <FloatingInput
                  id="new-password"
                  name="new-password"
                  type={showNew ? 'text' : 'password'}
                  label="New password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  autoComplete="new-password"
                >
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white transition-colors"
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </FloatingInput>
                <FloatingInput
                  id="confirm-new-password"
                  name="confirm-new-password"
                  type={showConfirm ? 'text' : 'password'}
                  label="Confirm new password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  autoComplete="new-password"
                >
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </FloatingInput>
                {error && (
                  <p role="alert" className="text-center text-sm font-medium text-rose-300 bg-rose-900/30 rounded-xl px-4 py-2.5">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 text-white font-semibold py-3 text-sm transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  {loading ? <><Spinner /> Updating...</> : 'Set New Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
