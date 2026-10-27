import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Car, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import SEO from '../seo/SEO';
import PublicLayout from '../components/layout/PublicLayout';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useNotification();

  // Extract redirect target if coming from a protected route or booking stepper
  const getRedirectTarget = () => {
    const search = location.search;
    const redirectIndex = search.indexOf('redirect=');
    if (redirectIndex !== -1) {
      let target = search.substring(redirectIndex + 9);
      try {
        target = decodeURIComponent(target);
      } catch (e) {
        // Fallback to raw string
      }
      if (target.startsWith('/') && !target.startsWith('//')) {
        return target;
      }
    }
    return null;
  };

  const redirectTarget = getRedirectTarget();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // In-card error feedback states
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState(null); // 'not_found' | 'wrong_password' | 'unverified' | 'network' | 'validation' | 'general'
  const [fieldErrors, setFieldErrors] = useState({});

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: null }));
    }
    if (errorMessage && errorType !== 'wrong_password') {
      setErrorMessage('');
      setErrorType(null);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: null }));
    }
    if (errorMessage && errorType !== 'not_found') {
      setErrorMessage('');
      setErrorType(null);
    }
  };

  const validateForm = () => {
    const errors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage('Please correct the highlighted fields before signing in.');
      setErrorType('validation');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setErrorType(null);
    setFieldErrors({});

    try {
      const data = await login(email.trim(), password);
      showToast('Logged in successfully!', 'success');

      if (redirectTarget) {
        navigate(redirectTarget);
      } else if (data.user?.role === 'ADMIN') {
        navigate('/admin');
      } else if (data.user?.role === 'STAFF') {
        navigate('/staff');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setErrorMessage(msg);

      if (msg.includes('No account found')) {
        setErrorType('not_found');
        setFieldErrors({ email: 'No account registered with this email address.' });
      } else if (msg.includes('Incorrect password')) {
        setErrorType('wrong_password');
        setFieldErrors({ password: 'Password does not match.' });
      } else if (msg.includes('Account not verified') || msg.includes('OTP')) {
        setErrorType('unverified');
      } else if (msg.includes('Unable to connect') || msg.includes('Network Error')) {
        setErrorType('network');
      } else {
        setErrorType('general');
      }

      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <SEO title="Account Login | DriveElite" noindex={true} />
      <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl transition-all">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-600/30">
              <Car className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Log in to manage your bookings and rental contracts</p>
          </div>

          {/* Context Banner: Redirect notice */}
          {redirectTarget && (
            <div className="mb-5 p-3.5 bg-sky-50 border border-sky-200/80 rounded-2xl flex items-center gap-3 text-sky-900">
              <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold">Reservation in Progress</p>
                <p className="text-sky-700 text-[11px]">Sign in to complete your vehicle booking seamlessly.</p>
              </div>
            </div>
          )}

          {/* Prominent Inline Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className={`mb-5 p-4 rounded-2xl border text-xs transition-all ${
                errorType === 'unverified'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    errorType === 'unverified' ? 'text-amber-600' : 'text-rose-600'
                  }`}
                />
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-sm">
                    {errorType === 'not_found' && 'Account Not Found'}
                    {errorType === 'wrong_password' && 'Incorrect Password'}
                    {errorType === 'unverified' && 'Verification Required'}
                    {errorType === 'network' && 'Connection Refused / Server Unreachable'}
                    {errorType === 'validation' && 'Incomplete Form'}
                    {errorType === 'general' && 'Authentication Failed'}
                  </div>
                  <p className="leading-relaxed opacity-95">{errorMessage}</p>

                  {errorType === 'not_found' && (
                    <div className="pt-2">
                      <Link
                        to={`/register${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[11px] shadow-sm transition-all"
                      >
                        Create an account with this email &rarr;
                      </Link>
                    </div>
                  )}

                  {errorType === 'unverified' && (
                    <div className="pt-2">
                      <Link
                        to={`/verify-otp${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-[11px] shadow-sm transition-all"
                      >
                        Verify OTP Code Now &rarr;
                      </Link>
                    </div>
                  )}

                  {errorType === 'network' && (
                    <div className="pt-1 text-[11px] text-rose-700 font-medium">
                      Make sure the NestJS backend service is started and running on port 5000.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Email Address</label>
                {fieldErrors.email && (
                  <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail
                  className={`w-4 h-4 absolute left-3.5 top-3.5 transition-colors ${
                    fieldErrors.email ? 'text-rose-500' : 'text-slate-400'
                  }`}
                />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  autoComplete="username"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-medium transition-all outline-none border ${
                    fieldErrors.email
                      ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                {fieldErrors.password && (
                  <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock
                  className={`w-4 h-4 absolute left-3.5 top-3.5 transition-colors ${
                    fieldErrors.password ? 'text-rose-500' : 'text-slate-400'
                  }`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium transition-all outline-none border ${
                    fieldErrors.password
                      ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Action Links */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs">
            <div className="text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link
                to={`/register${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                className="text-sky-600 font-bold hover:underline"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
