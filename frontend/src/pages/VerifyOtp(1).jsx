import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import SEO from '../seo/SEO';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { KeyRound, ArrowRight, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyOtp } = useAuth();
  const { showToast } = useNotification();

  const queryEmail = searchParams.get('email') || '';
  const initialEmail = location.state?.email || queryEmail || '';

  const [email, setEmail] = useState(initialEmail);
  const [otpCode, setOtpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  // In-card error and success messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // digits only
    setOtpCode(val);
    if (fieldErrors.otpCode) {
      setFieldErrors((prev) => ({ ...prev, otpCode: null }));
    }
    if (errorMessage) setErrorMessage('');
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: null }));
    }
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!email.trim()) errors.email = 'Email address is required.';
    if (!otpCode || otpCode.length !== 6) errors.otpCode = 'Please enter a complete 6-digit OTP code.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Please provide both your registered email and 6-digit verification code.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});

    try {
      const res = await verifyOtp(email.trim(), otpCode.trim());
      showToast('Account verified successfully!', 'success');
      const verifiedRole = res.data?.user?.role?.name || res.data?.user?.role || (location.state?.isAdmin ? 'ADMIN' : 'CUSTOMER');
      if (verifiedRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      const msg = err.message || 'OTP verification failed. Please try again.';
      setErrorMessage(msg);
      setFieldErrors({ otpCode: 'Invalid or expired verification code.' });
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim()) {
      setFieldErrors({ email: 'Please enter your registered email address first.' });
      setErrorMessage('Email address is required to dispatch a new OTP code.');
      return;
    }

    setResending(true);
    setErrorMessage('');
    try {
      await api.post('/auth/resend-otp', { email: email.trim() });
      const msg = `A new 6-digit security code has been sent to ${email.trim()}.`;
      setSuccessNotice(msg);
      showToast(msg, 'success');
    } catch (err) {
      const msg = err.message || 'Failed to dispatch new OTP.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <PublicLayout>
      <SEO title="Verify OTP | DriveElite" noindex={true} />
      <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl transition-all">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/30">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verify Your Account</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Enter the 6-digit security OTP code sent to your registered email</p>
          </div>

          {/* Prominent Inline Error Banner */}
          {errorMessage && (
            <div role="alert" className="mb-5 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 text-xs transition-all">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-sm">Verification Error</div>
                  <p className="leading-relaxed opacity-95">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Resend Success Notice */}
          {successNotice && !errorMessage && (
            <div role="status" className="mb-5 p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs transition-all flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Email Address</label>
                {fieldErrors.email && (
                  <span className="text-[11px] font-semibold text-rose-600">{fieldErrors.email}</span>
                )}
              </div>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={handleEmailChange}
                className={`w-full p-2.5 rounded-xl text-xs font-medium outline-none border transition-all ${
                  fieldErrors.email
                    ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">6-Digit Security OTP</label>
                {fieldErrors.otpCode && (
                  <span className="text-[11px] font-semibold text-rose-600">{fieldErrors.otpCode}</span>
                )}
              </div>
              <input
                maxLength={6}
                type="text"
                placeholder="123456"
                value={otpCode}
                onChange={handleOtpChange}
                className={`w-full text-center tracking-[0.5em] text-lg font-mono font-bold p-3 rounded-xl outline-none border transition-all ${
                  fieldErrors.otpCode
                    ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500'
                }`}
              />
              <p className="text-[11px] text-slate-400 text-center mt-1.5">
                Check your Gmail inbox or spam folder for your 6-digit code.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying Security Code...
                </>
              ) : (
                <>
                  Verify OTP & Activate Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-3 text-center">
            <button
              type="button"
              disabled={resending}
              onClick={handleResendOtp}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              {resending ? 'Dispatching New Code...' : "Didn't receive code? Resend OTP via Email"}
            </button>
            <div className="text-xs text-slate-500">
              Already verified?{' '}
              <Link to="/login" className="text-sky-600 font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
