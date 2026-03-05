import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MyChats = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchConversations();
    // Poll for new messages every 10 s
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data.conversations || []);
    } catch {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const otherName = (conv) =>
    user?.role === 'mentor' ? conv.student_name : conv.mentor_name;

  const otherInitial = (conv) => otherName(conv)?.charAt(0) ?? '?';

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Chats</h1>
          <p className="text-gray-500 text-sm">
            {user?.role === 'mentor' ? 'Conversations with students' : 'Your conversations with tutors'}
          </p>
        </div>
        {user?.role === 'student' && (
          <Link
            to="/browse-mentors"
            className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            + New Chat
          </Link>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>
      ) : conversations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-3xl mb-3">💬</p>
          <p className="text-gray-500 text-sm font-medium mb-1">No conversations yet</p>
          {user?.role === 'student' && (
            <Link
              to="/browse-mentors"
              className="inline-block mt-3 bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Browse Tutors
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              to={`/chat/${conv.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {otherInitial(conv)}
                </div>
                {conv.unread_count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {conv.unread_count > 9 ? '9+' : conv.unread_count}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                    {otherName(conv)}
                  </p>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {timeAgo(conv.last_message_at)}
                  </span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${conv.unread_count > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                  {conv.last_message ?? 'No messages yet'}
                </p>
              </div>

              {/* Chevron */}
              <span className="text-gray-300 text-sm flex-shrink-0">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyChats;
