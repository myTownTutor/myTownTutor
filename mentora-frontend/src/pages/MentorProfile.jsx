import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import api from '../services/api';

const Divider = () => <hr className="border-gray-100 my-4" />;

const InfoItem = ({ label, value }) => value ? (
  <div>
    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</dt>
    <dd className="mt-0.5 text-sm text-gray-800">{value}</dd>
  </div>
) : null;

const MentorProfile = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchMentor(); }, [mentorId]);

  const fetchMentor = async () => {
    try {
      const response = await api.get(`/mentors/${mentorId}`);
      setMentor(response.data);
    } catch { setError('Failed to load mentor profile'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="text-center py-20 text-sm text-gray-400">Loading profile…</div>;
  if (error) return <div className="text-center py-20 text-sm text-red-500">{error}</div>;
  if (!mentor) return <div className="text-center py-20 text-sm text-gray-400">Mentor not found</div>;

  const initials = `${mentor.first_name?.charAt(0) ?? ''}${mentor.last_name?.charAt(0) ?? ''}`;

  const ContactBtn = ({ full }) => {
    const cls = `flex items-center justify-center bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors ${full ? 'w-full py-3' : 'px-5 py-2.5'}`;
    if (isAuthenticated && user?.role === 'student') {
      return <Link to={`/contact-mentor/${mentorId}`} className={cls}>Contact Tutor</Link>;
    }
    if (!isAuthenticated) {
      return <button onClick={() => navigate('/login')} className={cls}>Log in to Contact</button>;
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <SEO
        title={`${mentor.first_name} ${mentor.last_name} – ${mentor.expertise || 'Tutor'}`}
        description={mentor.bio ? mentor.bio.slice(0, 155) : `Connect with ${mentor.first_name} ${mentor.last_name}, an experienced tutor${mentor.city ? ` in ${mentor.city}` : ''} on myTown Tutor.`}
        url={`/mentor/${mentorId}`}
        image={mentor.profile_photo_url || undefined}
        type="profile"
      />
      {/* Breadcrumb */}
      <button onClick={() => navigate(-1)} className="text-xs text-gray-400 hover:text-gray-600 mb-5 flex items-center gap-1">
        ← Back
      </button>

      <div className="grid lg:grid-cols-3 gap-5 items-start">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Identity card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              {mentor.profile_photo_url ? (
                <img src={mentor.profile_photo_url} alt={mentor.first_name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-gray-200" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-900 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                  {initials}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  {mentor.first_name} {mentor.last_name}
                </h1>
                {mentor.expertise && (
                  <p className="text-sm text-gray-500 mt-0.5">{mentor.expertise}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                  {mentor.city && <span>{mentor.city}</span>}
                  {mentor.university && <><span className="text-gray-300">|</span><span>{mentor.university}</span></>}
                  {mentor.experience_years && <><span className="text-gray-300">|</span><span>{mentor.experience_years}+ yrs exp</span></>}
                </div>
              </div>

              {/* Desktop CTA */}
              <div className="hidden sm:block flex-shrink-0">
                <ContactBtn />
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="mt-4 sm:hidden">
              <ContactBtn full />
            </div>
          </div>

          {/* About */}
          {mentor.bio && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{mentor.bio}</p>
            </div>
          )}

          {/* Background */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Background</h2>
            <dl className="grid sm:grid-cols-2 gap-4">
              <InfoItem label="University" value={mentor.university} />
              <InfoItem label="Education" value={mentor.education} />
              <InfoItem label="City" value={mentor.city} />
              <InfoItem label="Gender" value={mentor.gender} />
              <InfoItem label="Age" value={mentor.age} />
              <InfoItem label="Experience" value={mentor.experience_years ? `${mentor.experience_years}+ years` : null} />
            </dl>
          </div>

          {/* Resume */}
          {mentor.resume_url && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Documents</h2>
              <a href={mentor.resume_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                View Resume / CV ↗
              </a>
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">

          {/* Contact card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 lg:sticky lg:top-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Get in touch</h2>
            <p className="text-xs text-gray-400 mb-4">Send an enquiry directly to this tutor.</p>
            
            {(mentor.hourly_rate || mentor.monthly_rate) && (
              <>
                <Divider />
                <div className="space-y-2">
                  {mentor.hourly_rate && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Hourly</span>
                      <span className="text-sm font-semibold text-gray-800">₹{mentor.hourly_rate}</span>
                    </div>
                  )}
                  {mentor.monthly_rate && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Monthly</span>
                      <span className="text-sm font-semibold text-gray-800">₹{mentor.monthly_rate}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Expertise */}
          {mentor.expertise && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Expertise</h2>
              <div className="flex flex-wrap gap-1.5">
                {mentor.expertise.split(',').map(tag => (
                  <span key={tag.trim()} className="border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-600 bg-gray-50">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social */}
          {(mentor.instagram_url || mentor.facebook_url) && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Social</h2>
              <div className="space-y-2">
                {mentor.instagram_url && (
                  <a href={mentor.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Instagram <span className="text-gray-400 text-xs">↗</span>
                  </a>
                )}
                {mentor.facebook_url && (
                  <a href={mentor.facebook_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Facebook <span className="text-gray-400 text-xs">↗</span>
                  </a>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MentorProfile;
