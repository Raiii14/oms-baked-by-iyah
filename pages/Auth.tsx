import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Modal } from '../components/Modal';
import { Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';

interface AuthProps {
  mode: 'login' | 'register';
}

const Auth: React.FC<AuthProps> = ({ mode }) => {
  const { login, register, user } = useStore();
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
      const phoneRegex = /^09\d{9}$/
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

    if (mode === 'login') {
      const success = await login(cleanEmail, cleanPassword);
      if (success) {
        setShowSuccessModal(true);
      } else {
        setError('Invalid credentials');
      }
      
    } else {
      if (!cleanName) { setError('Name is required'); return; }
      if (cleanName.length > 25) { setError('Name must be 25 characters or less'); return; }
      if (!cleanPhone) { setError('Phone number is required'); return; }
      if (cleanPassword !== confirmPassword) { setError('Passwords do not match'); return; }
      
      await register(cleanName, cleanEmail, cleanPassword, cleanPhone);
      setShowSuccessModal(true);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (mode === 'login') {
      navigate(user?.role === UserRole.ADMIN ? '/admin' : redirectTo);
    } else {
      navigate(redirectTo);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Modal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        type="success"
        title={mode === 'login' ? 'Login Successful' : 'Registration Successful'}
        message={mode === 'login' ? 'Welcome back! You have successfully logged in.' : 'Your account has been created successfully. Welcome to Baked by Iyah!'}
        primaryAction={{
          label: 'Continue',
          onClick: handleModalClose
        }}
      />

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-stone-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-stone-600">
            {mode === 'login' ? 'Sign in to access your orders' : 'Join Baked by Iyah today'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  maxLength={25}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-stone-300 placeholder-stone-500 text-stone-900 rounded-t-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name (Max 25 chars)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="text" // Changed from email to text to allow manual validation override for demo if needed, but keeping regex check
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-3 border border-stone-300 placeholder-stone-500 text-stone-900 ${mode === 'login' ? 'rounded-t-md' : ''} focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {mode === 'register' && (
              <div>
                <label htmlFor="phone-number" className="sr-only">Phone Number</label>
                <input
                  id="phone-number"
                  name="phone"
                  type="tel"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-stone-300 placeholder-stone-500 text-stone-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                  placeholder="Phone Number (e.g., 09123456789)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            )}
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-3 border border-stone-300 placeholder-stone-500 text-stone-900 ${mode === 'login' ? 'rounded-b-md' : ''} focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 z-20 text-stone-500 hover:text-stone-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {mode === 'register' && (
              <div className="relative">
                <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-stone-300 placeholder-stone-500 text-stone-900 rounded-b-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 z-20 text-stone-500 hover:text-stone-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
            >
              {mode === 'login' ? 'Sign in' : 'Register'}
            </button>
          </div>
          
          {/* Demo Credentials Helper */}
          {mode === 'login' && (
            <div className="bg-stone-50 p-3 rounded-md border border-stone-200 text-xs text-stone-500 text-center">
              <p className="font-semibold text-stone-700">Demo Admin Credentials:</p>
              <p>Email: <span className="font-mono">iyah.admin@bakedbyiyah.com</span></p>
              <p>Password: <span className="font-mono">BakedByIyah@2026</span></p>
            </div>
          )}

          {/* Google Mock */}
          <div>
             <button type="button" onClick={() => alert("Google Login would trigger here")} className="w-full flex justify-center py-3 px-4 border border-stone-300 text-sm font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 transition-colors">
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                </span>
             </button>
          </div>

          <div className="text-center text-sm">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button type="button" onClick={() => navigate('/register')} className="font-medium text-rose-600 hover:text-rose-500">
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/login')} className="font-medium text-rose-600 hover:text-rose-500">
                  Sign in
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;