import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const statusColors = {
  sent:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  read:     'bg-green-50 text-green-700 border-blue-200',
  replied:  'bg-green-50 text-green-700 border-green-200',
};

const ViewEnquiries = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchEnquiries();
  }, [currentPage, filter, isAuthenticated]);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage };
      if (filter !== 'all') params.status = filter;
      const res = await api.get('/mentors/enquiries', { params });
      setEnquiries(res.data.enquiries || []);
      setTotalPages(res.data.pages || 1);
    } catch (e) { setError('Failed to load enquiries'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      const endpoint = status === 'replied'
        ? `/mentors/enquiries/${id}/mark-replied`
        : `/mentors/enquiries/${id}/mark-read`;
      await api.post(endpoint);
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      if (selectedEnquiry?.id === id) setSelectedEnquiry(prev => ({ ...prev, status }));
    } catch (e) { setError('Failed to update status'); }
  };

  const openModal = async (enquiry) => {
    setSelectedEnquiry(enquiry);
    if (enquiry.status === 'pending' || enquiry.status === 'sent') await updateStatus(enquiry.id, 'read');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Student Enquiries</h1>
          <p className="text-gray-500 text-sm">Messages from students interested in mentoring</p>
        </div>
        {/* Filter */}
        <select value={filter} onChange={e => { setFilter(e.target.value); setCurrentPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-100">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>
      ) : enquiries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
          No enquiries found.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {enquiries.map(enq => (
              <div key={enq.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow ${enq.status === 'pending' || enq.status === 'sent' ? 'border-l-4 border-l-yellow-400' : ''}`}
                onClick={() => openModal(enq)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {enq.student_name ? enq.student_name.charAt(0) : 'S'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{enq.student_name || 'Student'}</p>
                      <p className="text-gray-400 text-xs">{enq.student_email}</p>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-1">{enq.message}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[enq.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {enq.status || 'pending'}
                    </span>
                    {enq.created_at && <span className="text-gray-400 text-xs">{new Date(enq.created_at).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">← Previous</button>
              <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}

      {/* Message Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEnquiry(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">{selectedEnquiry.student_name}</h3>
                <p className="text-gray-400 text-xs">{selectedEnquiry.student_email}</p>
                {selectedEnquiry.student_phone && <p className="text-gray-400 text-xs">📞 {selectedEnquiry.student_phone}</p>}
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 leading-relaxed mb-4">{selectedEnquiry.message}</p>
            {selectedEnquiry.status !== 'replied' && (
              <button onClick={() => updateStatus(selectedEnquiry.id, 'replied')}
                className="w-full bg-green-600 text-white py-2.5 rounded-full text-sm font-semibold hover:bg-green-700 transition-colors">
                ✓ Mark as Replied
              </button>
            )}
            {selectedEnquiry.status === 'replied' && (
              <p className="text-center text-green-600 text-sm font-medium">✓ Marked as replied</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewEnquiries;
