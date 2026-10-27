import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import SEO from '../../seo/SEO';
import PublicLayout from '../../components/layout/PublicLayout';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, User, Phone, KeyRound, CheckCircle2 } from 'lucide-react';

export default function AdminRegister() {
  const navigate = useNavigate();
  const { registerAdmin } = useAuth();
  const { showToast } = useNotification();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    adminSecretKey: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // In-card error feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const validateForm = () => {
    const errors = {};
    const trimmedName = form.fullName.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedSecret = form.adminSecretKey.trim();

    if (!trimmedName) {
      errors.fullName = 'Full administrator name is required.';
    }

    if (!trimmedEmail) {
      errors.email = 'Corporate administrator email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!form.password) {
      errors.password = 'Password is required.';
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!trimmedPhone) {
      errors.phone = 'Contact phone number is required.';
    }

    if (!trimmedSecret) {
      errors.adminSecretKey = 'Master Admin Security Passcode is required.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Please correct all required administrator fields.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});

    try {
      await registerAdmin({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        adminSecretKey: form.adminSecretKey.trim(),
      });

      showToast(`Admin account registered successfully! 6-digit OTP code dispatched to ${form.email}.`, 'success');
      navigate('/verify-otp', {
        state: {
          email: form.email.trim(),
          isAdmin: true,
        },
      });
    } catch (err) {
      const msg = err.message || 'Administrator registration failed.';
      setErrorMessage(msg);

      if (msg.includes('Passcode') || msg.includes('Unauthorized') || msg.includes('passcode')) {
        setFieldErrors({ adminSecretKey: 'Invalid Admin Security Passcode. Access denied.' });
      } else if (msg.includes('already exists') || msg.includes('Conflict')) {
        setFieldErrors({ email: 'An account with this administrator email already exists.' });
      }

      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <SEO title="System Administrator Registration | DriveElite Portal" noindex={true} />
      <div className="min-h-[85vh] bg-white flex items-center justify-center p-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-600/30">
              <Shield className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
              Executive Onboarding
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Administrator Account</h1>
            <p className="text-xs text-slate-500 font-medium">
              Restricted portal for authorized DriveElite system managers & executive fleet supervisors.
            </p>
          </div>

          {/* Inline Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 rounded-2xl border text-xs bg-rose-50 border-rose-200 text-rose-900 transition-all"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-sm">Registration Error</div>
                  <p className="leading-relaxed opacity-95">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Administrator Full Name *</label>
                {fieldErrors.fullName && (
                  <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.fullName}
                  </span>
                )}
              </div>
              <div className="relative">
                <User
                  className={`w-4 h-4 absolute left-3.5 top-3.5 transition-colors ${
                    fieldErrors.fullName ? 'text-rose-500' : 'text-slate-400'
                  }`}
                />
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={form.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-semibold transition-all outline-none border ${
                    fieldErrors.fullName
                      ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500'
                  }`}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Work Email Address *</label>
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
                  placeholder="admin@driveelite.com"
                  autoComplete="username"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-semibold transition-all outline-none border ${
                    fieldErrors.email
                      ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500'
                  }`}
                />
              </div>
            </div>

            {/* Phone Number & Password (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Contact Phone *</label>
                  {fieldErrors.phone && (
                    <span className="text-[11px] font-semibold text-rose-600">
                      {fieldErrors.phone}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone
                    className={`w-4 h-4 absolute left-3.5 top-3.5 transition-colors ${
                      fieldErrors.phone ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  />
                  <input
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-semibold transition-all outline-none border ${
                      fieldErrors.phone
                        ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password *</label>
                  {fieldErrors.password && (
                    <span className="text-[11px] font-semibold text-rose-600">
                      {fieldErrors.password}
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
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-xs font-semibold transition-all outline-none border ${
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
            </div>

            {/* Master Admin Security Passcode Section */}
            <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-sky-950 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-sky-600" /> Master Admin Passcode *
                </label>
                {fieldErrors.adminSecretKey && (
                  <span className="text-[11px] font-semibold text-rose-600">
                    {fieldErrors.adminSecretKey}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type={showSecretKey ? 'text' : 'password'}
                  placeholder="Enter organization security passcode"
                  value={form.adminSecretKey}
                  onChange={(e) => handleChange('adminSecretKey', e.target.value)}
                  className={`w-full p-2.5 pr-10 bg-white border rounded-xl text-xs font-mono font-bold transition-all outline-none ${
                    fieldErrors.adminSecretKey
                      ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500'
                      : 'border-sky-300 text-sky-950 focus:ring-2 focus:ring-sky-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showSecretKey ? 'Hide passcode' : 'Show passcode'}
                >
                  {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[11px] text-sky-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                Required security key issued to certified organization managers.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-102 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registering Administrator...
                </>
              ) : (
                <>
                  Register System Administrator <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
            <Link to="/admin/login" className="text-sky-600 font-bold hover:underline">
              &larr; Back to Admin Sign In
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
