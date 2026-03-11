import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UPI_ID   = import.meta.env.VITE_UPI_ID   || 'mytowntutor@ybl';
const UPI_NAME = import.meta.env.VITE_UPI_NAME  || 'MyTownTutor';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [error, setError]         = useState('');

  const AMOUNT = 99;

  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${AMOUNT}&cu=INR`;
  const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`;

  const features = [
    'Tutors are required to pay a subscription fee of INR 99 for a period of six (6) months to list their profile on the Platform.',
    'This subscription fee:',
    '•    Is solely a listing fee.',
    '•    Does not guarantee student leads.',
    '•    Does not guarantee bookings.',
    '•    Does not guarantee visibility ranking.',
    '•    Does not constitute payment for tutoring services.',
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(UPI_ID).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleIPaid = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/mentors/mark-paid', { amount: AMOUNT });
      setShowModal(false);
      navigate('/mentor-dashboard');
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-primary flex items-center gap-1">
        ← Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl mx-auto mb-4">
          🎓
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Become a Tutor</h1>
        <p className="text-gray-500 text-sm">Registration fee to get your profile live for 6 months</p>
      </div>

      {/* Price card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-baseline justify-center gap-1 mb-6">
          <span className="text-gray-400 text-lg">₹</span>
          <span className="text-5xl font-bold text-gray-900">{AMOUNT}</span>
          <span className="text-gray-400 text-sm"></span>
        </div>

        <ul className="space-y-3 mb-6">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
              <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-primary text-white py-3 rounded-full font-bold text-sm hover:bg-primary-dark transition-colors"
        >
          Pay ₹{AMOUNT} via UPI
        </button>
        <p className="text-center text-gray-400 text-xs mt-3">Pay securely via any UPI app</p>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
        <h3 className="font-bold text-gray-900 text-sm">Frequently Asked Questions</h3>
        {[

          ['Attachment your email address to the payment?', 'Please ensure you use the same email for payment and registration.'],
          ['Is the fee refundable?', 'No, the registration fee is non-refundable once paid.'],
          ['When will my profile go live?', 'Your profile will be reviewed within 24-48 hours after payment.'],
          ['Can I edit my profile later?', 'Yes, you can update your profile anytime from your dashboard.']
        ].map(([q, a]) => (
          <div key={q}>
            <p className="text-sm font-medium text-gray-800">{q}</p>
            <p className="text-sm text-gray-500 mt-0.5">{a}</p>
          </div>
        ))}
      </div>

      {/* UPI Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            {/* Modal header */}
            <div className="bg-primary px-6 py-4 flex items-center justify-between">
              <span className="text-white font-bold text-base">Complete Payment</span>
              <button
                onClick={() => { setShowModal(false); setError(''); }}
                className="text-white/80 hover:text-white text-2xl leading-none font-light"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Amount badge */}
              <div className="bg-green-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-gray-500 text-sm">Amount to pay</span>
                <span className="text-primary text-2xl font-extrabold">₹{AMOUNT}</span>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-3">Scan with any UPI app (PhonePe, GPay, Paytm…)</p>
                <div className="inline-block p-2 border-2 border-gray-200 rounded-xl">
                  <img
                    src="/QR.jpeg"
                    width={180}
                    height={180}
                    alt="UPI QR Code"
                    className="rounded-md block"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-xs whitespace-nowrap">or pay using UPI ID</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* UPI ID row */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">UPI ID</p>
                  <p className="font-bold text-gray-900 text-sm">{UPI_ID}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <p className="text-center text-gray-400 text-xs">
                After paying, click <strong className="text-gray-600">I've Paid</strong> below.
              </p>

              {error && <div className="error-message">{error}</div>}

              {/* I've Paid button */}
              <button
                onClick={handleIPaid}
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-full font-bold text-sm hover:bg-primary-dark disabled:opacity-50 transition-colors"
              >
                {loading ? 'Please wait…' : "✓ I've Paid"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
