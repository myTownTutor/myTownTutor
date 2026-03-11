import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const statusColors = {
  sent:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  read:     'bg-green-50 text-green-700 border-blue-200',
  replied:  'bg-green-50 text-green-700 border-green-200',
};

const MyContacts = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchContacts();
  }, [currentPage, isAuthenticated]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students/contacts', { params: { page: currentPage } });
      setContacts(res.data.contacts || []);
      setTotalPages(res.data.pages || 1);
    } catch (e) { setError('Failed to load contacts'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Contacts</h1>
          <p className="text-gray-500 text-sm">Mentors you have reached out to</p>
        </div>
        <Link to="/browse-mentors" className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors">
          + Contact a Mentor
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>
      ) : contacts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-400 text-sm mb-4">You haven't contacted any mentors yet.</p>
          <Link to="/browse-mentors" className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors">
            Browse Mentors
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {contacts.map(contact => (
              <div key={contact.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {contact.mentor_name ? contact.mentor_name.charAt(0) : 'M'}
                    </div>
                    <div className="min-w-0">
                      <Link to={`/mentor/${contact.mentor_id}`} className="font-semibold text-gray-900 hover:text-primary text-sm">
                        {contact.mentor_name || 'Mentor'}
                      </Link>
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{contact.message}</p>
                      {contact.student_phone && <p className="text-gray-400 text-xs mt-1">📞 {contact.student_phone}</p>}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[contact.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {contact.status || 'pending'}
                    </span>
                    {contact.created_at && (
                      <span className="text-gray-400 text-xs">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                ← Previous
              </button>
              <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyContacts;
