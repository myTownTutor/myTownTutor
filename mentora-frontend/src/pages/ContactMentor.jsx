import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ContactMentor = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mentorLoading, setMentorLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    api.get(`/mentors/${mentorId}`)
      .then(r => setMentor(r.data))
      .catch(() => setError('Failed to load mentor'))
      .finally(() => setMentorLoading(false));
  }, [mentorId, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!message.trim()) return setError('Message is required');
    setLoading(true);
    try {
      const res = await api.post('/chat/conversations', {
        mentor_id: parseInt(mentorId),
        message: message.trim(),
      });
      // Redirect straight into the chat
      navigate(`/chat/${res.data.conversation.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start conversation');
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-primary transition";

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-primary flex items-center gap-1">
        ← Back
      </button>

      {/* Mentor preview */}
      {!mentorLoading && mentor && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
            {mentor.first_name.charAt(0)}{mentor.last_name.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{mentor.first_name} {mentor.last_name}</h2>
            {mentor.expertise && <p className="text-primary text-sm">{mentor.expertise}</p>}
            {mentor.city && <p className="text-gray-400 text-xs">📍 {mentor.city}</p>}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Start a Chat</h1>
        <p className="text-gray-500 text-sm mb-5">
          Send your first message to open a conversation with this mentor. You can continue chatting back and forth in the chat window.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              placeholder="Hi, I'm looking for guidance in… I would love to learn about…"
              className={inputCls + ' resize-none'}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-full font-semibold text-sm hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {loading ? 'Opening chat…' : 'Start Conversation →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactMentor;

