import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DetailRow = ({ label, value }) =>
  value ? <div className="flex gap-2"><span className="font-medium text-gray-500 w-36 flex-shrink-0">{label}</span><span className="text-gray-800 break-all">{value}</span></div> : null;

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_mentors: 0, total_students: 0, pending_mentors: 0, approved_mentors: 0, students_found_tutor: 0, mentors_found_student: 0 });
  const [pendingMentors, setPendingMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [rejectReason, setRejectReason] = useState({});
  const [showRejectForm, setShowRejectForm] = useState({});
  const [viewMentor, setViewMentor] = useState(null);
  const [tuitionModal, setTuitionModal] = useState(false);
  const [tuitionList, setTuitionList] = useState([]);
  const [tuitionLoading, setTuitionLoading] = useState(false);
  const [tuitionFilter, setTuitionFilter] = useState('all'); // 'all' | 'yes' | 'no' | 'unanswered'

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/pending-mentors'),
      ]);
      setStats(statsRes.data);
      setPendingMentors(pendingRes.data.mentors || []);
    } catch (e) { setError('Failed to load dashboard data'); }
    finally { setLoading(false); }
  };

  const openTuitionModal = async () => {
    setTuitionModal(true);
    setTuitionLoading(true);
    try {
      const r = await api.get('/admin/mentors/tuition-status');
      setTuitionList(r.data.mentors || []);
    } catch {}
    finally { setTuitionLoading(false); }
  };

  const approve = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.post(`/admin/mentors/${id}/approve`);
      setPendingMentors(prev => prev.filter(m => m.id !== id));
      setStats(prev => ({ ...prev, pending_mentors: prev.pending_mentors - 1, approved_mentors: prev.approved_mentors + 1 }));
    } catch { setError('Failed to approve mentor'); }
    finally { setActionLoading(prev => ({ ...prev, [id]: false })); }
  };

  const reject = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.post(`/admin/mentors/${id}/reject`, { reason: rejectReason[id] || '' });
      setPendingMentors(prev => prev.filter(m => m.id !== id));
      setStats(prev => ({ ...prev, pending_mentors: prev.pending_mentors - 1 }));
    } catch { setError('Failed to reject mentor'); }
    finally { setActionLoading(prev => ({ ...prev, [id]: false })); }
  };

  const statCards = [
    { label: 'Total Mentors', value: stats.total_mentors, color: 'bg-blue-50 text-primary', icon: '👨‍🏫' },
    { label: 'Total Students', value: stats.total_students, color: 'bg-green-50 text-green-700', icon: '🎓' },
    { label: 'Pending Approval', value: stats.pending_mentors, color: 'bg-yellow-50 text-yellow-700', icon: '⏳' },
    { label: 'Approved Mentors', value: stats.approved_mentors, color: 'bg-purple-50 text-purple-700', icon: '✅' },
    { label: 'Students Found Tutor', value: stats.students_found_tutor, color: 'bg-emerald-50 text-emerald-700', icon: '🎯' },
    { label: 'Mentors Found Student', value: stats.mentors_found_student, color: 'bg-teal-50 text-teal-700', icon: '🤝', onClick: openTuitionModal },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Platform overview and management</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin-users" className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">Manage Users</Link>
          <Link to="/admin-contacts" className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors">All Contacts</Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, value, color, icon, onClick }) => (
          <div
            key={label}
            onClick={onClick}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-3 ${
              onClick ? 'cursor-pointer hover:border-teal-400 hover:shadow-md transition-all' : ''
            }`}
          >
            <div className={`w-11 h-11 rounded-full ${color} flex items-center justify-center text-xl flex-shrink-0`}>{icon}</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{loading ? '—' : value}</div>
              <div className="text-gray-500 text-xs">{label}{onClick && <span className="ml-1 text-teal-600">↗</span>}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending approvals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Pending Mentor Approvals</h2>
          {pendingMentors.length > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full">{pendingMentors.length}</span>
          )}
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading…</div>
        ) : pendingMentors.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">No pending approvals 🎉</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingMentors.map(mentor => (
              <div key={mentor.id} className="p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {mentor.first_name.charAt(0)}{mentor.last_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{mentor.first_name} {mentor.last_name}</p>
                  <p className="text-gray-400 text-xs">{mentor.email}</p>
                  {mentor.expertise && <p className="text-primary text-xs mt-0.5">{mentor.expertise}</p>}
                  {mentor.city && <p className="text-gray-400 text-xs">📍 {mentor.city}</p>}

                  {showRejectForm[mentor.id] && (
                    <div className="mt-3 flex gap-2">
                      <input type="text" placeholder="Reason for rejection (optional)"
                        value={rejectReason[mentor.id] || ''}
                        onChange={e => setRejectReason(prev => ({ ...prev, [mentor.id]: e.target.value }))}
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-100" />
                      <button onClick={() => reject(mentor.id)} disabled={actionLoading[mentor.id]}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 disabled:opacity-50">
                        Confirm
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setViewMentor(mentor)} className="text-xs text-primary hover:underline font-medium">View Profile</button>
                  <button onClick={() => approve(mentor.id)} disabled={actionLoading[mentor.id]}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-green-700 disabled:opacity-50">
                    Approve
                  </button>
                  <button onClick={() => setShowRejectForm(prev => ({ ...prev, [mentor.id]: !prev[mentor.id] }))}
                    className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-red-100">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Tuition Status Modal */}
      {tuitionModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setTuitionModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Mentors — Found a Student?</h3>
              <button onClick={() => setTuitionModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            {/* Filter tabs */}
            <div className="px-6 pt-3 flex gap-2">
              {[['all','All'],['yes','Yes ✓'],['no','No ✗'],['unanswered','Not answered']].map(([val, lbl]) => (
                <button key={val} onClick={() => setTuitionFilter(val)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    tuitionFilter === val ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
                  }`}>{lbl}</button>
              ))}
            </div>
            <div className="overflow-y-auto px-6 py-4 space-y-2">
              {tuitionLoading ? (
                <p className="text-center text-gray-400 text-sm py-8">Loading…</p>
              ) : (() => {
                const filtered = tuitionList.filter(m =>
                  tuitionFilter === 'all' ? true :
                  tuitionFilter === 'yes' ? m.student_found === true :
                  tuitionFilter === 'no' ? m.student_found === false :
                  m.student_found === null
                );
                if (!filtered.length) return <p className="text-center text-gray-400 text-sm py-8">No mentors in this category.</p>;
                return filtered.map(m => (
                  <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {m.first_name.charAt(0)}{m.last_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{m.first_name} {m.last_name}</p>
                      <p className="text-gray-400 text-xs truncate">{m.email}</p>
                      {m.expertise && <p className="text-primary text-xs">{m.expertise}</p>}
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      m.student_found === true ? 'bg-green-100 text-green-700' :
                      m.student_found === false ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {m.student_found === true ? '✓ Yes' : m.student_found === false ? '✗ No' : 'Pending'}
                    </span>
                  </div>
                ));
              })()}
            </div>
            <div className="px-6 py-3 border-t border-gray-100">
              <button onClick={() => setTuitionModal(false)} className="w-full border border-gray-200 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Mentor Detail Modal */}
      {viewMentor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewMentor(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Mentor Profile</h3>
              <button onClick={() => setViewMentor(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="overflow-y-auto px-6 py-4 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {viewMentor.first_name?.charAt(0)}{viewMentor.last_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">{viewMentor.first_name} {viewMentor.last_name}</p>
                  <p className="text-gray-500 text-xs">{viewMentor.email}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <DetailRow label="Expertise" value={viewMentor.expertise} />
                <DetailRow label="Experience" value={viewMentor.experience_years ? `${viewMentor.experience_years} years` : null} />
                <DetailRow label="Hourly Rate" value={viewMentor.hourly_rate ? `₹${viewMentor.hourly_rate}` : null} />
                <DetailRow label="Monthly Rate" value={viewMentor.monthly_rate ? `₹${viewMentor.monthly_rate}` : null} />
                <DetailRow label="City" value={viewMentor.city} />
                <DetailRow label="University" value={viewMentor.university} />
                <DetailRow label="Education" value={viewMentor.education} />
                <DetailRow label="Age" value={viewMentor.age?.toString()} />
                <DetailRow label="Gender" value={viewMentor.gender} />
                <DetailRow label="Instagram" value={viewMentor.instagram_url} />
                <DetailRow label="Facebook" value={viewMentor.facebook_url} />
                <DetailRow label="Profile Photo" value={viewMentor.profile_photo_url} />
                <DetailRow label="Resume URL" value={viewMentor.resume_url} />
                {viewMentor.bio && (
                  <div>
                    <p className="font-medium text-gray-500 mb-0.5">Bio</p>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-2 leading-relaxed">{viewMentor.bio}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-3 border-t border-gray-100">
              <button onClick={() => setViewMentor(null)} className="w-full border border-gray-200 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
