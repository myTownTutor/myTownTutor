import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const VerifyEmail = () => {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';
  const role = location.state?.role || null;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  const inputs = useRef([]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate('/signup');
  }, [email, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer === 0) return;
    const t = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last char
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter the 6-digit OTP'); return; }

    setLoading(true);
    try {
      const user = await verifyEmail(email, code);
      if (user.role === 'mentor') navigate('/mentor-profile-setup');
      else if (user.role === 'student') navigate('/student-dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResendLoading(true);
    try {
      await api.post('/auth/resend-otp', { email });
      setSuccess('New OTP sent to your email');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-4 sm:py-8 px-2 sm:px-0">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
            <p className="text-gray-500 text-sm mt-1">
              We sent a 6-digit code to
            </p>
            <p className="font-medium text-gray-800 text-sm mt-0.5">{email}</p>
          </div>

          {error && <div className="error-message mb-4">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* OTP boxes */}
            <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-green-100 transition"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-full font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {loading ? 'Verifying…' : 'Verify Email'}
            </button>
          </form>

          <div className="text-center mt-4">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in <span className="font-medium text-gray-700">{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-sm text-primary font-medium hover:underline disabled:opacity-60"
              >
                {resendLoading ? 'Sending…' : 'Resend code'}
              </button>
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Wrong email?{' '}
            <a href="/signup" className="text-primary font-medium hover:underline">Sign up again</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
