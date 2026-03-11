import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SECTIONS = ['Personal', 'Education', 'Professional', 'Social Media'];

const MentorProfileSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('pending_payment');
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [formData, setFormData] = useState({
    age: '', gender: '', city: '', bio: '',
    university: '', education: '',
    expertise: '', experience_years: '', hourly_rate: '', monthly_rate: '',
    instagram_url: '', facebook_url: '', profile_photo_url: '', resume_url: '',
  });

  useEffect(() => {
    api.get('/mentors/profile')
      .then(r => {
        if (r.data) {
          setFormData(prev => ({ ...prev, ...r.data }));
          if (r.data.approval_status) setApprovalStatus(r.data.approval_status);
        }
      })
      .catch(() => {})
      .finally(() => setFetchLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validate required fields per section; returns error string or ''
  const validateSection = (sectionIndex) => {
    if (sectionIndex === 0) {
      if (!formData.age) return 'Age is required.';
      if (!formData.gender) return 'Gender is required.';
      if (!formData.city.trim()) return 'City is required.';
    }
    if (sectionIndex === 2) {
      if (!formData.expertise.trim()) return 'Expertise / Field is required.';
    }
    return '';
  };

  const validateAll = () => {
    const err0 = validateSection(0);
    if (err0) { setActiveSection(0); return err0; }
    const err2 = validateSection(2);
    if (err2) { setActiveSection(2); return err2; }
    return '';
  };

  const goToSection = (index) => {
    setError('');
    setSuccess('');
    setActiveSection(index);
  };

  const handleNext = () => {
    const err = validateSection(activeSection);
    if (err) { setError(err); return; }
    setError('');
    setSuccess('');
    setActiveSection(p => p + 1);
  };

  const handleBack = () => {
    setError('');
    setSuccess('');
    setActiveSection(p => p - 1);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Image is too large. Please select an image under 2 MB.');
      e.target.value = '';
      return;
    }
    setPhotoError('');
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await api.post('/mentors/upload-photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData(prev => ({ ...prev, profile_photo_url: res.data.url }));
    } catch {
      setPhotoError('Photo upload failed. Please try again.');
      setPhotoPreview('');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSubmit = async () => {
    const validationErr = validateAll();
    if (validationErr) { setError(validationErr); return; }
    setError(''); setSuccess(''); setLoading(true);
    try {
      await api.put('/mentors/profile', formData);
      if (approvalStatus === 'pending_payment') {
        setSuccess('Profile saved! Redirecting to payment…');
        setTimeout(() => navigate('/payment'), 1500);
      } else {
        setSuccess('Profile updated successfully!');
        setTimeout(() => navigate('/mentor-dashboard'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-primary transition";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  const reqStar = <span className="text-red-500 ml-0.5">*</span>;

  const sectionContent = [
    /* Personal */
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label className={labelCls}>Age {reqStar}</label>
        <input type="number" name="age" value={formData.age} onChange={handleChange} min="18" max="80" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Gender {reqStar}</label>
        <select name="gender" value={formData.gender} onChange={handleChange} className={inputCls}>
          <option value="">Select…</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>City {reqStar}</label>
        <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" className={inputCls} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Bio</label>
        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4}
          placeholder="Tell students about yourself, your journey, and how you can help…"
          className={inputCls + " resize-none"} />
      </div>
    </div>,
    /* Education */
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label className={labelCls}>University</label>
        <input type="text" name="university" value={formData.university} onChange={handleChange} placeholder="e.g. IIT Delhi" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Education Level</label>
        <input type="text" name="education" value={formData.education} onChange={handleChange} placeholder="e.g. B.Tech, MBA" className={inputCls} />
      </div>
    </div>,
    /* Professional */
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label className={labelCls}>Expertise / Field {reqStar}</label>
        <input type="text" name="expertise" value={formData.expertise} onChange={handleChange}
          placeholder="e.g. Full Stack Development, Data Science" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Years of Experience</label>
        <input type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} min="0" placeholder="5" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Hourly Rate (₹)</label>
        <input type="number" name="hourly_rate" value={formData.hourly_rate} onChange={handleChange} min="0" placeholder="500" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Monthly Rate (₹)</label>
        <input type="number" name="monthly_rate" value={formData.monthly_rate} onChange={handleChange} min="0" placeholder="5000" className={inputCls} />
      </div>
    </div>,
    /* Social */
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label className={labelCls}>Instagram URL</label>
        <input type="text" name="instagram_url" value={formData.instagram_url} onChange={handleChange}
          placeholder="https://instagram.com/you" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Facebook URL</label>
        <input type="text" name="facebook_url" value={formData.facebook_url} onChange={handleChange}
          placeholder="https://facebook.com/you" className={inputCls} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Profile Photo</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
            {photoPreview || formData.profile_photo_url ? (
              <img src={photoPreview || formData.profile_photo_url} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">📷</span>
            )}
          </div>
          <div className="flex-1">
            <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              {photoUploading ? 'Uploading…' : '📁 Choose Photo'}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={photoUploading} />
            </label>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF or WebP — max 2 MB</p>
            {photoError && <p className="text-xs text-red-500 mt-1">{photoError}</p>}
          </div>
        </div>
      </div>
      <div>
        <label className={labelCls}>Resume URL</label>
        <input type="text" name="resume_url" value={formData.resume_url} onChange={handleChange}
          placeholder="https://drive.google.com/…" className={inputCls} />
      </div>
    </div>,
  ];

  if (fetchLoading) return <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 sm:px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Edit tutor Profile</h1>
        <p className="text-gray-500 text-sm">Fill in your details to get discovered by students</p>
      </div>

      {/* Section tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {SECTIONS.map((s, i) => (
            <button type="button" key={s} onClick={() => goToSection(i)}
              className={`flex-1 min-w-[72px] py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeSection === i ? 'border-b-2 border-primary text-primary bg-green-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              {s}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          <div key={activeSection}>
            {sectionContent[activeSection]}
          </div>

          {error && <div className="error-message mt-4">{error}</div>}
          {success && <div className="success-message mt-4">{success}</div>}

          <div className="flex gap-3 mt-6">
            {activeSection > 0 && (
              <button type="button" onClick={handleBack}
                className="px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50">
                ← Back
              </button>
            )}
            {activeSection < SECTIONS.length - 1 ? (
              <button type="button" onClick={handleNext}
                className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors">
                Next →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors">
                {loading ? 'Saving…' : '💾 Save Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfileSetup;
