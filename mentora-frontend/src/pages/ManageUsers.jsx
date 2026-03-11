import React, { useState, useEffect } from 'react';
import api from '../services/api';

const roleBadge = { admin: 'bg-purple-100 text-purple-700', mentor: 'bg-green-100 text-green-700', student: 'bg-green-100 text-green-700' };
const statusBadge = { approved: 'bg-green-100 text-green-700', pending_approval: 'bg-yellow-100 text-yellow-700', pending_payment: 'bg-orange-100 text-orange-700', rejected: 'bg-red-100 text-red-700' };
const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-primary transition";

const DetailRow = ({ label, value }) =>
  value ? <div className="flex gap-2"><span className="font-medium text-gray-500 w-36 flex-shrink-0">{label}</span><span className="text-gray-800 break-all">{value}</span></div> : null;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewUser, setViewUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, [currentPage, roleFilter, search, showDeleted]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, search, role: roleFilter !== 'all' ? roleFilter : '', show_deleted: showDeleted ? 'true' : 'false' };
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.users || []);
      setTotalPages(res.data.pages || 1);
    } catch { setError('Failed to load users'); }
    finally { setLoading(false); }
  };

  const openEdit = (user) => { setEditUser(user); setEditForm({ ...user }); };

  const openView = async (user) => {
    setViewUser(user);
    setProfileData(null);
    setProfileLoading(true);
    try {
      const res = await api.get(`/admin/users/${user.id}/details`);
      setProfileData(res.data);
    } catch { setProfileData(user); }
    finally { setProfileLoading(false); }
  };

  const saveEdit = async () => {
    setActionLoading(true); setError(''); setSuccess('');
    try {
      await api.put(`/admin/users/${editUser.id}`, editForm);
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...editForm } : u));
      setSuccess('User updated'); setEditUser(null);
    } catch { setError('Failed to update user'); }
    finally { setActionLoading(false); }
  };

  const deleteUser = async () => {
    setActionLoading(true); setError('');
    try {
      await api.delete(`/admin/users/${deleteConfirm.id}`);
      setUsers(prev => prev.filter(u => u.id !== deleteConfirm.id));
      setDeleteConfirm(null); setSuccess('User archived successfully');
    } catch { setError('Failed to archive user'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-gray-500 text-sm">View, edit, and archive platform users</p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => { setShowDeleted(false); setCurrentPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              !showDeleted ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Active Users
          </button>
          <button
            onClick={() => { setShowDeleted(true); setCurrentPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              showDeleted ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Deleted Accounts
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 flex flex-wrap gap-3">
        <input type="text" placeholder="Search by name or email…" value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-100" />
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-100">
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="mentor">Mentors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading…</div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Role', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{user.first_name} {user.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {showDeleted && user.original_email ? (
                        <span title={`Archived email: ${user.email}`}>{user.original_email} <span className="text-red-400">(archived)</span></span>
                      ) : user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge[user.role] || 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openView(user)} className="text-xs text-primary hover:underline font-medium">View</button>
                        {!showDeleted && (
                          <>
                            <button onClick={() => openEdit(user)} className="text-xs text-gray-600 hover:text-primary hover:underline font-medium">Edit</button>
                            <button onClick={() => setDeleteConfirm(user)} className="text-xs text-red-500 hover:underline font-medium">Archive</button>
                          </>
                        )}
                        {showDeleted && user.deleted_at && (
                          <span className="text-xs text-gray-400">Deleted {new Date(user.deleted_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">← Prev</button>
          <span className="text-sm text-gray-500">{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">Next →</button>
        </div>
      )}

      {/* View Modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">User Profile</h3>
              <button onClick={() => setViewUser(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-4 text-sm">
              {profileLoading ? (
                <div className="py-10 text-center text-gray-400">Loading profile…</div>
              ) : (
                <>
                  {/* Basic info */}
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                      {viewUser.first_name?.charAt(0)}{viewUser.last_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base">{viewUser.first_name} {viewUser.last_name}</p>
                      <p className="text-gray-500 text-xs">{viewUser.email}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge[viewUser.role] || 'bg-gray-100 text-gray-600'}`}>{viewUser.role}</span>
                    </div>
                  </div>

                  {/* Mentor profile */}
                  {profileData?.mentor_profile && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 pb-1">Mentor Profile</h4>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[profileData.mentor_profile.approval_status] || 'bg-gray-100 text-gray-600'}`}>
                          {profileData.mentor_profile.approval_status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <DetailRow label="Expertise" value={profileData.mentor_profile.expertise} />
                        <DetailRow label="Experience" value={profileData.mentor_profile.experience_years ? `${profileData.mentor_profile.experience_years} years` : null} />
                        <DetailRow label="Hourly Rate" value={profileData.mentor_profile.hourly_rate ? `₹${profileData.mentor_profile.hourly_rate}` : null} />
                        <DetailRow label="Monthly Rate" value={profileData.mentor_profile.monthly_rate ? `₹${profileData.mentor_profile.monthly_rate}` : null} />
                        <DetailRow label="City" value={profileData.mentor_profile.city} />
                        <DetailRow label="University" value={profileData.mentor_profile.university} />
                        <DetailRow label="Education" value={profileData.mentor_profile.education} />
                        <DetailRow label="Age" value={profileData.mentor_profile.age?.toString()} />
                        <DetailRow label="Gender" value={profileData.mentor_profile.gender} />
                        <DetailRow label="Instagram" value={profileData.mentor_profile.instagram_url} />
                        <DetailRow label="Facebook" value={profileData.mentor_profile.facebook_url} />
                        <DetailRow label="Profile Photo" value={profileData.mentor_profile.profile_photo_url} />
                        <DetailRow label="Resume URL" value={profileData.mentor_profile.resume_url} />
                        {profileData.mentor_profile.rejection_reason && (
                          <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-xs text-red-700 mt-1">
                            <span className="font-semibold">Rejection Reason: </span>{profileData.mentor_profile.rejection_reason}
                          </div>
                        )}
                        {profileData.mentor_profile.bio && (
                          <div>
                            <p className="font-medium text-gray-500 mb-0.5">Bio</p>
                            <p className="text-gray-700 bg-gray-50 rounded-lg p-2 leading-relaxed">{profileData.mentor_profile.bio}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Student profile */}
                  {profileData?.student_profile && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 pb-1">Student Profile</h4>
                      <div className="space-y-1.5">
                        <DetailRow label="Headline" value={profileData.student_profile.headline} />
                        {profileData.student_profile.bio && (
                          <div>
                            <p className="font-medium text-gray-500 mb-0.5">Bio</p>
                            <p className="text-gray-700 bg-gray-50 rounded-lg p-2 leading-relaxed">{profileData.student_profile.bio}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* No profile note */}
                  {!profileData?.mentor_profile && !profileData?.student_profile && viewUser.role !== 'super_admin' && (
                    <p className="text-gray-400 text-xs italic">No detailed profile found for this user.</p>
                  )}

                  <DetailRow label="Joined" value={viewUser.created_at ? new Date(viewUser.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
                  {viewUser.is_deleted && (
                    <>
                      <DetailRow label="Original Email" value={viewUser.original_email} />
                      <DetailRow label="Deleted At" value={viewUser.deleted_at ? new Date(viewUser.deleted_at).toLocaleString('en-IN') : null} />
                      <div className="flex gap-2"><span className="font-medium text-gray-500 w-36 flex-shrink-0">Status</span><span className="text-red-500 font-semibold text-sm">Archived / Deleted</span></div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="px-6 py-3 border-t border-gray-100">
              <button onClick={() => setViewUser(null)} className="w-full border border-gray-200 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Edit User</h3>
              <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-3">
              {[['first_name', 'First Name', 'text'], ['last_name', 'Last Name', 'text'], ['email', 'Email', 'email']].map(([k, label, type]) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type={type} value={editForm[k] || ''} onChange={e => setEditForm(f => ({ ...f, [k]: e.target.value }))} className={inputCls} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select value={editForm.role || ''} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} className={inputCls}>
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditUser(null)} className="flex-1 border border-gray-200 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveEdit} disabled={actionLoading} className="flex-1 bg-primary text-white py-2 rounded-full text-sm font-semibold hover:bg-primary-dark disabled:opacity-50">
                {actionLoading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="font-bold text-gray-900 mb-2">Archive User?</h3>
            <p className="text-gray-500 text-sm mb-5">
              <strong>{deleteConfirm.first_name} {deleteConfirm.last_name}</strong>'s account will be soft-deleted and archived.
              Their data is preserved for admin review.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={deleteUser} disabled={actionLoading} className="flex-1 bg-red-500 text-white py-2 rounded-full text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                {actionLoading ? 'Archiving…' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
