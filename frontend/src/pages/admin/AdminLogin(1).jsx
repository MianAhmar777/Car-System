import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import SEO from '../../seo/SEO';
import PublicLayout from '../../components/layout/PublicLayout';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useNotification();

  const [email, setEmail] = useState('admin@carrental.com');
  const [password, setPassword] = useState('AdminPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // In-card error feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState(null); // 'not_found' | 'wrong_password' | 'unauthorized_role' | 'network' | 'validation' | 'general'
  const [fieldErrors, setFieldErrors] = useState({});

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
    if (errorMessage && errorType !== 'wrong_password') {
      setErrorMessage('');
      setErrorType(null);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
    if (errorMessage && errorType !== 'not_found') {
      setErrorMessage('');
      setErrorType(null);
    }
  };

  const validateForm = () => {
    const errors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Admin email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Admin password is required.';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage('Please provide valid administrator credentials.');
      setErrorType('validation');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setErrorType(null);
    setFieldErrors({});

    try {
      const data = await login(email.trim(), password);
      if (data.user?.role === 'ADMIN') {
        showToast('Admin authentication successful! Access granted.', 'success');
        navigate('/admin');
      } else {
        const roleMsg = `Access Denied: Account is registered as ${data.user?.role || 'CUSTOMER'}, not ADMIN. System Administrator privileges are required.`;
        setErrorMessage(roleMsg);
        setErrorType('unauthorized_role');
        showToast(roleMsg, 'error');
      }
    } catch (err) {
      const msg = err.message || 'Admin login failed. Please verify credentials.';
      setErrorMessage(msg);

      if (msg.includes('No account found')) {
        setErrorType('not_found');
        setFieldErrors({ email: 'No administrator account found with this email.' });
      } else if (msg.includes('Incorrect password')) {
        setErrorType('wrong_password');
        setFieldErrors({ password: 'Password does not match.' });
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
      <SEO title="Admin Portal Login | DriveElite" noindex={true} />
      <div className="min-h-[80vh] bg-white flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-600/30">
              <Shield className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
              Executive Management
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Admin Portal</h1>
            <p className="text-xs text-slate-500 font-medium">Log in with Administrator credentials to access fleet management & contracts</p>
          </div>

          {/* Prominent Inline Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className={`p-4 rounded-2xl border text-xs transition-all ${
                errorType === 'unauthorized_role'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {errorType === 'unauthorized_role' ? (
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-sm">
                    {errorType === 'unauthorized_role' && 'Insufficient Privileges'}
                    {errorType === 'not_found' && 'Admin Account Not Found'}
                    {errorType === 'wrong_password' && 'Invalid Password'}
                    {errorType === 'network' && 'Backend Server Offline'}
                    {errorType === 'validation' && 'Missing Credentials'}
                    {errorType === 'general' && 'Authentication Failed'}
                  </div>
                  <p className="leading-relaxed opacity-95">{errorMessage}</p>

                  {errorType === 'unauthorized_role' && (
                    <div className="pt-2">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-[11px] shadow-sm transition-all"
                      >
                        Switch to Customer Sign In &rarr;
                      </Link>
                    </div>
                  )}

                  {errorType === 'not_found' && (
                    <div className="pt-2">
                      <Link
                        to="/admin/register"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[11px] shadow-sm transition-all"
                      >
                        Register Admin Account &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Admin Email Address</label>
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
                  placeholder="admin@carrental.com"
                  autoComplete="username"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-semibold transition-all outline-none border ${
                    fieldErrors.email
                      ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Admin Password</label>
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
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-semibold transition-all outline-none border ${
                    fieldErrors.password
                      ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500'
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
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-102 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating Admin...
                </>
              ) : (
                <>
                  Sign In to Admin Portal <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
            <Link to="/admin/register" className="text-sky-600 font-bold hover:underline">
              Register Admin Account
            </Link>
            <Link to="/login" className="text-slate-500 hover:text-slate-900">
              Customer Sign In
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
