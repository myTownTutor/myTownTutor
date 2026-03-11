import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ChatBox = () => {
  const { conversationId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadMessages();
    // Poll every 4 s for new messages
    pollRef.current = setInterval(pollMessages, 4000);
    return () => clearInterval(pollRef.current);
  }, [conversationId, isAuthenticated]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await api.get(`/chat/conversations/${conversationId}`);
      setConversation(res.data.conversation);
      setMessages(res.data.messages || []);
    } catch {
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  // Silent poll — only add new messages, don't re-render the whole list
  const pollMessages = async () => {
    try {
      const res = await api.get(`/chat/conversations/${conversationId}`);
      setMessages(res.data.messages || []);
    } catch { /* silent */ }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;

    setSending(true);
    setInput('');

    // Optimistic update
    const optimistic = {
      id: `opt-${Date.now()}`,
      sender_id: user.id,
      sender_name: `${user.first_name} ${user.last_name}`,
      sender_role: user.role,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
      optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await api.post(`/chat/conversations/${conversationId}/messages`, { content });
      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? res.data.message : m))
      );
    } catch {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(content); // restore text
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const otherName = () => {
    if (!conversation) return '…';
    return user?.role === 'mentor' ? conversation.student_name : conversation.mentor_name;
  };

  const isOwnMessage = (msg) => msg.sender_id === user?.id;

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const date = formatDate(msg.created_at);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>
      {/* ── Header ── */}
      <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate('/my-chats')}
          className="text-gray-400 hover:text-primary text-lg leading-none mr-1"
          title="Back"
        >
          ←
        </button>
        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          {otherName().charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{otherName()}</p>
          <p className="text-xs text-gray-400">
            {user?.role === 'mentor' ? 'Student' : 'Mentor'}
          </p>
        </div>
        {conversation && user?.role === 'student' && (
          <Link
            to={`/mentor/${conversation.mentor_id}`}
            className="text-xs text-primary hover:underline"
          >
            View Profile
          </Link>
        )}
      </div>

      {error && (
        <div className="mx-0 error-message rounded-none border-x border-gray-200 text-xs">
          {error}
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto bg-gray-50 border-x border-gray-200 px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-10">
            No messages yet. Say hello! 👋
          </div>
        )}

        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">{date}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {msgs.map((msg) => {
              const own = isOwnMessage(msg);
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 mb-2 ${own ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar (other side only) */}
                  {!own && (
                    <div className="w-7 h-7 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mb-0.5">
                      {msg.sender_name?.charAt(0)}
                    </div>
                  )}

                  {/* Bubble */}
                  <div className={`max-w-[72%] group`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        own
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                      } ${msg.optimistic ? 'opacity-70' : ''}`}
                    >
                      {msg.content}
                    </div>
                    <p className={`text-xs text-gray-400 mt-0.5 ${own ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.created_at)}
                      {own && !msg.optimistic && (
                        <span className="ml-1">{msg.is_read ? '✓✓' : '✓'}</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 px-4 py-3 flex-shrink-0">
        <form onSubmit={sendMessage} className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 resize-none overflow-hidden px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-primary transition"
            style={{ lineHeight: '1.4', maxHeight: '100px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-dark disabled:opacity-40 transition-colors flex-shrink-0"
            title="Send"
          >
            {sending ? (
              <span className="animate-spin text-xs">⟳</span>
            ) : (
              <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          Press <kbd className="bg-gray-100 px-1 py-0.5 rounded text-xs">Enter</kbd> to send · <kbd className="bg-gray-100 px-1 py-0.5 rounded text-xs">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
};

export default ChatBox;
