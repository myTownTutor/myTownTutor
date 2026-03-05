import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [counters, setCounters] = useState({ students: 0, mentors: 0, sessions: 0, success: 0 });
  const TYPEWRITER_TEXT = 'Find Your Perfect Tutor...';
  const [displayed, setDisplayed] = useState('');
  const [twDone, setTwDone] = useState(false);
  const [twCycle, setTwCycle] = useState(0);

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    setTwDone(false);
    const interval = setInterval(() => {
      i++;
      setDisplayed(TYPEWRITER_TEXT.slice(0, i));
      if (i >= TYPEWRITER_TEXT.length) {
        clearInterval(interval);
        setTwDone(true);
        setTimeout(() => setTwCycle(c => c + 1), 2000);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [twCycle]);

  useEffect(() => {
    fetchRandomMentors();
    animateCounters();
  }, []);

  const fetchRandomMentors = async () => {
    try {
      const response = await api.get('/mentors/approved?page=1');
      const allMentors = response.data.mentors || [];
      const shuffled = [...allMentors].sort(() => Math.random() - 0.5).slice(0, 4);
      setMentors(shuffled);
    } catch (error) { console.log('Error fetching mentors:', error); }
  };

  const animateCounters = () => {
    const targets = { students: 50, mentors: 10, sessions: 100, success: 90 };
    Object.keys(targets).forEach(key => {
      let current = 0;
      const target = targets[key];
      const increment = target / 50;
      const counter = setInterval(() => {
        current += increment;
        if (current >= target) { current = target; clearInterval(counter); }
        setCounters(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, 30);
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Hero Section ─────────────────────────────── */}
      <section className="hero-section -mx-4 -mt-4" style={{
        backgroundImage: `linear-gradient(135deg, rgba(248,249,250,0.7) 0%, rgba(232,240,254,0.7) 100%), url('/hero-animation.gif')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        minHeight: 'calc(100vh - 56px)'
      }}>
        <div className="hero-overlay">
          <div className="hero-left">
            <div className="hero-content">
              <h1 className="hero-title" style={{ color: 'black' }}>
                {displayed}
                {!twDone && <span className="typewriter-cursor">|</span>}
              </h1>
              <p className="hero-subtitle"></p>
              <div className="hero-buttons">
                {!isAuthenticated ? (
                  <>
                    <Link to="/signup" className="btn btn-primary btn-lg">Be a Tutor</Link>
                    <Link to="/browse-mentors" className="btn btn-outline btn-lg">Find a Tutor</Link>
                  </>
                ) : user.role === 'student' ? (
                  <>
                    <Link to="/browse-mentors" className="btn btn-primary btn-lg">Find Your Tutor</Link>
                    <Link to="/student-dashboard" className="btn btn-outline btn-lg">Dashboard</Link>
                  </>
                ) : user.role === 'mentor' ? (
                  <Link to="/mentor-dashboard" className="btn btn-primary btn-lg">Your Dashboard</Link>
                ) : (
                  <Link to="/admin-dashboard" className="btn btn-primary btn-lg">Admin Panel</Link>
                )}
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-mission">
              
              <h3 className="mission-title">Why myTown Tutor</h3>
              <p className="text-gray-700 mb-3">• Finding the right tutor shouldn't be complicated.</p>
              <p className="text-gray-700 mb-3">• Too many students struggle to access the right guidance.</p>
              <p className="text-gray-700 mb-3">• Tutors deserve a platform to showcase their expertise.</p>
              <p className="text-gray-700 mb-3">• We bring both sides together in one simple, transparent space with no middlemen in learning</p>
              <p className="text-gray-700 mb-3">• One centralised place. Clear profiles. Direct connections.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">How It Works for Students</h2>
        <p className="text-gray-500 text-sm mb-4">Get guidance from experienced tutors in just a few simple steps</p>
        <div className="steps-grid">
          {[
            { n: 1, title: 'Create Profile', desc: 'Sign up or Login, you will need it to contact tutors' },
            { n: 2, title: 'Browse Tutors', desc: 'Explore profiles of tutors in your field' },
            { n: 3, title: 'Connect', desc: 'Send enquiry and get in touch with your tutor (sign up required)' },
            { n: 4, title: 'Learn & Grow', desc: 'Receive guidance and achieve your career goals' },
          ].map(s => (
            <div key={s.n} className="step-card">
              <div className="step-number">{s.n}</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{s.title}</h3>
              <p className="text-gray-500 text-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

{/* ── How It Works ─────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">How It Works for Mentors</h2>
        <p className="text-gray-500 text-sm mb-4">Get started in just a few simple steps</p>
        <div className="steps-grid">
          {[
            { n: 1, title: 'Create Profile', desc: 'Sign up and tell us about your experience and preferred subjects' },
            { n: 2, title: 'Payment', desc: 'Pay the required fees to be visible on the platform' },
            { n: 3, title: 'Connect', desc: 'Reply enquiry and get in touch with your student' },
            { n: 4, title: 'Teach & Inspire', desc: 'Provide guidance and help your students achieve their goals' },
          ].map(s => (
            <div key={s.n} className="step-card">
              <div className="step-number">{s.n}</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{s.title}</h3>
              <p className="text-gray-500 text-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>


      {/* ── Featured Mentors ──────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Meet Our Tutors</h2>
        <p className="text-gray-500 text-sm mb-4">Learn from the best in the industry</p>
        <div className="mentors-carousel">
          {mentors.length > 0 ? mentors.map(mentor => (
            <div key={mentor.id} className="mentor-card-home">
              <div className="avatar-circle">{mentor.first_name?.charAt(0).toUpperCase()}</div>
              <h3 className="font-semibold text-gray-900 text-sm">{mentor.first_name} {mentor.last_name}</h3>
              <p className="text-primary text-xs font-medium mt-0.5">{mentor.expertise || 'Expert Tutor'}</p>
              <p className="text-gray-400 text-xs mt-1">📍 {mentor.city || 'India'}</p>
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500">
                <span>⭐</span><span>{mentor.experience_years || 0}+ yrs</span>
              </div>
            </div>
          )) : <p className="text-gray-400 text-sm">Loading Tutors…</p>}
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────── */}
      <div className="bg-secondary rounded-xl p-6 ">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-black">
          {[
            { val: counters.students + '+', label: 'Students Found Tutors' },
            { val: counters.mentors + '+', label: 'Expert Tutors' },
            { val: counters.sessions + '+', label: 'Sessions Completed' },
            { val: counters.success + '%', label: 'Success Rate' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-bold">{s.val}</div>
              <div className="text-black-100 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reviews ───────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">What Students Say</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { text: '"MyTown Tutor helped me transition into tech. My tutor was incredibly supportive and guided me through every step!"', author: 'Adnan, Aligarh' },
            { text: '"Found amazing Tutors who believed in me. Got my promotion in 3 months with their guidance!"', author: 'Samiya, Aligarh' },
            { text: '"Best investment for my career. My tutor\'s insights were invaluable and helped me grow professionally."', author: 'Ayush, Aligarh' },
            { text: '"Highly recommended! The tutors are knowledgeable, responsive, and genuinely care about your growth."', author: 'Ahmad, Aligarh' },
          ].map((r, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-yellow-400 text-sm mb-2">★★★★★</div>
              <p className="text-gray-700 text-sm italic leading-relaxed">{r.text}</p>
              <p className="text-gray-400 text-xs mt-2">— {r.author}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────── */}
      {!isAuthenticated && (
        <div className="bg-white-900 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-black mb-2">Ready to Start Your Journey?</h2>
          <p className="text-black-400 mb-5 text-sm">Join hundreds of students learning from top tutors today</p>
          <Link to="/signup" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors">
            Sign Up Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
