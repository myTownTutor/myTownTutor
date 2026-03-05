import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StudentDashboard = () => {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [tutorFound, setTutorFound] = useState(null);   // null | true | false
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    api.get('/students/tutor-found')
      .then(r => setTutorFound(r.data.tutor_found ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setAnswer = async (value) => {
    setSaving(true);
    try {
      const r = await api.post('/students/tutor-found', { tutor_found: value });
      setTutorFound(r.data.tutor_found);
    } catch {}
    finally { setSaving(false); }
  };

  const tips = [
    'Complete your profile to attract better mentors',
    'Browse mentors by expertise and experience',
    'Reach out with a clear, specific question',
    'Be consistent and follow through on advice',
  ];

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount();
      navigate('/');
    } catch {
      setDeleteError('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Welcome */}
      <div className="bg-primary rounded-xl px-6 py-5 text-white" style={{backgroundColor: '#a6a4a4'}}>
        <h1 className="text-xl font-bold">Welcome back, {user?.first_name}! 👋</h1>
        <p className="text-blue-100 text-sm mt-1">Your learning journey continues here.</p>
      </div>

     

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-2">Find a Mentor</h2>
          <p className="text-gray-500 text-sm mb-4">Explore our network of experienced mentors ready to help you.</p>
          <Link to="/browse-mentors" className="inline-block bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors">
            Browse Mentors →
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-1">Did you find your ideal tutor?</h2>
          <p className="text-gray-400 text-xs mb-4">You can change this anytime.</p>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading…</p>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setAnswer(tutorFound === true ? null : true)}
                disabled={saving}
                className={`flex-1 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  tutorFound === true
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:text-green-600'
                }`}
              >
                ✓ Yes
              </button>
              <button
                onClick={() => setAnswer(tutorFound === false ? null : false)}
                disabled={saving}
                className={`flex-1 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  tutorFound === false
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:text-red-500'
                }`}
              >
                ✗ No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="font-bold text-gray-900 mb-3">💡 Tips for Success</h2>
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-primary font-bold mt-px">✓</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-5">
        <h2 className="font-bold text-red-600 mb-1">Danger Zone</h2>
        <p className="text-gray-500 text-sm mb-4">Once you delete your account, it cannot be recovered by you. Your data will be archived for admin review only.</p>
        <button
          onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); setDeleteError(''); }}
          className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-600 transition-colors"
        >
          Delete My Account
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Account</h3>
            <p className="text-gray-500 text-sm mb-4">
              This action is <span className="font-semibold text-red-500">permanent for you</span>. Your account will be archived.
              Type <span className="font-mono font-bold">DELETE</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            {deleteError && <p className="text-red-500 text-xs mb-3">{deleteError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-full text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className="flex-1 py-2 rounded-full text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting…' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
