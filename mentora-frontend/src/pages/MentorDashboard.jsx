import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const statusConfig = {
  approved:        { label: 'Approved', bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700', icon: '✅' },
  pending_approval:{ label: 'Pending Admin Review', bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700', icon: '⏳' },
  pending:         { label: 'Pending Review', bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700', icon: '⏳' },
  pending_payment: { label: 'Payment Required', bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700', icon: '💳' },
  rejected:        { label: 'Profile Rejected', bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-700', icon: '❌' },
};

const MentorDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentFound, setStudentFound] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/mentors/profile')
      .then(r => {
        setProfile(r.data);
        setStudentFound(r.data.student_found ?? null);
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const setAnswer = async (value) => {
    setSaving(true);
    try {
      const r = await api.post('/mentors/student-found', { student_found: value });
      setStudentFound(r.data.student_found);
    } catch {}
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>;

  const status = profile?.approval_status || 'pending';
  const cfg = statusConfig[status] || statusConfig.pending;

  return (
    <div className="space-y-4">
      {/* Welcome */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Mentor Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back, {user?.first_name}!</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Status card */}
      <div className={`rounded-xl border-l-4 ${cfg.bg} ${cfg.border} p-5`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{cfg.icon}</span>
          <span className={`font-bold text-sm ${cfg.text}`}>{cfg.label}</span>
        </div>
        {status === 'pending_payment' && (
          <>
            <p className="text-gray-600 text-sm mb-3">To get your profile reviewed and listed, please complete the one-time registration payment.</p>
            <Link to="/payment" className="inline-block bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors">
              Complete Payment →
            </Link>
          </>
        )}
        {(status === 'pending_approval' || status === 'pending') && <p className="text-gray-600 text-sm">Your profile is under review. We'll notify you once it's approved.</p>}
        {status === 'approved' && <p className="text-gray-600 text-sm">Your profile is live. Students can contact you now.</p>}
        {status === 'rejected' && (
          <>
            <p className="text-gray-600 text-sm">Your profile was not approved.</p>
            {profile?.rejection_reason && (
              <div className="mt-2 bg-red-100 rounded-lg p-3 text-sm text-red-700">
                <span className="font-medium">Reason: </span>{profile.rejection_reason}
              </div>
            )}
            <Link to="/mentor-profile-setup" className="mt-3 inline-block text-primary text-sm font-medium hover:underline">
              Update Profile →
            </Link>
          </>
        )}
      </div>

      {/* Persistent payment reminder (shown whenever payment is still pending) */}
      {status === 'pending_payment' && (
        <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-lg flex-shrink-0">💳</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">Registration payment pending</p>
              <p className="text-xs text-gray-400 mt-0.5">One-time fee · ₹299 · Unlock your public profile</p>
            </div>
          </div>
          <Link
            to="/payment"
            className="flex-shrink-0 bg-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-orange-600 transition-colors whitespace-nowrap"
          >
            Pay Now →
          </Link>
        </div>
      )}

      {/* Profile summary */}
      {profile && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-bold text-gray-900">Profile Overview</h2>
            <Link to="/mentor-profile-setup" className="text-primary text-sm font-medium hover:underline">Edit Profile</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              ['Expertise', profile.expertise],
              ['Experience', profile.experience_years ? `${profile.experience_years}+ years` : null],
              ['City', profile.city],
              ['University', profile.university],
              ['Hourly Rate', profile.hourly_rate ? `₹${profile.hourly_rate}` : null],
              ['Monthly Rate', profile.monthly_rate ? `₹${profile.monthly_rate}` : null],
            ].filter(([_, v]) => v).map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <span className="font-medium text-gray-500 w-28 flex-shrink-0">{label}</span>
                <span className="text-gray-800">{value}</span>
              </div>
            ))}
          </div>
          {profile.bio && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 line-clamp-3">{profile.bio}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions (only when approved) */}
      {status === 'approved' && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-1">Did you find a student for tuition?</h3>
            <p className="text-gray-400 text-xs mb-4">You can change this anytime.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setAnswer(studentFound === true ? null : true)}
                disabled={saving}
                className={`flex-1 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  studentFound === true
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:text-green-600'
                }`}
              >
                ✓ Yes
              </button>
              <button
                onClick={() => setAnswer(studentFound === false ? null : false)}
                disabled={saving}
                className={`flex-1 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  studentFound === false
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:text-red-500'
                }`}
              >
                ✗ No
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-2">🔗 Your Profile</h3>
            <p className="text-gray-500 text-sm mb-4">See how students view your public mentor profile.</p>
            <Link to={`/mentor/${profile?.id || ''}`} className="inline-block bg-gray-50 border border-gray-200 text-gray-700 px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors">
              View Public Profile
            </Link>
          </div>
        </div>
      )}

      {/* Setup CTA if no profile */}
      {!profile?.expertise && (
        <div className="bg-primary-light rounded-xl p-5 flex items-start gap-4">
          <span className="text-3xl">📝</span>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Complete Your Profile</h3>
            <p className="text-gray-600 text-sm mb-3">Add your expertise, experience, and rates to get discovered by students.</p>
            <Link to="/mentor-profile-setup" className="inline-block bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors">
              Set Up Profile →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
