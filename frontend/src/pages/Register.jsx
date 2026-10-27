import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../seo/SEO';
import PublicLayout from '../components/layout/PublicLayout';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Car, User, Mail, Lock, Phone, CreditCard, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryEmail = searchParams.get('email') || '';

  const { register } = useAuth();
  const { showToast } = useNotification();

  const [form, setForm] = useState({
    fullName: '',
    email: queryEmail,
    password: '',
    phone: '',
    cnicPassport: '',
    licenseNumber: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // In-card error states
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

  const validate = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!form.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!form.password) {
      errors.password = 'Password is required.';
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (!form.phone.trim()) errors.phone = 'Phone number is required.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Please fill in all required fields accurately.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});

    try {
      await register({ ...form, email: form.email.trim() });
      showToast(`Registration successful! A security OTP code has been sent to ${form.email}.`, 'success');
      navigate('/verify-otp', { state: { email: form.email.trim() } });
    } catch (err) {
      const msg = err.message || 'Registration failed.';
      setErrorMessage(msg);
      if (msg.includes('already exists') || msg.includes('Conflict')) {
        setFieldErrors({ email: 'An account with this email is already registered.' });
      }
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <SEO title="Create Customer Account | DriveElite" noindex={true} />
      <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl transition-all">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-600/30">
              <Car className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Customer Account</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Register to start reserving vehicles & signing rental agreements</p>
          </div>

          {/* Prominent Inline Error Banner */}
          {errorMessage && (
            <div role="alert" className="mb-5 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 text-xs transition-all">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-sm">
                    {errorMessage.includes('already exists') ? 'Account Already Exists' : 'Registration Incomplete'}
                  </div>
                  <p className="leading-relaxed opacity-95">{errorMessage}</p>
                  {errorMessage.includes('already exists') && (
                    <div className="pt-2">
                      <Link
                        to={`/login?email=${encodeURIComponent(form.email)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[11px] shadow-sm transition-all"
                      >
                        Sign In with this Email &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs font-medium outline-none border transition-all ${
                    fieldErrors.fullName
                      ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500'
                  }`}
                />
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{fieldErrors.fullName}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs font-medium outline-none border transition-all ${
                    fieldErrors.email
                      ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`w-full p-2.5 pr-9 rounded-xl text-xs font-medium outline-none border transition-all ${
                      fieldErrors.password
                        ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{fieldErrors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  placeholder="+92 300 1234567"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs font-medium outline-none border transition-all ${
                    fieldErrors.phone
                      ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500'
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CNIC / Passport Number</label>
                <input
                  type="text"
                  placeholder="35201-XXXXXXXX-X"
                  value={form.cnicPassport}
                  onChange={(e) => handleChange('cnicPassport', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Driving License Number</label>
                <input
                  type="text"
                  placeholder="DL-987654321"
                  value={form.licenseNumber}
                  onChange={(e) => handleChange('licenseNumber', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Complete Registration <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to={`/login${form.email ? `?email=${encodeURIComponent(form.email)}` : ''}`} className="text-sky-600 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
