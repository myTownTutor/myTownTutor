import React, { useState, useEffect } from 'react';
import api from '../services/api';

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  read:    'bg-blue-50 text-blue-700 border-blue-200',
  replied: 'bg-green-50 text-green-700 border-green-200',
};

const ViewAllContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => { fetchContacts(); }, [currentPage, statusFilter, search]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, search, status: statusFilter !== 'all' ? statusFilter : '' };
      const res = await api.get('/admin/contacts', { params });
      setContacts(res.data.contacts || []);
      setTotalPages(res.data.pages || 1);
    } catch { setError('Failed to load contacts'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">All Contacts</h1>
        <p className="text-gray-500 text-sm">All student-to-mentor contact requests on the platform</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 flex flex-wrap gap-3">
        <input type="text" placeholder="Search student or mentor name…" value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading…</div>
        ) : contacts.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">No contacts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Student', 'Mentor', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contacts.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-sm">{c.student_name || '—'}</p>
                      <p className="text-gray-400 text-xs">{c.student_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-sm">{c.mentor_name || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[c.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {c.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedContact(c)} className="text-xs text-primary hover:underline font-medium">
                        View
                      </button>
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

      {/* Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedContact(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Contact Details</h3>
              <button onClick={() => setSelectedContact(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-2 text-sm mb-4">
              {[
                ['Student', selectedContact.student_name],
                ['Student Email', selectedContact.student_email],
                ['Phone', selectedContact.student_phone],
                ['Mentor', selectedContact.mentor_name],
                ['Status', selectedContact.status],
                ['Date', selectedContact.created_at ? new Date(selectedContact.created_at).toLocaleString() : null],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="font-medium text-gray-500 w-32 flex-shrink-0">{k}</span>
                  <span className="text-gray-800">{v}</span>
                </div>
              ))}
            </div>
            {selectedContact.message && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Message</p>
                <p className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed">{selectedContact.message}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllContacts;
